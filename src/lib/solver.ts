/**
 * Solver / Auto-fill engine for ice cream recipe balancing.
 *
 * Implements De Giglio's 9-step balancing workflow:
 * 1. Choose type → target ranges
 * 2. Fix star ingredient (user-provided)
 * 3. Set fat level → derive dairy amounts
 * 4. Set SLNG → derive SMP amount
 * 5. Balance sugars for POD + PAC → derive sugar mix
 * 6. Add stabilizer
 * 7. Fill water to reach batch size
 * 8. Verify all parameters
 *
 * Also provides a suggestion engine for tuning existing recipes.
 */

import type { RecipeIngredient, IceCreamType, Range } from './types'
import { targetRanges } from './ranges'
import { calcBalance, resolveIngredients, calcSugarGrams } from './formulas'

// --- Suggestion engine ---

export interface Suggestion {
	action: 'add' | 'increase' | 'decrease' | 'replace'
	parameter: string // which parameter this fixes (pod, pac, ts, fat, etc.)
	description: string // German-language description
	ingredientId?: string
	category?: string
	grams?: number
	replaceIndex?: number
}

function mid (range: Range): number {
	return (range.min + range.max) / 2
}

/**
 * Generate suggestions for bringing out-of-range parameters into their target range.
 */
export function generateSuggestions (
	ingredients: RecipeIngredient[],
	type: IceCreamType,
	batchSize: number,
): Suggestion[] {
	const balance = calcBalance(ingredients)
	const ranges = targetRanges[type]
	const suggestions: Suggestion[] = []

	const hasCategory = (cat: string) => ingredients.some(i => i.category === cat)
	const totalGrams = balance.totalWeight

	// Check each parameter and suggest fixes
	if (balance.totalSolidsPercent < ranges.ts.min) {
		const deficit = (ranges.ts.min - balance.totalSolidsPercent) / 100 * batchSize
		suggestions.push({
			action: 'add',
			parameter: 'ts',
			description: `TS too low — ~${Math.round(deficit)}g more solids needed`,
		})
	}

	// POD too low → add sucrose
	if (balance.pod < ranges.pod.min) {
		const podDeficit = ranges.pod.min - balance.pod
		// sucrose: POD 100, so grams needed = podDeficit * 100 / 100 = podDeficit
		// but normalized to 1000g, so actual grams = podDeficit * (batchSize / 1000)
		const sucroseG = Math.round(podDeficit * batchSize / 1000)
		suggestions.push({
			action: 'add',
			parameter: 'pod',
			description: `POD too low — add ~${sucroseG}g sucrose (+${Math.round(podDeficit)} POD)`,
			ingredientId: 'sucrose',
			category: 'sugars',
			grams: sucroseG,
		})
	}

	// POD too high → replace sucrose with lower-POD sugar
	if (balance.pod > ranges.pod.max) {
		suggestions.push({
			action: 'replace',
			parameter: 'pod',
			description: `POD too high — partially replace sucrose with trehalose (POD 50) or maltodextrin (POD 30)`,
		})
	}

	// PAC too low → need more freezing point depression
	if (balance.pac < ranges.pac.min) {
		const pacDeficit = ranges.pac.min - balance.pac
		// dextrose: PAC 190, so grams = pacDeficit * 100 / 190 * (batchSize / 1000)
		const dextroseG = Math.round(pacDeficit * 100 / 190 * batchSize / 1000)
		suggestions.push({
			action: 'add',
			parameter: 'pac',
			description: `PAC too low (too hard) — add ~${dextroseG}g dextrose (+${Math.round(pacDeficit)} PAC)`,
			ingredientId: 'dextrose',
			category: 'sugars',
			grams: dextroseG,
		})
	}

	// PAC too high → too soft
	if (balance.pac > ranges.pac.max) {
		suggestions.push({
			action: 'replace',
			parameter: 'pac',
			description: `PAC too high (too soft) — replace dextrose/invert sugar with sucrose or trehalose`,
		})
	}

	// Fat too low (dairy-based types)
	if (balance.fatPercent < ranges.fat.min && ranges.fat.min > 0) {
		const fatDeficit = (ranges.fat.min - balance.fatPercent) / 100 * batchSize
		const creamG = Math.round(fatDeficit / 0.35) // cream is 35% fat
		suggestions.push({
			action: 'add',
			parameter: 'fat',
			description: `Fat too low — add ~${creamG}g cream 35%`,
			ingredientId: 'cream-35',
			category: 'dairy',
			grams: creamG,
		})
	}

	// SLNG too low (dairy-based types)
	if (balance.slngPercent < ranges.slng.min && ranges.slng.min > 0) {
		const slngDeficit = (ranges.slng.min - balance.slngPercent) / 100 * batchSize
		// SMP is ~97% solids, ~36% protein, ~52% lactose → ~97% SLNG
		const smpG = Math.round(slngDeficit / 0.97)
		suggestions.push({
			action: 'add',
			parameter: 'slng',
			description: `SLNG too low — add ~${smpG}g skim milk powder`,
			ingredientId: 'skim-milk-powder',
			category: 'dairy',
			grams: smpG,
		})
	}

	// SLNG exceeds lactose limit
	if (balance.slngPercent > balance.maxSlng) {
		suggestions.push({
			action: 'decrease',
			parameter: 'slng',
			description: `SLNG over lactose limit — reduce milk powder or replace milk with water`,
		})
	}

	// Stabilizer missing
	if (!hasCategory('stabilizers')) {
		const stabG = Math.round(batchSize * 0.003) // 0.3% default
		suggestions.push({
			action: 'add',
			parameter: 'stabilizer',
			description: `No stabilizer — ~${stabG}g stabilizer blend recommended`,
			ingredientId: 'lbg',
			category: 'stabilizers',
			grams: stabG,
		})
	}

	// Water to fill batch
	if (totalGrams < batchSize * 0.95) {
		const waterG = Math.round(batchSize - totalGrams)
		if (waterG > 0) {
			suggestions.push({
				action: 'add',
				parameter: 'water',
				description: `${waterG}g water to fill up to ${batchSize}g`,
				ingredientId: 'water',
				category: 'base',
				grams: waterG,
			})
		}
	}

	return suggestions
}

