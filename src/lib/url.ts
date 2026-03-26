import type { RecipeIngredient, IceCreamType, IngredientCategory } from '~/lib/types'

export interface RecipeData {
	type: IceCreamType
	batchSize: number
	ingredients: RecipeIngredient[]
	notes: string
}

// Serialize recipe state to URL query params.
// Format for ingredients: "category:id:grams" with optional ":measuredBrix"
export function serializeRecipeToQuery (recipe: RecipeData): Record<string, string> {
	const params: Record<string, string> = {}

	params.type = recipe.type
	params.batch = String(recipe.batchSize)

	if (recipe.ingredients.length > 0) {
		params.i = recipe.ingredients.map(ing => {
			let s = `${ing.category}:${ing.ingredientId}:${ing.grams}`
			if (ing.measuredBrix != null) s += `:${ing.measuredBrix}`
			return s
		}).join(',')
	}

	if (recipe.notes) {
		params.notes = recipe.notes
	}

	return params
}

// Parse recipe state from URL query params.
// Returns partial data — missing fields are undefined.
export function parseRecipeFromQuery (query: Record<string, string>): Partial<RecipeData> {
	const result: Partial<RecipeData> = {}

	if (query.type) {
		result.type = query.type as IceCreamType
	}

	if (query.batch) {
		const n = Number(query.batch)
		if (!Number.isNaN(n) && n > 0) result.batchSize = n
	}

	if (query.i) {
		const ingredients: RecipeIngredient[] = []
		for (const part of query.i.split(',')) {
			const segments = part.split(':')
			if (segments.length < 3) continue
			const [category, ingredientId, gramsStr, brixStr] = segments
			const grams = Number(gramsStr)
			if (Number.isNaN(grams)) continue
			const ing: RecipeIngredient = {
				category: category as IngredientCategory,
				ingredientId,
				grams,
			}
			if (brixStr != null) {
				const brix = Number(brixStr)
				if (!Number.isNaN(brix)) ing.measuredBrix = brix
			}
			ingredients.push(ing)
		}
		result.ingredients = ingredients
	}

	if (query.notes != null) {
		result.notes = query.notes
	}

	return result
}

// Deep comparison of two recipe data objects.
export function areRecipesEqual (a: RecipeData, b: RecipeData): boolean {
	if (a.type !== b.type) return false
	if (a.batchSize !== b.batchSize) return false
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
