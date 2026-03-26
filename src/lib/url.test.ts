import { describe, it, expect } from 'vitest'
import { serializeRecipeToQuery, parseRecipeFromQuery, areRecipesEqual } from './url'
import type { RecipeData } from './url'

const sampleRecipe: RecipeData = {
	type: 'cremeeis',
	batchSize: 1000,
	ingredients: [
		{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 550 },
		{ ingredientId: 'cream-35', category: 'dairy', grams: 133 },
		{ ingredientId: 'sucrose', category: 'sugars', grams: 112 },
	],
	notes: 'Test recipe',
}

describe('serializeRecipeToQuery', () => {
	it('serializes all fields', () => {
		const q = serializeRecipeToQuery(sampleRecipe)
		expect(q.type).toBe('cremeeis')
		expect(q.batch).toBe('1000')
		expect(q.i).toBe('dairy:whole-milk-3.5:550,dairy:cream-35:133,sugars:sucrose:112')
		expect(q.notes).toBe('Test recipe')
	})

	it('includes measuredBrix when present', () => {
		const recipe: RecipeData = {
			...sampleRecipe,
			ingredients: [
				{ ingredientId: 'strawberry', category: 'fruits', grams: 200, measuredBrix: 8.5 },
			],
		}
		const q = serializeRecipeToQuery(recipe)
		expect(q.i).toBe('fruits:strawberry:200:8.5')
	})

	it('omits notes when empty', () => {
		const q = serializeRecipeToQuery({ ...sampleRecipe, notes: '' })
		expect(q.notes).toBeUndefined()
	})

	it('omits i when no ingredients', () => {
		const q = serializeRecipeToQuery({ ...sampleRecipe, ingredients: [] })
		expect(q.i).toBeUndefined()
	})
})

describe('parseRecipeFromQuery', () => {
	it('parses all fields', () => {
		const result = parseRecipeFromQuery({
			type: 'cremeeis',
			batch: '1000',
			i: 'dairy:whole-milk-3.5:550,dairy:cream-35:133,sugars:sucrose:112',
			notes: 'Test recipe',
		})
		expect(result).toEqual(sampleRecipe)
	})

	it('parses measuredBrix', () => {
		const result = parseRecipeFromQuery({
			type: 'milcheis',
			batch: '1000',
			i: 'fruits:strawberry:200:8.5',
			notes: '',
		})
		expect(result.ingredients![0].measuredBrix).toBe(8.5)
	})

	it('returns partial data for missing fields', () => {
		const result = parseRecipeFromQuery({ type: 'milcheis' })
		expect(result.type).toBe('milcheis')
		expect(result.batchSize).toBeUndefined()
		expect(result.ingredients).toBeUndefined()
	})

	it('skips malformed ingredient segments', () => {
		const result = parseRecipeFromQuery({ i: 'dairy:milk:100,bad,sugars:sucrose:50' })
		expect(result.ingredients).toHaveLength(2)
	})
})

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

describe('roundtrip', () => {
	it('serialize then parse produces equal recipe', () => {
		const query = serializeRecipeToQuery(sampleRecipe)
		const parsed = parseRecipeFromQuery(query)
		expect(areRecipesEqual(sampleRecipe, parsed as RecipeData)).toBe(true)
	})
})
