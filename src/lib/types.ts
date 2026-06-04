// Localized string: one value per supported language
export interface I18nString {
	de: string
	en: string
}

// Range with min/max
export interface Range {
	min: number
	max: number
}

// YAML file meta header
export interface YamlMeta {
	category: string
	description: string
	lastUpdated: string
}

// Base fields shared by all ingredient items
export interface BaseIngredient {
	id: string
	name: I18nString
	notes?: string | null
	source: string
}

// --- Category-specific ingredient types ---

export interface Sugar extends BaseIngredient {
	de: number | null
	pod: number
	pac: number
	molecularWeight: number | null
	totalSolidsPercent: number
	typicalUsagePercent: Range
}

export interface Dairy extends BaseIngredient {
	fatPercent: number
	proteinPercent: number
	lactosePercent: number
	slngPercent: number
	totalSolidsPercent: number
	waterPercent: number
}

export interface Fat extends BaseIngredient {
	fatPercent: number
	waterPercent: number
	totalSolidsPercent: number
	meltingPointCelsius: number | null
}

export interface ChocolateCocoa extends BaseIngredient {
	fatPercent: number
	sugarPercent: number
	cocoaSolidsPercent: number
	totalSolidsPercent: number
	waterPercent: number
	pod: number
	pac: number
}

export interface Fruit extends BaseIngredient {
	brix: {
		catalogueMin: number
		catalogueMax: number
		catalogueAvg: number
	}
	acidityPh: number | null
	waterPercent: number
	fiberPercent: number
	predominantSugarType: string
	totalSolidsPercent: number
	form: string[]
	season: { start: number, end: number } | null
}

export interface Nut extends BaseIngredient {
	fatPercent: number
	proteinPercent: number
	carbsPercent: number
	totalSolidsPercent: number
	waterPercent: number
	isPaste: boolean
}

export interface Stabilizer extends BaseIngredient {
	type: 'stabilizer' | 'emulsifier' | 'fiber' | 'bulking'
	eNumber: string | null
	dosagePercent: Range
	hydrationTempCelsius: number | null
	function: string
	synergiesWith: string[]
}

export interface Alcohol extends BaseIngredient {
	ethanolPercent: number
	sugarPercent: number
	pac: number
	waterPercent: number
	typicalUsagePercent: Range
}

// Generic ingredient with basic composition (water, egg yolk, etc.)
export interface BaseComposition extends BaseIngredient {
	fatPercent: number
	proteinPercent: number
	totalSolidsPercent: number
	waterPercent: number
}

// Union of all ingredient types
export type Ingredient = Sugar | Dairy | Fat | ChocolateCocoa | Fruit | Nut | Stabilizer | Alcohol | BaseComposition

// Category identifiers
export type IngredientCategory = 'sugars' | 'dairy' | 'fats' | 'chocolate-cocoa' | 'fruits' | 'nuts' | 'stabilizers' | 'alcohol' | 'base'

// YAML file structure
export interface YamlFile<T extends BaseIngredient> {
	meta: YamlMeta
	items: T[]
}

// --- Recipe types ---

// Where a recipe lives: author-published (baked-in/YAML) vs the visitor's localStorage.
export type RecipeSource = 'featured' | 'user'

export interface RecipeIngredient {
	ingredientId: string
	category: IngredientCategory
	grams: number
	measuredBrix?: number // for fruits: user-measured Brix overriding catalogue value
}

// Ice cream type identifiers
export type IceCreamType = 'cremeeis' | 'milcheis' | 'fruchtsorbet' | 'schokoladeneis' | 'nusseis' | 'joghurteis'

// A complete recipe, stored on a canonical 1000 g basis (batch size is a view concern).
export interface RecipeData {
	type: IceCreamType
	ingredients: RecipeIngredient[]
	notes: string
	author?: string
}

// Target ranges for a specific ice cream type
export interface TargetRanges {
	type: IceCreamType
	label: I18nString
	ts: Range
	fat: Range
	slng: Range
	sugar: Range
	pod: Range
	pac: Range
	overrun: Range
	servingTemp: Range
	protein: Range
}

// Computed balance result
export interface BalanceResult {
	totalWeight: number
	waterPercent: number
	totalSolidsPercent: number
	fatPercent: number
	slngPercent: number
	sugarPercent: number
	proteinPercent: number
	lactosePercent: number
	pod: number
	pac: number
	maxSlng: number
}

// Balance status for a single parameter
export type BalanceStatus = 'low' | 'ok' | 'high'
