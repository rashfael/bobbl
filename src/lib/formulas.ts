import type { Ingredient, IngredientCategory, RecipeIngredient, BalanceResult, Sugar, Dairy, ChocolateCocoa, Fruit, Alcohol } from './types'
import { findIngredient } from './ingredients'

// Resolved ingredient with its data and grams
export interface ResolvedIngredient {
	data: Ingredient
	category: IngredientCategory
	grams: number
	measuredBrix?: number
}

// Resolve recipe ingredients to their full data objects
export function resolveIngredients (items: RecipeIngredient[]): ResolvedIngredient[] {
	const resolved: ResolvedIngredient[] = []
	for (const item of items) {
		const data = findIngredient(item.category, item.ingredientId)
		if (data) {
			resolved.push({
				data,
				category: item.category,
				grams: item.grams,
				measuredBrix: item.measuredBrix,
			})
		}
	}
	return resolved
}

// --- Helper: get totalSolidsPercent for any ingredient ---

function getTotalSolidsPercent (ri: ResolvedIngredient): number {
	const d = ri.data as any
	if (d.totalSolidsPercent != null) return d.totalSolidsPercent
	// stabilizers are ~100% solids
	if (ri.category === 'stabilizers') return 100
	return 0
}

function getWaterPercent (ri: ResolvedIngredient): number {
	const d = ri.data as any
	if (d.waterPercent != null) return d.waterPercent
	return 100 - getTotalSolidsPercent(ri)
}

function getFatPercent (ri: ResolvedIngredient): number {
	const d = ri.data as any
	return d.fatPercent ?? 0
}

function getProteinPercent (ri: ResolvedIngredient): number {
	const d = ri.data as any
	return d.proteinPercent ?? 0
}

// --- Core calculation functions ---

// All formulas normalize to a 1000g basis for POD/PAC as per De Giglio convention

export function calcTotalSolids (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	let solids = 0
	for (const ri of ingredients) {
		solids += ri.grams * getTotalSolidsPercent(ri) / 100
	}
	return (solids / totalWeight) * 100
}

export function calcWaterPercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	let water = 0
	for (const ri of ingredients) {
		water += ri.grams * getWaterPercent(ri) / 100
	}
	return (water / totalWeight) * 100
}

export function calcFatPercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	let fat = 0
	for (const ri of ingredients) {
		fat += ri.grams * getFatPercent(ri) / 100
	}
	return (fat / totalWeight) * 100
}

// SLNG only comes from dairy products
export function calcSlngPercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	let slng = 0
	for (const ri of ingredients) {
		if (ri.category === 'dairy') {
			slng += ri.grams * (ri.data as Dairy).slngPercent / 100
		}
	}
	return (slng / totalWeight) * 100
}

export function calcProteinPercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	let protein = 0
	for (const ri of ingredients) {
		protein += ri.grams * getProteinPercent(ri) / 100
	}
	return (protein / totalWeight) * 100
}

// Total sugar grams from sugar-type ingredients + fruit sugars + chocolate sugars
export function calcSugarGrams (ingredients: ResolvedIngredient[]): number {
	let sugar = 0
	for (const ri of ingredients) {
		if (ri.category === 'sugars') {
			// sugar grams = weight × totalSolidsPercent (sugars are mostly dry matter)
			sugar += ri.grams * (ri.data as Sugar).totalSolidsPercent / 100
		} else if (ri.category === 'fruits') {
			// fruit sugars based on measured Brix or catalogue average
			const fruit = ri.data as Fruit
			const brix = ri.measuredBrix ?? fruit.brix.catalogueAvg
			sugar += ri.grams * brix / 100
		} else if (ri.category === 'chocolate-cocoa') {
			sugar += ri.grams * (ri.data as ChocolateCocoa).sugarPercent / 100
		} else if (ri.category === 'alcohol') {
			sugar += ri.grams * (ri.data as Alcohol).sugarPercent / 100
		}
	}
	return sugar
}

export function calcSugarPercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	return (calcSugarGrams(ingredients) / totalWeight) * 100
}

// Lactose comes from dairy via SLNG (lactose ≈ 54% of SLNG)
export function calcLactoseGrams (ingredients: ResolvedIngredient[]): number {
	let lactose = 0
	for (const ri of ingredients) {
		if (ri.category === 'dairy') {
			lactose += ri.grams * (ri.data as Dairy).lactosePercent / 100
		}
	}
	return lactose
}

export function calcLactosePercent (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	return (calcLactoseGrams(ingredients) / totalWeight) * 100
}

/**
 * POD (Potere Dolcificante / Suesskraft)
 *
 * For a 1000g batch: POD = sum(sugar_g × POD_coefficient) / 100
 * Dairy contributes via lactose: SLNG_g × 0.54 × 16 / 100
 * Fruits are treated as sucrose equivalent (POD 100) per De Giglio convention
 * Chocolate contributes its own POD value
 */