// --- Auto-fill solver ---

/**
 * Given a type, batch size, and "fixed" ingredients (star ingredient + any user-locked ones),
 * propose a complete recipe that targets the midpoint of all ranges.
 *
 * Strategy by type:
 * - Fruchtsorbet: no dairy needed, just sugars + stabilizer + water
 * - Dairy-based: milk as base liquid, cream for fat, SMP for SLNG, sugars, stabilizer
 */
export function autoFill (
	type: IceCreamType,
	batchSize: number,
	fixedIngredients: RecipeIngredient[],
): RecipeIngredient[] {
	const ranges = targetRanges[type]
	const result = [...fixedIngredients]

	// Calculate what the fixed ingredients already contribute
	const fixedBalance = calcBalance(fixedIngredients)
	const fixedWeight = fixedBalance.totalWeight

	// Target midpoints
	const targetFat = mid(ranges.fat)
	const targetSlng = mid(ranges.slng)
	const targetPod = mid(ranges.pod)
	const targetPac = mid(ranges.pac)
	const targetSugar = mid(ranges.sugar)

	// Grams already contributed
	const fixedFatG = fixedBalance.fatPercent / 100 * fixedWeight
	const fixedSlngG = fixedBalance.slngPercent / 100 * fixedWeight

	// --- Step 3: Fat from dairy (skip for sorbet) ---
	if (targetFat > 1) {
		// Use whole milk as base liquid + cream for fat
		// First, estimate how much milk we need (roughly 50-60% of batch for dairy types)
		const milkFraction = type === 'nusseis' ? 0.55 : type === 'schokoladeneis' ? 0.55 : 0.60
		const milkG = Math.round(batchSize * milkFraction)
		const milkFat = milkG * 0.035 // 3.5% fat
		const milkSlng = milkG * 0.089 // 8.9% SLNG

		// How much more fat do we need from cream?
		const fatNeeded = targetFat / 100 * batchSize - fixedFatG - milkFat
		const creamG = Math.max(0, Math.round(fatNeeded / 0.35)) // cream is 35% fat
		const creamSlng = creamG * 0.05 // cream has ~5% SLNG

		if (!hasIngredient(result, 'dairy', 'whole-milk-3.5')) {
			result.push({ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: milkG })
		}
		if (creamG > 5 && !hasIngredient(result, 'dairy', 'cream-35')) {
			result.push({ ingredientId: 'cream-35', category: 'dairy', grams: creamG })
		}

		// --- Step 4: SLNG from SMP ---
		const currentSlng = fixedSlngG + milkSlng + creamSlng
		const slngNeeded = targetSlng / 100 * batchSize - currentSlng
		if (slngNeeded > 2) {
			const smpG = Math.round(slngNeeded / 0.97) // SMP is ~97% SLNG
			if (!hasIngredient(result, 'dairy', 'skim-milk-powder')) {
				result.push({ ingredientId: 'skim-milk-powder', category: 'dairy', grams: smpG })
			}
		}
	}

	// --- Step 5: Sugar mix for POD + PAC targets ---
	const intermediateBalance = calcBalance(result)
	const currentPod = intermediateBalance.pod
	const currentPac = intermediateBalance.pac
	const currentSugarG = calcSugarGrams(resolveIngredients(result))

	const podNeeded = targetPod - currentPod
	const pacNeeded = targetPac - currentPac
	const sugarBudgetG = targetSugar / 100 * batchSize - currentSugarG

	if (sugarBudgetG > 5) {
		const sugarMix = solveSugarMix(sugarBudgetG, podNeeded, pacNeeded, batchSize)

		for (const [id, grams] of Object.entries(sugarMix)) {
			if (grams > 0.5 && !hasIngredient(result, 'sugars', id)) {
				result.push({ ingredientId: id, category: 'sugars', grams: Math.round(grams) })
			}
		}
	}

	// --- Step 6: Stabilizer ---
	if (!result.some(i => i.category === 'stabilizers')) {
		const stabG = Math.round(batchSize * 0.003)
		result.push({ ingredientId: 'lbg', category: 'stabilizers', grams: stabG })
	}

	// --- Step 7: Fill with water ---
	const currentWeight = result.reduce((sum, i) => sum + i.grams, 0)
	const waterNeeded = batchSize - currentWeight
	if (waterNeeded > 5) {
		const existingWater = result.findIndex(i => i.ingredientId === 'water')
		if (existingWater >= 0) {
			result[existingWater].grams += Math.round(waterNeeded)
		} else {
			result.push({ ingredientId: 'water', category: 'base', grams: Math.round(waterNeeded) })
		}
	}

	return result
}

