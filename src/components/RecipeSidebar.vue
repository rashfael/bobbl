<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteRecipe } from '~/lib/api/recipes'
import { useRecipeList } from '~/composables/useRecipeList'

const route = useRoute()
const router = useRouter()
const { recipes, refresh } = useRecipeList()

async function remove (id: string) {
	if (!confirm(`Delete recipe "${id}"?`)) return
	await deleteRecipe(id)
	await refresh()
	if (route.params.id === id) {
		router.push({ name: 'new-recipe' })
	}
}

onMounted(refresh)
</script>

<template lang="pug">
.c-recipe-sidebar
	.app-header
		h1 Bobbl
		p.subtitle Ice Cream Calculator
	.header
		h2 Recipes
		router-link.new-btn(:to="{ name: 'new-recipe' }")
			bunt-button New Recipe
	.recipe-list
		router-link.recipe-item(
			v-for="id in recipes"
			:key="id"
			:to="{ name: 'recipe', params: { id } }"
			:class="{ active: route.params.id === id }"
		)
			span.name {{ id }}
			button.delete-btn(@click.prevent.stop="remove(id)" title="Delete")
				| ×
	.empty(v-if="!recipes.length") No saved recipes
</template>

<style lang="sass">
.c-recipe-sidebar
	width: 256px
	min-width: 256px
	height: 100vh
	display: flex
	flex-direction: column
	border-right: 1px solid var(--clr-grey-200)
	background: var(--clr-grey-50)

	.app-header
		padding: 16px
		border-bottom: 1px solid var(--clr-grey-200)

		h1
			margin: 0
			font-size: 24px
			color: var(--clr-primary)

		.subtitle
			margin: 4px 0 0
			color: var(--clr-secondary-text-light)
			font-size: 13px

	.header
		padding: 16px
		display: flex
		align-items: center
		justify-content: space-between
		border-bottom: 1px solid var(--clr-grey-200)

		h2
			margin: 0
			font-size: 16px
			color: var(--clr-primary)

		.new-btn
			text-decoration: none

			.bunt-button
				--button-size: small

	.recipe-list
		flex: 1
		overflow-y: auto
		padding: 8px 0

	.recipe-item
		display: flex
		align-items: center
		padding: 8px 16px
		text-decoration: none
		color: var(--clr-primary-text-light)
		transition: background 0.15s
		cursor: pointer

		&:hover
			background: var(--clr-grey-100)

		&.active,
		&.router-link-exact-active
			background: var(--clr-brown-50, var(--clr-grey-200))
			font-weight: 600

		.name
			flex: 1
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
			font-size: 14px

		.delete-btn
			display: none
			background: none
			border: none
			color: var(--clr-secondary-text-light)
			cursor: pointer
			font-size: 18px
			line-height: 1
			padding: 0 4px

			&:hover
				color: var(--clr-danger, var(--clr-red-600))

		&:hover .delete-btn
			display: block

	.empty
		padding: 16px
		color: var(--clr-secondary-text-light)
		font-size: 13px
		text-align: center
</style>
