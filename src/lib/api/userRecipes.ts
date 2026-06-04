// User recipes — persisted in localStorage, available in dev and prod.
// Shape on disk: { [name]: RecipeData } under a single key.

import type { RecipeData } from '~/lib/types'

const KEY = 'bobbl:user-recipes'

type RecipeMap = Record<string, RecipeData>

function readAll (): RecipeMap {
	try {
		const raw = localStorage.getItem(KEY)
		if (!raw) return {}
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === 'object' ? parsed as RecipeMap : {}
	} catch {
		return {}
	}
}

function writeAll (map: RecipeMap): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(map))
	} catch {
		throw new Error('Could not save to localStorage (storage full or disabled).')
	}
}

export function listUserRecipes (): string[] {
	return Object.keys(readAll()).sort((a, b) => a.localeCompare(b))
}

export function loadUserRecipe (id: string): RecipeData {
	const data = readAll()[id]
	if (!data) throw new Error(`Recipe "${id}" not found`)
	return structuredClone(data)
}

export function saveUserRecipe (id: string, data: RecipeData): void {
	const map = readAll()
	map[id] = data
	writeAll(map)
}

export function deleteUserRecipe (id: string): void {
	const map = readAll()
	delete map[id]
	writeAll(map)
}

export function userRecipeExists (id: string): boolean {
	return id in readAll()
}

// Append " (n)" until the name is free among existing user recipes.
export function uniqueUserName (base: string): string {
	const map = readAll()
	if (!(base in map)) return base
	let n = 2
	while (`${base} (${n})` in map) n++
	return `${base} (${n})`
}

interface ExportEnvelope {
	version: 1
	recipes: RecipeMap
}

export function exportUserRecipes (): string {
	const envelope: ExportEnvelope = { version: 1, recipes: readAll() }
	return JSON.stringify(envelope, null, 2)
}

// Import a backup. On a name collision we never overwrite or skip — we suffix the
// incoming recipe (`Name (2)`, `Name (3)`…) and let the user clean up afterwards.
export function importUserRecipes (text: string): { added: string[], renamed: [string, string][] } {
	const parsed = JSON.parse(text)
	// Accept the envelope { version, recipes } or a bare { name: RecipeData } map.
	const incoming: unknown = parsed && typeof parsed === 'object' && 'recipes' in parsed
		? (parsed as ExportEnvelope).recipes
		: parsed
	if (!incoming || typeof incoming !== 'object') throw new Error('Invalid recipe file.')

	const map = readAll()
	const added: string[] = []
	const renamed: [string, string][] = []

	for (const [name, data] of Object.entries(incoming as RecipeMap)) {
		let target = name
		if (target in map) {
			let n = 2
			while (`${name} (${n})` in map) n++
			target = `${name} (${n})`
			renamed.push([name, target])
		}
		map[target] = data
		added.push(target)
	}

	writeAll(map)
	return { added, renamed }
}