/**
 * Solve the sugar mix problem:
 * Given a total sugar budget (grams), target POD contribution, and target PAC contribution,
 * find a mix of sucrose, dextrose, glucose syrup DE60, and maltodextrin DE19.
 *
 * Strategy:
 * 1. Start with all sucrose (POD 100, PAC 100)
 * 2. If PAC needs to be higher relative to POD → swap some sucrose for dextrose (PAC 190)
 * 3. If POD needs to be lower → swap some sucrose for glucose DE60 (POD 50) or maltodextrin (POD 30)
 * 4. Ensure minimum 60% sucrose for clean flavor
 */
function solveSugarMix (
	totalG: number,
	podTarget: number,
	pacTarget: number,
	batchSize: number,
): Record<string, number> {
	// Normalize targets to per-gram-of-sugar contribution
	// POD contribution per g of sugar at batchSize: pod_coeff / 100 * (1000/batchSize)
	const scale = 1000 / batchSize

	// If all sucrose: POD = totalG * scale * 100/100 = totalG * scale
	// PAC = same
	const allSucrosePac = totalG * scale

	let sucroseG = totalG
	let dextroseG = 0
	let glucoseDE60G = 0
	let maltodextrinG

	// If we need more PAC than sucrose alone provides, swap some for dextrose
	if (pacTarget > allSucrosePac * 1.05) {
		// Each gram swapped: PAC changes by (190 - 100) * scale / 100 = 0.9 * scale
		// POD changes by (75 - 100) * scale / 100 = -0.25 * scale
		const pacDeficit = pacTarget - allSucrosePac
		const pacPerGramSwap = (190 - 100) * scale / 100
		const dexSwap = Math.min(totalG * 0.15, Math.max(0, pacDeficit / pacPerGramSwap))
		dextroseG = dexSwap
		sucroseG -= dexSwap
	}

	// If POD still too high, swap some sucrose for glucose DE60
	const currentPod = (sucroseG * 100 + dextroseG * 75) * scale / 100
	if (podTarget > 0 && currentPod > podTarget * 1.15) {
		const podExcess = currentPod - podTarget
		const podPerGramSwap = (100 - 50) * scale / 100
		const glcSwap = Math.min(sucroseG * 0.2, Math.max(0, podExcess / podPerGramSwap))
		glucoseDE60G = glcSwap
		sucroseG -= glcSwap
	}

	// Add some maltodextrin for body if TS needs boosting (low POD/PAC impact)
	// Use about 5-8% of sugar budget as maltodextrin for most types
	const maltFraction = 0.05
	maltodextrinG = totalG * maltFraction
	sucroseG -= maltodextrinG

	// Ensure sucrose stays dominant (minimum 55%)
	const minSucrose = totalG * 0.55
	if (sucroseG < minSucrose) {
		const deficit = minSucrose - sucroseG
		// Reduce others proportionally
		const othersTotal = dextroseG + glucoseDE60G + maltodextrinG
		if (othersTotal > 0) {
			const factor = (othersTotal - deficit) / othersTotal
			dextroseG *= Math.max(0, factor)
			glucoseDE60G *= Math.max(0, factor)
			maltodextrinG *= Math.max(0, factor)
			sucroseG = minSucrose
		}
	}

	return {
		sucrose: Math.max(0, sucroseG),
		dextrose: Math.max(0, dextroseG),
		'glucose-syrup-de60': Math.max(0, glucoseDE60G),
		'maltodextrin-de19': Math.max(0, maltodextrinG),
	}
}

function hasIngredient (recipe: RecipeIngredient[], category: string, id: string): boolean {
	return recipe.some(i => i.category === category && i.ingredientId === id)
}
