<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { exportUserRecipes, importUserRecipes } from '~/lib/api/userRecipes'
import { useRecipeLists } from '~/composables/useRecipeLists'

const route = useRoute()
const { search, filteredFeatured, filteredUserRecipes, refresh, refreshUser } = useRecipeLists()

const fileInput = ref<HTMLInputElement>()

function isActive (source: string, id: string) {
	return route.params.source === source && route.params.id === id
}

function exportRecipes () {
	const blob = new Blob([exportUserRecipes()], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `bobbl-recipes-${new Date().toISOString().slice(0, 10)}.json`
	a.click()
	URL.revokeObjectURL(url)
}

async function onImportFile (event: Event) {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return
	try {
		const { added, renamed } = importUserRecipes(await file.text())
		refreshUser()
		let msg = `Imported ${added.length} recipe${added.length === 1 ? '' : 's'}.`
		if (renamed.length) {
			msg += `\n\n${renamed.length} renamed to avoid collisions:\n`
			msg += renamed.map(([from, to]) => `  ${from} → ${to}`).join('\n')
		}
		alert(msg)
	} catch (err) {
		alert(`Import failed: ${(err as Error).message}`)
	} finally {
		input.value = ''
	}
}

onMounted(refresh)
</script>

<template lang="pug">
.c-recipe-sidebar
	.app-header
		h1 Bobbl
		p.subtitle Ice Cream Calculator
	.toolbar
		router-link.new-btn(:to="{ name: 'new-recipe' }")
			bunt-button New Recipe
	.search
		bunt-input(label="Search" v-model="search")
	.scroll
		.section
			h2 Featured
			.recipe-list
				router-link.recipe-item(
					v-for="id in filteredFeatured"
					:key="id"
					:to="{ name: 'recipe', params: { source: 'featured', id } }"
					:class="{ active: isActive('featured', id) }"
				)
					span.name {{ id }}
				.empty(v-if="!filteredFeatured.length") No featured recipes
		.section
			h2 My Recipes
			.recipe-list
				router-link.recipe-item(
					v-for="id in filteredUserRecipes"
					:key="id"
					:to="{ name: 'recipe', params: { source: 'user', id } }"
					:class="{ active: isActive('user', id) }"
				)
					span.name {{ id }}
				.empty(v-if="!filteredUserRecipes.length") No saved recipes
	.footer
		bunt-button.io-btn(@click="exportRecipes") Export
		bunt-button.io-btn(@click="fileInput?.click()") Import
		input(ref="fileInput" type="file" accept="application/json" hidden @change="onImportFile")
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

	.toolbar
		padding: 12px 16px
		border-bottom: 1px solid var(--clr-grey-200)

		.new-btn
			display: block
			text-decoration: none

			.bunt-button
				width: 100%

	.search
		padding: 12px 16px 4px

		.bunt-input
			--input-size: compact

	.scroll
		flex: 1
		overflow-y: auto
		padding-bottom: 8px

	.section
		h2
			margin: 0
			padding: 12px 16px 4px
			font-size: 12px
			text-transform: uppercase
			letter-spacing: 0.04em
			color: var(--clr-secondary-text-light)

	.recipe-list
		padding: 4px 0

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

	.empty
		padding: 8px 16px
		color: var(--clr-secondary-text-light)
		font-size: 13px

	.footer
		display: flex
		gap: 8px
		padding: 12px 16px
		border-top: 1px solid var(--clr-grey-200)

		.io-btn
			flex: 1
			--button-size: small
</style>
