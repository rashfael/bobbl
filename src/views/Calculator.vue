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

const saving = ref(false)

// Save the loaded recipe back in place: user recipes always, Featured only in dev
// (YAML). Editing the inline name renames it: write under the new name, drop the old.
async function update () {
	if (!store.loadedId || !store.canUpdate) return
	const newName = store.name.trim()
	if (!newName) return
	const renamed = newName !== store.loadedId
	saving.value = true
	try {
		if (store.loadedSource === 'user') {
			const id = renamed ? uniqueUserName(newName) : store.loadedId
			saveUserRecipe(id, store.toRecipeData())
			if (renamed) deleteUserRecipe(store.loadedId)
			store.markAsSaved(id, 'user')
			refreshUser()
			if (renamed) router.push({ name: 'recipe', params: { source: 'user', id } })
		} else if (store.loadedSource === 'featured') {
			await storeFeatured(newName, store.toRecipeData())
			if (renamed) await deleteFeatured(store.loadedId)
			store.markAsSaved(newName, 'featured')
			await refreshFeatured()
			if (renamed) router.push({ name: 'recipe', params: { source: 'featured', id: newName } })
		}
	} finally {
		saving.value = false
	}
}

// Persist the current recipe as a NEW user recipe (Save and Fork share this path).
async function saveAsUser () {
	const base = store.name.trim() || 'Untitled'
	saving.value = true
	try {
		const id = uniqueUserName(base)
		saveUserRecipe(id, store.toRecipeData())
		store.markAsSaved(id, 'user')
		refreshUser()
		router.push({ name: 'recipe', params: { source: 'user', id } })
	} finally {
		saving.value = false
	}
}

// Dev-only: promote the current recipe into the git-tracked Featured set (overwrites by name).
async function saveAsFeatured () {
	const id = store.name.trim()
	if (!id) return
	saving.value = true
	try {
		await storeFeatured(id, store.toRecipeData())
		store.markAsSaved(id, 'featured')
		await refreshFeatured()
		router.push({ name: 'recipe', params: { source: 'featured', id } })
	} finally {
		saving.value = false
	}
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
			bunt-button(v-if="!store.loadedId && store.recipe.ingredients.length" :disabled="saving" @click="saveAsUser") Save
			bunt-button(v-if="store.loadedId" :disabled="saving" @click="saveAsUser") Fork
			bunt-button(v-if="isDev" :disabled="saving" @click="saveAsFeatured") Store to Featured
			bunt-button.danger(v-if="store.loadedId && (store.loadedSource === 'user' || isDev)" :disabled="saving" @click="removeCurrent") Delete
	.layout
		section.recipe
			.recipe-header
				.title
					input.name-field(v-model="store.name" placeholder="Untitled recipe")
					span.by by
					input.author-field(v-model="store.recipe.author" placeholder="author")
				TypeSelector
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

		.bunt-button
			--button-size: small

			&.danger
				--button-color: var(--clr-danger, var(--clr-red-600))

	.layout
		display: grid
		grid-template-columns: 1fr 360px
		gap: 32px
		align-items: start

		@media (max-width: 900px)
			grid-template-columns: 1fr

	.recipe
		.recipe-header
			display: flex
			align-items: baseline
			justify-content: space-between
			gap: 16px
			margin-bottom: 16px
			flex-wrap: wrap

			.title
				display: flex
				align-items: baseline
				gap: 6px
				min-width: 0

			.name-field, .author-field
				border: none
				background: transparent
				padding: 0
				font-family: inherit
				color: inherit
				field-sizing: content
				border-bottom: 1px solid transparent

				&:focus
					outline: none

				&:hover, &:focus
					border-bottom-color: var(--clr-grey-300)

				&:focus
					border-bottom-color: var(--clr-primary)

				&::placeholder
					color: var(--clr-grey-400)
					font-weight: 400

			.name-field
				font-size: 18px
				font-weight: 600
				min-width: 6ch
				max-width: 100%

			.by
				color: var(--clr-secondary-text-light)
				font-size: 14px

			.author-field
				font-size: 14px
				color: var(--clr-secondary-text-light)
				min-width: 4ch

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
