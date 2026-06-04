// Pure recipe-data operations: scaling/canonicalization to a 1000 g basis and
// identity comparison. No state, no I/O.
import type { RecipeData, RecipeIngredient } from '~/lib/types'

export function round2 (n: number): number {
	return Math.round(n * 100) / 100
}

// Scale ingredient grams by `factor`, rounding each row to 2 dp. The accumulated
// rounding residual is absorbed by the *largest* row, so the rows sum exactly to
// round2(Σgrams × factor) while small ingredients (stabilizers) keep their honest
// value and are never skewed by the correction.
export function apportion (ingredients: RecipeIngredient[], factor: number): RecipeIngredient[] {
	if (ingredients.length === 0) return []
	const total = round2(ingredients.reduce((s, i) => s + i.grams, 0) * factor)
	const rows = ingredients.map(i => round2(i.grams * factor))
	const residual = round2(total - round2(rows.reduce((s, g) => s + g, 0)))
	if (residual !== 0) {
		let maxIdx = 0
		for (let i = 1; i < rows.length; i++) if (rows[i] > rows[maxIdx]) maxIdx = i
		rows[maxIdx] = round2(rows[maxIdx] + residual)
	}
	return ingredients.map((ing, i) => ({ ...ing, grams: rows[i] }))
}

// Canonical form: scale so the grams sum to exactly 1000 (1 kg basis).
export function normalizeTo1000 (ingredients: RecipeIngredient[]): RecipeIngredient[] {
	const sum = ingredients.reduce((s, i) => s + i.grams, 0)
	if (sum <= 0) return ingredients.map(ing => ({ ...ing }))
	return apportion(ingredients, 1000 / sum)
}

// Exact identity comparison — batch size is deliberately not part of identity, so a
// proportional resize never registers as a modification.
export function areRecipesEqual (a: RecipeData, b: RecipeData): boolean {
	if (a.type !== b.type) return false
	if (a.notes !== b.notes) return false
	if (a.ingredients.length !== b.ingredients.length) return false

	for (let i = 0; i < a.ingredients.length; i++) {
		const ai = a.ingredients[i]
		const bi = b.ingredients[i]
		if (ai.ingredientId !== bi.ingredientId) return false
		if (ai.category !== bi.category) return false
		if (ai.grams !== bi.grams) return false
		if (ai.measuredBrix !== bi.measuredBrix) return false
	}

	return true
}
