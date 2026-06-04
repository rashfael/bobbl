import { describe, it, expect } from 'vitest'
import { makeRecipeStore } from './recipe'
import type { RecipeIngredient } from '~/lib/types'

function round2 (n: number): number {
	return Math.round(n * 100) / 100
}

function rowSum (ings: RecipeIngredient[]): number {
	return round2(ings.reduce((s, i) => s + i.grams, 0))
}

// Canonical recipe summing to exactly 1000 g, with a tiny stabilizer.
function freshStore () {
	const store = makeRecipeStore()
	const ingredients: RecipeIngredient[] = [
		{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 800 },
		{ ingredientId: 'sucrose', category: 'sugars', grams: 199.2 },
		{ ingredientId: 'guar-gum', category: 'stabilizers', grams: 0.8 },
	]
	store.loadRecipe({ type: 'milcheis', ingredients, notes: '' }, 'test')
	return store
}

describe('recipe store — canonical grams + batchFactor', () => {
	it('loads at the canonical 1 kg basis', () => {
		const s = freshStore()
		expect(s.batchFactor).toBe(1)
		expect(s.displayTotal).toBe(1000)
		expect(s.isModified).toBe(false)
	})

	it('resizing scales the display, preserves balance, and stays unmodified', () => {
		const s = freshStore()
		const before = {
			ts: s.balance.totalSolidsPercent,
			pod: s.balance.pod,
			pac: s.balance.pac,
		}
		s.setDisplayTotal(2000)
		expect(s.batchFactor).toBe(2)
		expect(s.displayTotal).toBe(2000)
		expect(s.displayIngredients.map(i => i.grams)).toEqual([1600, 398.4, 1.6])
		expect(rowSum(s.displayIngredients)).toBe(2000)
		// balance is computed on the untouched canonical grams → identical
		expect(s.balance.totalSolidsPercent).toBeCloseTo(before.ts, 6)
		expect(s.balance.pod).toBeCloseTo(before.pod, 6)
		expect(s.balance.pac).toBeCloseTo(before.pac, 6)
		expect(s.isModified).toBe(false)
	})

	it('rows still sum exactly to the total at an awkward size', () => {
		const s = freshStore()
		s.setDisplayTotal(777)
		expect(s.displayTotal).toBe(777)
		expect(rowSum(s.displayIngredients)).toBe(777)
	})

	it('a genuine grams edit marks the recipe modified', () => {
		const s = freshStore()
		s.updateGrams(1, 250)
		expect(s.recipe.ingredients[1].grams).toBe(250)
		expect(s.isModified).toBe(true)
	})

	it('re-entering the already-displayed value is a no-op (no phantom modification)', () => {
		const s = freshStore()
		s.setDisplayTotal(777) // non-unit factor
		const shown = s.displayIngredients[1].grams
		const canonicalBefore = s.recipe.ingredients[1].grams
		s.updateGrams(1, shown)
		expect(s.recipe.ingredients[1].grams).toBe(canonicalBefore)
		expect(s.isModified).toBe(false)
	})

	it('addIngredient converts display grams to canonical', () => {
		const s = freshStore()
		s.setDisplayTotal(2000) // factor 2
		s.addIngredient({ ingredientId: 'dextrose', category: 'sugars', grams: 40 })
		expect(s.recipe.ingredients.at(-1)!.grams).toBe(20)
	})

	it('toRecipeData normalizes to 1000 g and carries no batch field', () => {
		const s = freshStore()
		s.setDisplayTotal(2000)
		s.updateGrams(0, 1700) // genuine edit → canonical sum drifts
		const data = s.toRecipeData()
		expect(rowSum(data.ingredients)).toBe(1000)
		expect('batchSize' in data).toBe(false)
		expect((data as Record<string, unknown>).batch).toBeUndefined()
	})
})
