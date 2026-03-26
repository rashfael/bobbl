<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRecipeStore } from '~/stores/recipe'
import { saveRecipe } from '~/lib/api/recipes'
import { useRouteSync } from '~/composables/useRouteSync'
import { useRecipeList } from '~/composables/useRecipeList'
import TypeSelector from '~/components/TypeSelector.vue'
import RecipeTable from '~/components/RecipeTable.vue'
import IngredientPicker from '~/components/IngredientPicker.vue'
import BalancePanel from '~/components/BalancePanel.vue'

const store = createRecipeStore()
const router = useRouter()
const { loading, error } = useRouteSync(store)
const { refresh: refreshRecipes } = useRecipeList()

const forkName = ref('')
const showFork = ref(false)
const saving = ref(false)

async function updateRecipe () {
	if (!store.loadedId) return
	saving.value = true
	try {
		await saveRecipe(store.loadedId, store.toRecipeData())
		store.markAsSaved(store.loadedId)
		await refreshRecipes()
	} finally {
		saving.value = false
	}
}

async function forkRecipe () {
	const id = forkName.value.trim()
	if (!id) return
	saving.value = true
	try {
		await saveRecipe(id, store.toRecipeData())
		store.markAsSaved(id)
		await refreshRecipes()
		showFork.value = false
		forkName.value = ''
		router.push({ name: 'recipe', params: { id } })
	} finally {
		saving.value = false
	}
}

async function saveNew () {
	const id = forkName.value.trim()
	if (!id) return
	saving.value = true
	try {
		await saveRecipe(id, store.toRecipeData())
		store.markAsSaved(id)
		await refreshRecipes()
		showFork.value = false
		forkName.value = ''
		router.push({ name: 'recipe', params: { id } })
	} finally {
		saving.value = false
	}
}
</script>

<template lang="pug">
.v-calculator
	.loading-overlay(v-if="loading")
		bunt-progress-circular
	.error-bar(v-if="error")
		| {{ error }}
	.modified-bar(v-if="store.isModified && store.loadedId")
		span.label Recipe modified
		.actions
			bunt-button(:disabled="saving" @click="updateRecipe") Update
			bunt-button(:disabled="saving" @click="showFork = !showFork") Fork
			.fork-input(v-if="showFork")
				input(v-model="forkName" placeholder="New recipe name..." @keyup.enter="forkRecipe")
				bunt-button(:disabled="!forkName.trim() || saving" @click="forkRecipe") Save
	.save-bar(v-if="!store.loadedId && store.recipe.ingredients.length")
		bunt-button(@click="showFork = !showFork") Save Recipe
		.fork-input(v-if="showFork")
			input(v-model="forkName" placeholder="Recipe name..." @keyup.enter="saveNew")
			bunt-button(:disabled="!forkName.trim() || saving" @click="saveNew") Save
	section.controls
		TypeSelector
	.layout
		section.recipe
			h2 Recipe
			RecipeTable
			IngredientPicker
			.actions
				bunt-button(@click="store.autoFillRecipe()") Auto-Fill
				bunt-button.reset-btn(@click="store.$reset()") Reset
		section.balance
			BalancePanel
			.suggestions(v-if="store.suggestions.length")
				h3 Suggestions
				ul
					li(v-for="s in store.suggestions" :key="s.parameter")
						span.description {{ s.description }}
						bunt-button.apply-btn(
							v-if="s.ingredientId && s.grams"
							@click="store.addIngredient({ ingredientId: s.ingredientId, category: s.category, grams: s.grams })"
						) Apply
	section.notes
		label Notes
		textarea(v-model="store.recipe.notes" rows="3" placeholder="Recipe notes...")
</template>

<style lang="sass">
.v-calculator
	position: relative
	padding: 32px
	max-width: 1100px

	.loading-overlay
		position: absolute
		inset: 0
		display: flex
		align-items: center
		justify-content: center
		background: rgba(255, 255, 255, 0.7)
		z-index: 10

	.error-bar
		padding: 8px 16px
		background: var(--clr-red-50, #fef2f2)
		color: var(--clr-red-600, #dc2626)
		border-radius: 4px
		margin-bottom: 16px
		font-size: 14px

	.modified-bar,
	.save-bar
		display: flex
		align-items: center
		gap: 8px
		padding: 8px 16px
		background: var(--clr-amber-50, #fffbeb)
		border-radius: 4px
		margin-bottom: 16px
		flex-wrap: wrap

		.label
			font-size: 13px
			font-weight: 600
			color: var(--clr-amber-800, #92400e)

		.actions
			display: flex
			align-items: center
			gap: 8px

		.fork-input
			display: flex
			align-items: center
			gap: 8px

			input
				padding: 4px 8px
				border: 1px solid var(--clr-grey-300)
				border-radius: 4px
				font-size: 14px
				font-family: inherit

		.bunt-button
			--button-size: small

	.controls
		display: flex
		flex-direction: column
		gap: 8px
		margin-bottom: 24px
		padding-bottom: 16px
		border-bottom: 1px solid var(--clr-grey-200)

	.layout
		display: grid
		grid-template-columns: 1fr 360px
		gap: 32px
		align-items: start

		@media (max-width: 900px)
			grid-template-columns: 1fr

	.recipe
		h2
			margin: 0 0 16px
			font-size: 18px

		.actions
			display: flex
			gap: 8px
			margin-top: 16px

		.reset-btn
			--button-weight: outlined

	.balance
		position: sticky
		top: 16px

	.suggestions
		margin-top: 24px

		h3
			margin: 0 0 8px
			font-size: 14px

		ul
			list-style: none
			padding: 0
			margin: 0
			display: flex
			flex-direction: column
			gap: 8px

		li
			display: flex
			align-items: center
			gap: 8px
			padding: 8px
			background: var(--clr-amber-50)
			border-radius: 4px
			font-size: 13px

			.description
				flex: 1

		.apply-btn
			--button-size: small
			--button-weight: outlined

	.notes
		margin-top: 32px

		label
			display: block
			font-size: 12px
			text-transform: uppercase
			font-weight: 600
			color: var(--clr-secondary-text-light)
			margin-bottom: 4px

		textarea
			width: 100%
			padding: 8px 12px
			border: 1px solid var(--clr-grey-300)
			border-radius: 4px
			font-size: 14px
			font-family: inherit
			resize: vertical
			box-sizing: border-box
</style>
