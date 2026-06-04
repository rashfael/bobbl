import type { Sugar, Dairy, Fat, ChocolateCocoa, Fruit, Nut, Stabilizer, Alcohol, BaseComposition, Ingredient, IngredientCategory, I18nString, YamlFile } from './types'

import sugarsYaml from '../../data/sugars.yaml'
import dairyYaml from '../../data/dairy.yaml'
import fatsYaml from '../../data/fats.yaml'
import chocolateCocoaYaml from '../../data/chocolate-cocoa.yaml'
import fruitsYaml from '../../data/fruits.yaml'
import nutsYaml from '../../data/nuts.yaml'
import stabilizersYaml from '../../data/stabilizers.yaml'
import alcoholYaml from '../../data/alcohol.yaml'

// Typed references to raw YAML data
export const sugars = (sugarsYaml as YamlFile<Sugar>).items
export const dairy = (dairyYaml as YamlFile<Dairy>).items
export const fats = (fatsYaml as YamlFile<Fat>).items
export const chocolateCocoa = (chocolateCocoaYaml as YamlFile<ChocolateCocoa>).items
export const fruits = (fruitsYaml as YamlFile<Fruit>).items
export const nuts = (nutsYaml as YamlFile<Nut>).items
export const stabilizers = (stabilizersYaml as YamlFile<Stabilizer>).items
export const alcohol = (alcoholYaml as YamlFile<Alcohol>).items

// Built-in base ingredients (not in YAML files)
export const base: BaseComposition[] = [
	{
		id: 'water',
		name: { de: 'Wasser', en: 'Water' },
		fatPercent: 0,
		proteinPercent: 0,
		totalSolidsPercent: 0,
		waterPercent: 100,
		source: 'built-in',
	},
	{
		id: 'egg-yolk',
		name: { de: 'Eigelb', en: 'Egg yolk' },
		fatPercent: 32,
		proteinPercent: 16,
		totalSolidsPercent: 50,
		waterPercent: 50,
		source: 'bls',
	},
]

// Category → items mapping
const categoryMap: Record<IngredientCategory, Ingredient[]> = {
	base,
	sugars,
	dairy,
	fats,
	'chocolate-cocoa': chocolateCocoa,
	fruits,
	nuts,
	stabilizers,
	alcohol,
}

// All categories with their labels
export const categories: { id: IngredientCategory, label: { de: string, en: string } }[] = [
	{ id: 'base', label: { de: 'Basis', en: 'Base' } },
	{ id: 'dairy', label: { de: 'Milchprodukte', en: 'Dairy' } },
	{ id: 'sugars', label: { de: 'Zucker & Suessmittel', en: 'Sugars & Sweeteners' } },
	{ id: 'fats', label: { de: 'Fette & Oele', en: 'Fats & Oils' } },
	{ id: 'chocolate-cocoa', label: { de: 'Schokolade & Kakao', en: 'Chocolate & Cocoa' } },
	{ id: 'fruits', label: { de: 'Fruechte', en: 'Fruits' } },
	{ id: 'nuts', label: { de: 'Nuesse & Pasten', en: 'Nuts & Pastes' } },
	{ id: 'stabilizers', label: { de: 'Stabilisatoren & Emulgatoren', en: 'Stabilizers & Emulsifiers' } },
	{ id: 'alcohol', label: { de: 'Alkohol', en: 'Alcohol' } },
]

// Look up a single ingredient by category + id
export function findIngredient (category: IngredientCategory, id: string): Ingredient | undefined {
	return categoryMap[category]?.find(item => item.id === id)
}

// Get all items for a category
export function getCategory (category: IngredientCategory): Ingredient[] {
	return categoryMap[category] ?? []
}

// A single ingredient as a grouped-select option, carrying a composite value so a
// one-step select can still recover the category on add (see IngredientPicker.vue).
export interface IngredientOption {
	value: string // composite "<category>:<id>"
	name: I18nString
	category: IngredientCategory
	id: string
}

// Ingredients grouped by category for a single grouped bunt-select.
// Built once (YAML data is static) so option identity stays stable across renders.
export const ingredientGroups: { label: I18nString, items: IngredientOption[] }[] =
	categories.map(c => ({
		label: c.label,
		items: getCategory(c.id).map(ing => ({
			value: `${c.id}:${ing.id}`,
			name: ing.name,
			category: c.id,
			id: ing.id,
		})),
	}))

// Flat list of all ingredients with their category
export function allIngredients (): { category: IngredientCategory, ingredient: Ingredient }[] {
	const result: { category: IngredientCategory, ingredient: Ingredient }[] = []
	for (const [category, items] of Object.entries(categoryMap)) {
		for (const ingredient of items) {
			result.push({ category: category as IngredientCategory, ingredient })
		}
	}
	return result
}
