import { ref, computed } from 'vue'
import { listFeatured } from '~/lib/api/featured'
import { listUserRecipes } from '~/lib/api/userRecipes'

// Shared, refreshable recipe lists plus one search filter spanning both sections.
const featured = ref<string[]>([])
const userRecipes = ref<string[]>([])
const search = ref('')

async function refreshFeatured () {
	try {
		featured.value = await listFeatured()
	} catch {
		featured.value = []
	}
}

function refreshUser () {
	userRecipes.value = listUserRecipes()
}

async function refresh () {
	await refreshFeatured()
	refreshUser()
}

function matches (id: string): boolean {
	const q = search.value.trim().toLowerCase()
	return !q || id.toLowerCase().includes(q)
}

const filteredFeatured = computed(() => featured.value.filter(matches))
const filteredUserRecipes = computed(() => userRecipes.value.filter(matches))

export function useRecipeLists () {
	return {
		featured,
		userRecipes,
		search,
		filteredFeatured,
		filteredUserRecipes,
		refresh,
		refreshFeatured,
		refreshUser,
	}
}
