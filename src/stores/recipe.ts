import { toRaw, provide, inject } from 'vue'
import type { InjectionKey } from 'vue'
import { createStore } from '~/lib/store'
import type { RecipeData, RecipeIngredient, IceCreamType, RecipeSource, BalanceResult, BalanceStatus, Range } from '~/lib/types'
import { calcBalance } from '~/lib/formulas'
import { targetRanges } from '~/lib/ranges'
import { generateSuggestions, autoFill } from '~/lib/solver'
import { areRecipesEqual, apportion, normalizeTo1000, round2 } from '~/lib/recipe'

function checkRange (value: number, range: Range): BalanceStatus {
	if (value < range.min) return 'low'
	if (value > range.max) return 'high'
	return 'ok'
}

export type RecipeStore = ReturnType<typeof createRecipeStore>

const recipeStoreKey: InjectionKey<RecipeStore> = Symbol('recipeStore')

export function makeRecipeStore () {
	return createStore('recipe', {
		state () {
			return {
				recipe: {
					type: 'milcheis',
					ingredients: [],
					notes: '',
				} as RecipeData,
				// View-only multiplier (1 = canonical 1 kg basis). Never persisted,
				// never part of recipe identity — resizing is "instancing", not editing.
				batchFactor: 1,
				loadedId: null as string | null,
				loadedSource: null as RecipeSource | null,
				loadedRecipe: null as RecipeData | null,
			}
		},

		getters: {
			balance (): BalanceResult {
				return calcBalance(this.recipe.ingredients)
			},

			// Ingredient grams scaled to the current batch, rounded so the rows sum
			// exactly to displayTotal (residual lands on the largest ingredient).
			displayIngredients (): RecipeIngredient[] {
				return apportion(this.recipe.ingredients, this.batchFactor)
			},

			displayTotal (): number {
				return round2(this.balance.totalWeight * this.batchFactor)
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
				// Computed in display units so suggested grams/text match what the user sees.
				return generateSuggestions(this.displayIngredients, this.recipe.type, this.displayTotal)
			},

			isModified (): boolean {
				if (!this.loadedRecipe) return false
				return !areRecipesEqual(this.recipe, this.loadedRecipe)
			},

			// Can the loaded recipe be saved back in place? User recipes always; Featured
			// only in dev (writes the git-tracked YAML via the dev middleware).
			canUpdate (): boolean {
				return this.loadedSource === 'user' || (import.meta.env.DEV && this.loadedSource === 'featured')
			},
		},

		actions: {
			// `grams` here is in display units — convert to the canonical 1 kg basis.
			addIngredient (ingredient: RecipeIngredient) {
				this.recipe.ingredients.push({
					...ingredient,
					grams: ingredient.grams / this.batchFactor,
				})
			},

			removeIngredient (index: number) {
				this.recipe.ingredients.splice(index, 1)
			},

			// `displayGrams` is the value the user typed (display units). If it already
			// equals what's rendered, nothing changed — leave the canonical grams alone
			// so a no-op edit can't perturb the recipe or flag it as modified.
			updateGrams (index: number, displayGrams: number) {
				const ing = this.recipe.ingredients[index]
				if (!ing) return
				if (displayGrams === this.displayIngredients[index]?.grams) return
				ing.grams = displayGrams / this.batchFactor
			},

			updateMeasuredBrix (index: number, brix: number | undefined) {
				if (this.recipe.ingredients[index]) {
					this.recipe.ingredients[index].measuredBrix = brix
				}
			},

			setType (type: IceCreamType) {
				this.recipe.type = type
			},

			// Resize the whole recipe to a displayed total of `grams` by adjusting the
			// view multiplier only — the canonical grams are never touched, so this is
			// "instancing" and never marks the recipe as modified.
			setDisplayTotal (grams: number) {
				if (grams <= 0) return
				if (grams === this.displayTotal) return
				const sum = this.balance.totalWeight
				if (sum > 0) this.batchFactor = grams / sum
			},

			loadRecipe (data: { type: IceCreamType, ingredients: RecipeIngredient[], notes?: string }, id?: string, source?: RecipeSource) {
				this.recipe.type = data.type
				this.recipe.ingredients = data.ingredients
				this.recipe.notes = data.notes ?? ''
				this.batchFactor = 1
				if (id) {
					this.loadedRecipe = structuredClone(toRaw(this.recipe))
					this.loadedId = id
					this.loadedSource = source ?? null
				}
			},

			markAsSaved (id: string, source: RecipeSource) {
				this.loadedRecipe = structuredClone(toRaw(this.recipe))
				this.loadedId = id
				this.loadedSource = source
			},

			clearLoaded () {
				this.loadedRecipe = null
				this.loadedId = null
				this.loadedSource = null
			},

			autoFillRecipe () {
				// Fill against the canonical 1 kg basis; the view multiplier renders it
				// at whatever instance size the user is viewing.
				const filled = autoFill(this.recipe.type, 1000, [...this.recipe.ingredients])
				this.recipe.ingredients = filled
			},

			// Persisted form: canonical 1 kg basis, no batch size.
			toRecipeData (): RecipeData {
				const raw = structuredClone(toRaw(this.recipe))
				raw.ingredients = normalizeTo1000(raw.ingredients)
				return raw
			},
		},
	})
}

export function createRecipeStore () {
	const store = makeRecipeStore()
	provide(recipeStoreKey, store)
	return store
}

export function useRecipeStore () {
	const store = inject(recipeStoreKey)
	if (!store) throw new Error('recipeStore not provided — must be used inside Calculator view')
	return store
}
