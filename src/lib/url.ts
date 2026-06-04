import type { RecipeData, RecipeIngredient, IceCreamType, IngredientCategory } from '~/lib/types'

// Serialize recipe state to URL query params.
// Format for ingredients: "category:id:grams" with optional ":measuredBrix".
// `batchGrams` (the displayed total) is encoded only when the recipe is being viewed
// at a non-canonical size, so a shared link reproduces that instance size.
export function serializeRecipeToQuery (recipe: RecipeData, batchGrams?: number): Record<string, string> {
	const params: Record<string, string> = {}

	params.type = recipe.type
	if (batchGrams != null) params.batch = String(batchGrams)

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
export function parseRecipeFromQuery (query: Record<string, string>): Partial<RecipeData> & { batch?: number } {
	const result: Partial<RecipeData> & { batch?: number } = {}

	if (query.type) {
		result.type = query.type as IceCreamType
	}

	if (query.batch) {
		const n = Number(query.batch)
		if (!Number.isNaN(n) && n > 0) result.batch = n
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
