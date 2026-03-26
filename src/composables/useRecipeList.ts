import { ref } from 'vue'
import { listRecipes } from '~/lib/api/recipes'

// Shared recipe list state, refreshable from anywhere
const recipes = ref<string[]>([])
const loading = ref(false)

async function refresh () {
	loading.value = true
	try {
		recipes.value = await listRecipes()
	} catch {
		recipes.value = []
	} finally {
		loading.value = false
	}
}

export function useRecipeList () {
	return { recipes, loading, refresh }
}
