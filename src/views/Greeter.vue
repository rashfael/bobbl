<script setup lang="ts">
import { useRecipeLists } from '~/composables/useRecipeLists'

// Lists are populated by the always-mounted sidebar; we only read the counts here.
const { featured, userRecipes } = useRecipeLists()
</script>

<template lang="pug">
.v-greeter
	.card
		h1 Bobbl
		p.tagline Compose balanced gelato &amp; sorbet recipes.
		p.lead
			| Pick a recipe from the sidebar to inspect its composition and balance, or
			| start one from scratch. The numbers — TS, fat, sugar, POD, PAC — update live
			| against the target ranges for each ice cream type.
		router-link.cta(:to="{ name: 'new-recipe' }")
			bunt-button New recipe
		p.counts
			| {{ featured.length }} featured · {{ userRecipes.length }} of your own
		p.hint Your recipes are saved in this browser. Use Export in the sidebar to back them up.
</template>

<style lang="sass">
.v-greeter
	display: flex
	align-items: center
	justify-content: center
	min-height: 100%
	padding: 32px

	.card
		max-width: 460px
		text-align: center

		h1
			margin: 0
			font-size: 48px
			color: var(--clr-primary)

		.tagline
			margin: 8px 0 24px
			font-size: 18px
			color: var(--clr-secondary-text-light)

		.lead
			margin: 0 0 24px
			line-height: 1.6
			color: var(--clr-primary-text-light)

		.cta
			text-decoration: none

		.counts
			margin: 16px 0 0
			font-size: 13px
			color: var(--clr-secondary-text-light)

		.hint
			margin: 24px 0 0
			font-size: 13px
			color: var(--clr-secondary-text-light)
</style>
