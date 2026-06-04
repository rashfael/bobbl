<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRecipeStore } from '~/stores/recipe'
import { saveUserRecipe, uniqueUserName, deleteUserRecipe } from '~/lib/api/userRecipes'
import { storeFeatured, deleteFeatured } from '~/lib/api/featured'
import { useRouteSync } from '~/composables/useRouteSync'
import { useRecipeLists } from '~/composables/useRecipeLists'
import TypeSelector from '~/components/TypeSelector.vue'
import RecipeTable from '~/components/RecipeTable.vue'
import IngredientPicker from '~/components/IngredientPicker.vue'
import BalancePanel from '~/components/BalancePanel.vue'

const store = createRecipeStore()
const router = useRouter()
const { loading, error } = useRouteSync(store)
const { refreshUser, refreshFeatured } = useRecipeLists()

const isDev = import.meta.env.DEV

const nameInput = ref('')
const showNameFor = ref<'user' | 'featured' | null>(null)
const saving = ref(false)

function openNamePrompt (kind: 'user' | 'featured') {
	showNameFor.value = showNameFor.value === kind ? null : kind
	nameInput.value = store.loadedId ?? ''
}

// Save the loaded recipe back in place: user recipes always, Featured only in dev (YAML).
async function update () {
	if (!store.loadedId || !store.canUpdate) return
	saving.value = true
	try {
		if (store.loadedSource === 'user') {
			saveUserRecipe(store.loadedId, store.toRecipeData())
			store.markAsSaved(store.loadedId, 'user')
			refreshUser()
		} else if (store.loadedSource === 'featured') {
			await storeFeatured(store.loadedId, store.toRecipeData())
			store.markAsSaved(store.loadedId, 'featured')
			await refreshFeatured()
		}
	} finally {
		saving.value = false
	}
}

// Persist the current recipe as a NEW user recipe (Save and Fork share this path).
async function saveAsUser () {
	const base = nameInput.value.trim()
	if (!base) return
	saving.value = true
	try {
		const id = uniqueUserName(base)
		saveUserRecipe(id, store.toRecipeData())
		store.markAsSaved(id, 'user')
		refreshUser()
		showNameFor.value = null
		nameInput.value = ''
		router.push({ name: 'recipe', params: { source: 'user', id } })
	} finally {
		saving.value = false
	}
}

// Dev-only: promote the current recipe into the git-tracked Featured set (overwrites by name).
async function saveAsFeatured () {
	const id = nameInput.value.trim()
	if (!id) return
	saving.value = true
	try {
		await storeFeatured(id, store.toRecipeData())
		store.markAsSaved(id, 'featured')
		await refreshFeatured()
		showNameFor.value = null
		nameInput.value = ''
		router.push({ name: 'recipe', params: { source: 'featured', id } })
	} finally {
		saving.value = false
	}
}

function submitName () {
	if (showNameFor.value === 'featured') saveAsFeatured()
	else saveAsUser()
}

async function removeCurrent () {
	if (!store.loadedId || !store.loadedSource) return
	if (!confirm(`Delete recipe "${store.loadedId}"?`)) return
	if (store.loadedSource === 'user') {
		deleteUserRecipe(store.loadedId)
		refreshUser()
	} else {
		await deleteFeatured(store.loadedId)
		await refreshFeatured()
	}
	store.clearLoaded()
	router.push({ name: 'home' })
}
</script>

<template lang="pug">
.v-calculator
	.loading-overlay(v-if="loading")
		bunt-progress-circular
	.error-bar(v-if="error")
		| {{ error }}
	.recipe-bar(v-if="store.loadedId || store.recipe.ingredients.length")
		span.label(v-if="store.loadedSource === 'featured' && !store.canUpdate") Featured · read-only
		span.label(v-else-if="store.isModified") Modified
		.actions
			bunt-button(v-if="store.isModified && store.canUpdate" :disabled="saving" @click="update") {{ store.loadedSource === 'featured' ? 'Save to YAML' : 'Update' }}
			bunt-button(v-if="!store.loadedId && store.recipe.ingredients.length" :disabled="saving" @click="openNamePrompt('user')") Save
			bunt-button(v-if="store.loadedId" :disabled="saving" @click="openNamePrompt('user')") Fork
			bunt-button(v-if="isDev" :disabled="saving" @click="openNamePrompt('featured')") Store to Featured
			bunt-button.danger(v-if="store.loadedId && (store.loadedSource === 'user' || isDev)" :disabled="saving" @click="removeCurrent") Delete
		.name-input(v-if="showNameFor")
			input(v-model="nameInput" :placeholder="showNameFor === 'featured' ? 'Featured name...' : 'Recipe name...'" @keyup.enter="submitName")
			bunt-button(:disabled="!nameInput.trim() || saving" @click="submitName") {{ showNameFor === 'featured' ? 'Store' : 'Save' }}
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

	.recipe-bar
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
			flex-wrap: wrap

		.name-input
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

			&.danger
				--button-color: var(--clr-danger, var(--clr-red-600))

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
