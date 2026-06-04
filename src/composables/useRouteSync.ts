import { watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RecipeStore } from '~/stores/recipe'
import { loadRecipe } from '~/lib/api/recipes'
import { serializeRecipeToQuery, parseRecipeFromQuery } from '~/lib/url'
import { areRecipesEqual } from '~/lib/recipe'
import type { RecipeData } from '~/lib/types'

export function useRouteSync (store: RecipeStore) {
	const route = useRoute()
	const router = useRouter()
	const loading = ref(false)
	const error = ref('')

	let isApplyingRoute = false

	function applyQueryOverrides () {
		const query = route.query as Record<string, string>
		const parsed = parseRecipeFromQuery(query)
		if (parsed.type) store.setType(parsed.type)
		if (parsed.ingredients) store.recipe.ingredients = parsed.ingredients
		if (parsed.notes != null) store.recipe.notes = parsed.notes
		// Ingredients first — setDisplayTotal derives the view multiplier from their sum.
		if (parsed.batch) store.setDisplayTotal(parsed.batch)
	}

	function hasRecipeQuery (): boolean {
		const q = route.query
		return !!(q.type || q.batch || q.i)
	}

	async function syncRouteToStore () {
		isApplyingRoute = true
		error.value = ''

		try {
			if (route.name === 'new-recipe') {
				if (hasRecipeQuery()) {
					applyQueryOverrides()
				}
			} else if (route.name === 'recipe') {
				const id = route.params.id as string
				loading.value = true
				try {
					const data = await loadRecipe(id)
					store.loadRecipe(data, id)
					if (hasRecipeQuery()) {
						applyQueryOverrides()
					}
				} catch {
					error.value = `Recipe "${id}" not found`
					await router.replace({ name: 'new-recipe' })
				} finally {
					loading.value = false
				}
			}
		} finally {
			setTimeout(() => {
				isApplyingRoute = false
			}, 50)
		}
	}

	// Sync on initial mount (immediate: true) — no need to watch for route changes
	// since the view is keyed and will be re-created on navigation
	syncRouteToStore()

	let debounceTimer: ReturnType<typeof setTimeout> | undefined
	watch(
		[() => store.recipe, () => store.batchFactor],
		() => {
			if (isApplyingRoute) return
			clearTimeout(debounceTimer)
			debounceTimer = setTimeout(() => {
				const currentData = store.recipe as RecipeData
				// Encode the viewed instance size only when it's non-canonical.
				const batchGrams = store.batchFactor !== 1 ? store.displayTotal : undefined

				if (route.name === 'new-recipe') {
					if (currentData.ingredients.length > 0 || currentData.notes) {
						router.replace({ query: serializeRecipeToQuery(currentData, batchGrams) })
					} else if (Object.keys(route.query).length > 0) {
						router.replace({ query: {} })
					}
				} else if (route.name === 'recipe') {
					const changed = store.loadedRecipe && !areRecipesEqual(currentData, store.loadedRecipe)
					if (changed || store.batchFactor !== 1) {
						router.replace({ query: serializeRecipeToQuery(currentData, batchGrams) })
					} else if (Object.keys(route.query).length > 0) {
						router.replace({ query: {} })
					}
				}
			}, 300)
		},
		{ deep: true },
	)

	return { loading, error }
}
