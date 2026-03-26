import { toRaw, provide, inject } from 'vue'
import type { InjectionKey } from 'vue'
import { createStore } from '~/lib/store'
import type { RecipeIngredient, IceCreamType, BalanceResult, BalanceStatus, Range } from '~/lib/types'
import { calcBalance } from '~/lib/formulas'
import { targetRanges } from '~/lib/ranges'
import { generateSuggestions, autoFill } from '~/lib/solver'
import { areRecipesEqual } from '~/lib/url'
import type { RecipeData } from '~/lib/url'

function checkRange (value: number, range: Range): BalanceStatus {
	if (value < range.min) return 'low'
	if (value > range.max) return 'high'
	return 'ok'
}

export type RecipeStore = ReturnType<typeof createRecipeStore>

const recipeStoreKey: InjectionKey<RecipeStore> = Symbol('recipeStore')

export function createRecipeStore () {
	const store = createStore('recipe', {
		state () {
			return {
				recipe: {
					type: 'milcheis',
					batchSize: 1000,
					ingredients: [],
					notes: '',
				} as RecipeData,
				loadedId: null as string | null,
				loadedRecipe: null as RecipeData | null,
			}
		},

		getters: {
			balance (): BalanceResult {
				return calcBalance(this.recipe.ingredients)
			},

			ranges () {
				return targetRanges[this.recipe.type]
			},

			status () {
				const b = this.balance
				const r = this.ranges
				return {
					ts: checkRange(b.totalSolidsPercent, r.ts),
					fat: checkRange(b.fatPercent, r.fat),
					slng: checkRange(b.slngPercent, r.slng),
					sugar: checkRange(b.sugarPercent, r.sugar),
					pod: checkRange(b.pod, r.pod),
					pac: checkRange(b.pac, r.pac),
					protein: checkRange(b.proteinPercent, r.protein),
					slngLimit: b.slngPercent <= b.maxSlng ? 'ok' as BalanceStatus : 'high' as BalanceStatus,
				}
			},

			suggestions () {
				return generateSuggestions(this.recipe.ingredients, this.recipe.type, this.recipe.batchSize)
			},

			isModified (): boolean {
				if (!this.loadedRecipe) return false
				return !areRecipesEqual(this.recipe, this.loadedRecipe)
			},
		},

		actions: {
			addIngredient (ingredient: RecipeIngredient) {
				this.recipe.ingredients.push(ingredient)
			},

			removeIngredient (index: number) {
				this.recipe.ingredients.splice(index, 1)
			},

			updateGrams (index: number, grams: number) {
				if (this.recipe.ingredients[index]) {
					this.recipe.ingredients[index].grams = grams
				}
			},

			updateMeasuredBrix (index: number, brix: number | undefined) {
				if (this.recipe.ingredients[index]) {
					this.recipe.ingredients[index].measuredBrix = brix
				}
			},

			setType (type: IceCreamType) {
				this.recipe.type = type
			},

			setBatchSize (size: number) {
				this.recipe.batchSize = size
			},

			loadRecipe (data: { type: IceCreamType, batchSize: number, ingredients: RecipeIngredient[], notes?: string }, id?: string) {
				this.recipe.type = data.type
				this.recipe.batchSize = data.batchSize
				this.recipe.ingredients = data.ingredients
				this.recipe.notes = data.notes ?? ''
				if (id) {
					this.loadedRecipe = structuredClone(toRaw(this.recipe))
					this.loadedId = id
				}
			},

			markAsSaved (id: string) {
				this.loadedRecipe = structuredClone(toRaw(this.recipe))
				this.loadedId = id
			},

			clearLoaded () {
				this.loadedRecipe = null
				this.loadedId = null
			},

			autoFillRecipe () {
				const filled = autoFill(this.recipe.type, this.recipe.batchSize, [...this.recipe.ingredients])
				this.recipe.ingredients = filled
			},

			toRecipeData (): RecipeData {
				return structuredClone(toRaw(this.recipe))
			},
		},
	})

	provide(recipeStoreKey, store)
	return store
}

export function useRecipeStore () {
	const store = inject(recipeStoreKey)
	if (!store) throw new Error('recipeStore not provided — must be used inside Calculator view')
	return store
}
