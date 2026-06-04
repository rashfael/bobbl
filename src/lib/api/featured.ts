// Featured (author-published) recipes.
//
// Dev: read live from the /api/recipes dev middleware (so a freshly-stored YAML shows up
//      immediately) and write/delete the git-tracked YAML through that same middleware.
// Prod: baked into the bundle at build time via import.meta.glob — no network, read-only.

const BASE = '/api/recipes'

// Statically analysed by Vite: every recipes/*.yaml present at build time is bundled
// (default export = the parsed object, same as the static imports in lib/ingredients.ts).
const bakedModules = import.meta.glob('/recipes/*.yaml', { eager: true, import: 'default' })
const baked: Record<string, any> = {}
for (const p in bakedModules) {
	baked[p.replace(/^.*\/(.+)\.yaml$/, '$1')] = bakedModules[p]
}

export const bakedIds = Object.keys(baked).sort((a, b) => a.localeCompare(b))

export async function listFeatured (): Promise<string[]> {
	if (import.meta.env.PROD) return bakedIds
	const res = await fetch(BASE)
	return res.json()
}

export async function loadFeatured (id: string): Promise<any> {
	if (import.meta.env.PROD) {
		const data = baked[id]
		if (!data) throw new Error(`Recipe "${id}" not found`)
		return structuredClone(data) // clone so in-memory edits never touch the shared module
	}
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`)
	if (!res.ok) throw new Error(`Recipe "${id}" not found`)
	return res.json()
}

// Dev-only: write a git-tracked recipe YAML through the dev middleware.
export async function storeFeatured (id: string, data: any): Promise<void> {
	if (!import.meta.env.DEV) throw new Error('Featured recipes can only be edited in dev')
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error(`Failed to store featured recipe "${id}"`)
}

// Dev-only: delete a git-tracked recipe YAML through the dev middleware.
export async function deleteFeatured (id: string): Promise<void> {
	if (!import.meta.env.DEV) throw new Error('Featured recipes can only be deleted in dev')
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
	if (!res.ok) throw new Error(`Failed to delete featured recipe "${id}"`)
}
