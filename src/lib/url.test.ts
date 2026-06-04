import { describe, it, expect } from 'vitest'
import { serializeRecipeToQuery, parseRecipeFromQuery } from './url'
import { areRecipesEqual } from './recipe'
import type { RecipeData } from './types'

const sampleRecipe: RecipeData = {
	type: 'cremeeis',
	ingredients: [
		{ ingredientId: 'whole-milk-3.5', category: 'dairy', grams: 550 },
		{ ingredientId: 'cream-35', category: 'dairy', grams: 133 },
		{ ingredientId: 'sucrose', category: 'sugars', grams: 112 },
	],
	notes: 'Test recipe',
}

describe('serializeRecipeToQuery', () => {
	it('serializes recipe fields and omits batch by default', () => {
		const q = serializeRecipeToQuery(sampleRecipe)
		expect(q.type).toBe('cremeeis')
		expect(q.batch).toBeUndefined()
		expect(q.i).toBe('dairy:whole-milk-3.5:550,dairy:cream-35:133,sugars:sucrose:112')
		expect(q.notes).toBe('Test recipe')
	})

	it('emits batch only when an instance size is given', () => {
		expect(serializeRecipeToQuery(sampleRecipe, 2000).batch).toBe('2000')
	})

	it('includes measuredBrix when present', () => {
		const recipe: RecipeData = {
			...sampleRecipe,
			ingredients: [
				{ ingredientId: 'strawberry', category: 'fruits', grams: 200, measuredBrix: 8.5 },
			],
		}
		expect(serializeRecipeToQuery(recipe).i).toBe('fruits:strawberry:200:8.5')
	})

	it('omits notes when empty', () => {
		expect(serializeRecipeToQuery({ ...sampleRecipe, notes: '' }).notes).toBeUndefined()
	})

	it('omits i when no ingredients', () => {
		expect(serializeRecipeToQuery({ ...sampleRecipe, ingredients: [] }).i).toBeUndefined()
	})
})

describe('parseRecipeFromQuery', () => {
	it('parses recipe fields and batch separately', () => {
		const result = parseRecipeFromQuery({
			type: 'cremeeis',
			batch: '2000',
			i: 'dairy:whole-milk-3.5:550,dairy:cream-35:133,sugars:sucrose:112',
			notes: 'Test recipe',
		})
		expect(result.batch).toBe(2000)
		expect(areRecipesEqual({ type: result.type!, ingredients: result.ingredients!, notes: result.notes! }, sampleRecipe)).toBe(true)
	})

	it('parses measuredBrix', () => {
		const result = parseRecipeFromQuery({ type: 'milcheis', i: 'fruits:strawberry:200:8.5', notes: '' })
		expect(result.ingredients![0].measuredBrix).toBe(8.5)
	})

	it('returns partial data for missing fields', () => {
		const result = parseRecipeFromQuery({ type: 'milcheis' })
		expect(result.type).toBe('milcheis')
		expect(result.batch).toBeUndefined()
		expect(result.ingredients).toBeUndefined()
	})

	it('skips malformed ingredient segments', () => {
		const result = parseRecipeFromQuery({ i: 'dairy:milk:100,bad,sugars:sucrose:50' })
		expect(result.ingredients).toHaveLength(2)
	})
})

describe('roundtrip', () => {
	it('serialize then parse produces equal recipe', () => {
		const query = serializeRecipeToQuery(sampleRecipe)
		const parsed = parseRecipeFromQuery(query)
		expect(areRecipesEqual({ type: parsed.type!, ingredients: parsed.ingredients!, notes: parsed.notes! }, sampleRecipe)).toBe(true)
	})
})