export function calcPod (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	const scale = 1000 / totalWeight // normalize to 1000g batch
	let pod = 0

	for (const ri of ingredients) {
		const g = ri.grams * scale

		if (ri.category === 'sugars') {
			const sugar = ri.data as Sugar
			const sugarSolids = g * sugar.totalSolidsPercent / 100
			pod += sugarSolids * sugar.pod / 100
		} else if (ri.category === 'dairy') {
			// Lactose contribution: SLNG_g × 0.54 (lactose fraction) × POD_lactose(16) / 100
			const d = ri.data as Dairy
			const slngG = g * d.slngPercent / 100
			pod += slngG * 0.54 * 16 / 100
		} else if (ri.category === 'fruits') {
			// Fruit sugars treated as sucrose equivalent (POD 100)
			const fruit = ri.data as Fruit
			const brix = ri.measuredBrix ?? fruit.brix.catalogueAvg
			const fruitSugarG = g * brix / 100
			pod += fruitSugarG * 100 / 100
		} else if (ri.category === 'chocolate-cocoa') {
			const choc = ri.data as ChocolateCocoa
			pod += g * choc.pod / 100
		}
		// alcohol sugar contribution is negligible for POD
	}

	return pod
}

/**
 * PAC (Potere Anti-Congelante / Gefrierpunktabsenkung)
 *
 * Same structure as POD but with PAC coefficients.
 * Dairy lactose: SLNG_g × 0.54 × PAC_lactose(100) / 100
 * Fruit sugars: sucrose equivalent (PAC 100)
 * Alcohol: ethanol_g × 790 / 100
 */
export function calcPac (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	const scale = 1000 / totalWeight
	let pac = 0

	for (const ri of ingredients) {
		const g = ri.grams * scale

		if (ri.category === 'sugars') {
			const sugar = ri.data as Sugar
			const sugarSolids = g * sugar.totalSolidsPercent / 100
			pac += sugarSolids * sugar.pac / 100
		} else if (ri.category === 'dairy') {
			const d = ri.data as Dairy
			const slngG = g * d.slngPercent / 100
			pac += slngG * 0.54 * 100 / 100
		} else if (ri.category === 'fruits') {
			const fruit = ri.data as Fruit
			const brix = ri.measuredBrix ?? fruit.brix.catalogueAvg
			const fruitSugarG = g * brix / 100
			pac += fruitSugarG * 100 / 100
		} else if (ri.category === 'chocolate-cocoa') {
			const choc = ri.data as ChocolateCocoa
			pac += g * choc.pac / 100
		} else if (ri.category === 'alcohol') {
			const alc = ri.data as Alcohol
			// ethanol contribution: ethanol_g × 790 / 100
			const ethanolG = g * alc.ethanolPercent / 100 * 0.789 // vol% → weight via density
			pac += ethanolG * 790 / 100
		}
	}

	return pac
}

/**
 * Maximum SLNG (De Giglio rule)
 * max_SLNG = (total_mix - sugars - fat - other_solids) × 15%
 */
export function calcMaxSlng (ingredients: ResolvedIngredient[], totalWeight: number): number {
	if (totalWeight === 0) return 0
	const sugarG = calcSugarGrams(ingredients)
	let fatG = 0
	let otherSolidsG = 0

	for (const ri of ingredients) {
		fatG += ri.grams * getFatPercent(ri) / 100
		if (ri.category === 'stabilizers') {
			otherSolidsG += ri.grams
		}
	}

	const available = totalWeight - sugarG - fatG - otherSolidsG
	return (available * 0.15 / totalWeight) * 100
}

/**
 * Calculate all balance parameters at once.
 */
export function calcBalance (recipeIngredients: RecipeIngredient[]): BalanceResult {
	const resolved = resolveIngredients(recipeIngredients)
	let totalWeight = 0
	for (const ri of resolved) {
		totalWeight += ri.grams
	}

	return {
		totalWeight,
		waterPercent: calcWaterPercent(resolved, totalWeight),
		totalSolidsPercent: calcTotalSolids(resolved, totalWeight),
		fatPercent: calcFatPercent(resolved, totalWeight),
		slngPercent: calcSlngPercent(resolved, totalWeight),
		sugarPercent: calcSugarPercent(resolved, totalWeight),
		proteinPercent: calcProteinPercent(resolved, totalWeight),
		lactosePercent: calcLactosePercent(resolved, totalWeight),
		pod: calcPod(resolved, totalWeight),
		pac: calcPac(resolved, totalWeight),
		maxSlng: calcMaxSlng(resolved, totalWeight),
	}
}
