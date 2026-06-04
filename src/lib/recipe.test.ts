import { describe, it, expect } from 'vitest'
import { apportion, normalizeTo1000, areRecipesEqual } from './recipe'
import type { RecipeData, RecipeIngredient } from './types'

function round2 (n: number): number {
	return Math.round(n * 100) / 100
}

function sumGrams (ings: RecipeIngredient[]): number {
	return round2(ings.reduce((s, i) => s + i.grams, 0))
}

const sampleRecipe: RecipeData = {
	type: 'cremeeis',
	ingredients: [
		{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 550 },
		{ ingredientId: 'cream-35', category: 'dairy', grams: 133 },
		{ ingredientId: 'sucrose', category: 'sugars', grams: 112 },
	],
	notes: 'Test recipe',
}

describe('areRecipesEqual', () => {
	it('returns true for identical recipes', () => {
		expect(areRecipesEqual(sampleRecipe, { ...sampleRecipe, ingredients: [...sampleRecipe.ingredients] })).toBe(true)
	})

	it('detects type difference', () => {
		expect(areRecipesEqual(sampleRecipe, { ...sampleRecipe, type: 'milcheis' })).toBe(false)
	})

	it('detects grams difference', () => {
		const modified = {
			...sampleRecipe,
			ingredients: sampleRecipe.ingredients.map((ing, i) => i === 0 ? { ...ing, grams: 999 } : ing),
		}
		expect(areRecipesEqual(sampleRecipe, modified)).toBe(false)
	})

	it('detects ingredient count difference', () => {
		expect(areRecipesEqual(sampleRecipe, { ...sampleRecipe, ingredients: [] })).toBe(false)
	})

	it('detects notes difference', () => {
		expect(areRecipesEqual(sampleRecipe, { ...sampleRecipe, notes: 'different' })).toBe(false)
	})
})

describe('apportion', () => {
	// A small stabilizer alongside large ingredients — the residual must never land on it.
	const recipe: RecipeIngredient[] = [
		{ ingredientId: 'guar-gum', category: 'stabilizers', grams: 0.8 },
		{ ingredientId: 'lbg', category: 'stabilizers', grams: 1 },
		{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 700.7 },
		{ ingredientId: 'sucrose', category: 'sugars', grams: 112.3 },
	]

	for (const factor of [0.5, 2, 1 / 3, 0.3333, 1.2345, 3]) {
		it(`rows sum to round2(Σ × factor) at factor ${factor}`, () => {
			const rows = apportion(recipe, factor)
			const target = round2(recipe.reduce((s, i) => s + i.grams, 0) * factor)
			expect(sumGrams(rows)).toBe(target)
		})

		it(`small ingredients keep their honest value at factor ${factor}`, () => {
			const rows = apportion(recipe, factor)
			// stabilizers are never the largest row → never absorb the residual
			expect(rows[0].grams).toBe(round2(0.8 * factor))
			expect(rows[1].grams).toBe(round2(1 * factor))
		})
	}

	it('carries ids and measuredBrix through', () => {
		const rows = apportion([{ ingredientId: 'strawberry', category: 'fruits', grams: 200, measuredBrix: 9 }], 2)
		expect(rows[0]).toMatchObject({ ingredientId: 'strawberry', category: 'fruits', measuredBrix: 9, grams: 400 })
	})
})

describe('normalizeTo1000', () => {
	it('sums to exactly 1000', () => {
		const norm = normalizeTo1000([
			{ ingredientId: 'a', category: 'dairy', grams: 220 },
			{ ingredientId: 'b', category: 'dairy', grams: 20 },
			{ ingredientId: 'c', category: 'sugars', grams: 56 },
			{ ingredientId: 'd', category: 'stabilizers', grams: 0.8 },
			{ ingredientId: 'e', category: 'fruits', grams: 150 },
		])
		expect(sumGrams(norm)).toBe(1000)
	})

	it('preserves proportions', () => {
		const norm = normalizeTo1000([
			{ ingredientId: 'a', category: 'dairy', grams: 250 },
			{ ingredientId: 'b', category: 'sugars', grams: 250 },
		])
		expect(norm[0].grams).toBe(500)
		expect(norm[1].grams).toBe(500)
	})
})
