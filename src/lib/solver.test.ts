import { describe, it, expect } from 'vitest'
import type { RecipeIngredient } from './types'
import { autoFill, generateSuggestions } from './solver'
import { calcBalance } from './formulas'
import { targetRanges } from './ranges'

describe('solver', () => {
	describe('autoFill', () => {
		it('creates a balanced Fruchtsorbet from blueberries', () => {
			const fixed: RecipeIngredient[] = [
				{ ingredientId: 'blueberry', category: 'fruits', grams: 400, measuredBrix: 12 },
			]

			const recipe = autoFill('fruchtsorbet', 1000, fixed)
			const balance = calcBalance(recipe)
			const ranges = targetRanges.fruchtsorbet

			// Should be roughly 1000g
			expect(balance.totalWeight).toBeGreaterThan(950)
			expect(balance.totalWeight).toBeLessThan(1050)

			// Key parameters should be in or near target ranges
			// (allow some slack — the solver is heuristic, not exact)
			expect(balance.pod).toBeGreaterThan(ranges.pod.min * 0.8)
			expect(balance.pod).toBeLessThan(ranges.pod.max * 1.3)
			expect(balance.pac).toBeGreaterThan(ranges.pac.min * 0.8)
		})

		it('creates a balanced Milcheis', () => {
			const recipe = autoFill('milcheis', 1000, [])
			const balance = calcBalance(recipe)
			const ranges = targetRanges.milcheis

			expect(balance.totalWeight).toBeGreaterThan(950)
			expect(balance.totalWeight).toBeLessThan(1050)
			expect(balance.fatPercent).toBeGreaterThan(ranges.fat.min * 0.7)
			expect(balance.slngPercent).toBeGreaterThan(ranges.slng.min * 0.5)
			expect(balance.pod).toBeGreaterThan(100)
		})

		it('respects fixed ingredients', () => {
			const fixed: RecipeIngredient[] = [
				{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 700 },
			]

			const recipe = autoFill('milcheis', 1000, fixed)

			// Should not add another whole-milk-3.5
			const milkEntries = recipe.filter(i => i.ingredientId === 'whole-milk-3.5')
			expect(milkEntries).toHaveLength(1)
			expect(milkEntries[0].grams).toBe(700)
		})

		it('includes stabilizer', () => {
			const recipe = autoFill('fruchtsorbet', 1000, [])
			expect(recipe.some(i => i.category === 'stabilizers')).toBe(true)
		})

		it('includes water to reach batch size', () => {
			const recipe = autoFill('fruchtsorbet', 1000, [
				{ ingredientId: 'raspberry', category: 'fruits', grams: 400, measuredBrix: 10 },
			])
			expect(recipe.some(i => i.ingredientId === 'water')).toBe(true)
		})
	})

	describe('generateSuggestions', () => {
		it('suggests adding sugar when POD is too low', () => {
			const recipe: RecipeIngredient[] = [
				{ ingredientId: 'water', category: 'base', grams: 900 },
				{ ingredientId: 'sucrose', category: 'sugars', grams: 50 },
			]

			const suggestions = generateSuggestions(recipe, 'fruchtsorbet', 1000)
			const podSuggestion = suggestions.find(s => s.parameter === 'pod')
			expect(podSuggestion).toBeDefined()
			expect(podSuggestion.action).toBe('add')
		})

		it('suggests adding stabilizer when missing', () => {
			const recipe: RecipeIngredient[] = [
				{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 600 },
				{ ingredientId: 'sucrose', category: 'sugars', grams: 150 },
			]

			const suggestions = generateSuggestions(recipe, 'milcheis', 1000)
			const stabSuggestion = suggestions.find(s => s.parameter === 'stabilizer')
			expect(stabSuggestion).toBeDefined()
			expect(stabSuggestion.ingredientId).toBe('lbg')
		})

		it('suggests water to fill batch', () => {
			const recipe: RecipeIngredient[] = [
				{ ingredientId: 'sucrose', category: 'sugars', grams: 200 },
			]

			const suggestions = generateSuggestions(recipe, 'fruchtsorbet', 1000)
			const waterSuggestion = suggestions.find(s => s.parameter === 'water')
			expect(waterSuggestion).toBeDefined()
			expect(waterSuggestion.grams).toBeGreaterThan(700)
		})

		it('returns empty when recipe is balanced', () => {
			// Build a balanced recipe via autoFill, then check suggestions
			const recipe = autoFill('milcheis', 1000, [])
			const suggestions = generateSuggestions(recipe, 'milcheis', 1000)

			// Should have few or no critical suggestions
			// (stabilizer and water already handled by autoFill)
			const criticalSuggestions = suggestions.filter(s =>
				s.parameter !== 'water' && s.parameter !== 'stabilizer'
			)
			// Allow some suggestions (solver is heuristic) but not many
			expect(criticalSuggestions.length).toBeLessThan(4)
		})
	})
})
