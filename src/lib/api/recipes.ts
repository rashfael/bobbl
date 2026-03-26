// Thin fetch wrappers for the Vite dev middleware recipe API.
// These endpoints only exist during `vite dev`.

const BASE = '/api/recipes'

export async function listRecipes (): Promise<string[]> {
	const res = await fetch(BASE)
	return res.json()
}

export async function loadRecipe (id: string): Promise<any> {
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`)
	if (!res.ok) throw new Error(`Recipe "${id}" not found`)
	return res.json()
}

export async function saveRecipe (id: string, data: any): Promise<void> {
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error(`Failed to save recipe "${id}"`)
}

export async function deleteRecipe (id: string): Promise<void> {
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
		method: 'DELETE',
	})
	if (!res.ok) throw new Error(`Failed to delete recipe "${id}"`)
}
