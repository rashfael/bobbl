import { describe, it, expect } from 'vitest'
import type { RecipeIngredient } from './types'
import { calcBalance } from './formulas'

// Worked examples from research/03-formulas.md
// Note: De Giglio uses slightly different dairy values (Vollmilch 3.8%, Sahne 36%)
// than our German BLS database (3.5%, 35%), so we allow some tolerance.

describe('formulas', () => {
	describe('simple Milcheis base (TS example)', () => {
		// 1000g: 600g Vollmilch, 100g Sahne 35%, 150g Saccharose, 40g SMP, 3g Stabilisator, 107g Wasser
		// Expected: TS ≈ 30.6%
		const recipe: RecipeIngredient[] = [
			{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 600 },
			{ ingredientId: 'cream-35', category: 'dairy', grams: 100 },
			{ ingredientId: 'sucrose', category: 'sugars', grams: 150 },
			{ ingredientId: 'skim-milk-powder', category: 'dairy', grams: 40 },
			{ ingredientId: 'lbg', category: 'stabilizers', grams: 3 },
			{ ingredientId: 'water', category: 'base', grams: 107 },
		]

		it('calculates total solids percentage', () => {
			const result = calcBalance(recipe)
			expect(result.totalWeight).toBe(1000)
			// 600×12.4% + 100×40% + 150×100% + 40×97% + 3×100% + 107×0%
			expect(result.totalSolidsPercent).toBeCloseTo(30.6, 0)
		})
	})

	describe('Vanilleeis (De Giglio POD/PAC example)', () => {
		// 1000g mix. De Giglio: POD 150, PAC 232, TS 36.1%, Fat 9.25%, SLNG 10.3%
		// Our data differs slightly (3.5% milk vs 3.8%, 35% cream vs 36%)
		// so we use wider tolerances.
		const recipe: RecipeIngredient[] = [
			{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 550 },
			{ ingredientId: 'cream-35', category: 'dairy', grams: 133 },
			{ ingredientId: 'skim-milk-powder', category: 'dairy', grams: 46 },
			{ ingredientId: 'sucrose', category: 'sugars', grams: 112 },
			{ ingredientId: 'dextrose', category: 'sugars', grams: 20.9 },
			{ ingredientId: 'glucose-de39', category: 'sugars', grams: 13.5 },
			{ ingredientId: 'glucose-syrup-de60', category: 'sugars', grams: 20 },
			{ ingredientId: 'egg-yolk', category: 'base', grams: 100 },
			{ ingredientId: 'lbg', category: 'stabilizers', grams: 2.5 },
		]

		it('calculates POD close to 150', () => {
			const result = calcBalance(recipe)
			expect(result.pod).toBeGreaterThan(140)
			expect(result.pod).toBeLessThan(160)
		})

		it('calculates PAC close to 232', () => {
			const result = calcBalance(recipe)
			// Slight data differences → allow ~15 tolerance
			expect(result.pac).toBeGreaterThan(215)
			expect(result.pac).toBeLessThan(245)
		})

		it('calculates fat in expected range', () => {
			const result = calcBalance(recipe)
			// Our milk is 3.5% vs De Giglio's 3.8%, cream 35% vs 36%
			expect(result.fatPercent).toBeGreaterThan(8.5)
			expect(result.fatPercent).toBeLessThan(11)
		})
	})

	describe('Himbeersorbet (De Giglio PAC example)', () => {
		// 1000g mix. Expected: POD 231, PAC 261-262, Sugar 25%
		// Fruit Brix values set to match De Giglio's sugar amounts
		const recipe: RecipeIngredient[] = [
			{ ingredientId: 'raspberry', category: 'fruits', grams: 450, measuredBrix: 20 },
			{ ingredientId: 'lemon', category: 'fruits', grams: 50, measuredBrix: 8 },
			{ ingredientId: 'sucrose', category: 'sugars', grams: 109 },
			{ ingredientId: 'dextrose', category: 'sugars', grams: 25 },
			{ ingredientId: 'glucose-de39', category: 'sugars', grams: 16 },
			{ ingredientId: 'maltodextrin-de19', category: 'sugars', grams: 8 },
			{ ingredientId: 'lbg', category: 'stabilizers', grams: 2.5 },
			{ ingredientId: 'water', category: 'base', grams: 338 },
		]

		it('calculates POD close to 231', () => {
			const result = calcBalance(recipe)
			expect(result.pod).toBeCloseTo(231, -1)
		})

		it('calculates PAC close to 261', () => {
			const result = calcBalance(recipe)
			expect(result.pac).toBeCloseTo(261, -1)
		})

		it('calculates sugar close to 25%', () => {
			const result = calcBalance(recipe)
			expect(result.sugarPercent).toBeCloseTo(25, 0)
		})
	})

	describe('edge cases', () => {
		it('handles empty recipe', () => {
			const result = calcBalance([])
			expect(result.totalWeight).toBe(0)
			expect(result.totalSolidsPercent).toBe(0)
			expect(result.pod).toBe(0)
			expect(result.pac).toBe(0)
		})

		it('handles single ingredient', () => {
			const result = calcBalance([
				{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 1000 },
			])
			expect(result.totalWeight).toBe(1000)
			expect(result.fatPercent).toBeCloseTo(3.5, 1)
			expect(result.waterPercent).toBeCloseTo(87.6, 1)
			expect(result.totalSolidsPercent).toBeCloseTo(12.4, 1)
		})

		it('handles unknown ingredient gracefully', () => {
			const result = calcBalance([
				{ ingredientId: 'nonexistent', category: 'dairy', grams: 500 },
				{ ingredientId: 'sucrose', category: 'sugars', grams: 100 },
			])
			expect(result.totalWeight).toBe(100)
			expect(result.totalSolidsPercent).toBe(100)
		})
	})
})
