<script setup lang="ts">
import { useRecipeStore } from '~/stores/recipe'

const recipeStore = useRecipeStore()
import IngredientRow from './IngredientRow.vue'

function onUpdateGrams (index: number, grams: number) {
	recipeStore.updateGrams(index, grams)
}

function onUpdateBrix (index: number, brix: number | undefined) {
	recipeStore.updateMeasuredBrix(index, brix)
}

function onRemove (index: number) {
	recipeStore.removeIngredient(index)
}
</script>
<template lang="pug">
.c-recipe-table
	table(v-if="recipeStore.recipe.ingredients.length")
		thead
			tr
				th Ingredient
				th Category
				th Grams
				th Brix
				th
		tbody
			IngredientRow(
				v-for="(ing, i) in recipeStore.recipe.ingredients"
				:key="i"
				:ingredient="ing"
				:index="i"
				@updateGrams="onUpdateGrams"
				@updateBrix="onUpdateBrix"
				@remove="onRemove"
			)
		tfoot
			tr.total-row
				td Total
				td
				td.total-grams {{ recipeStore.balance.totalWeight.toFixed(0) }} g
				td
				td
	p.empty(v-else) No ingredients yet. Add an ingredient to get started.
</template>
<style lang="sass">
.c-recipe-table
	table
		width: 100%
		border-collapse: collapse

		th
			text-align: left
			padding: 8px
			font-size: 12px
			text-transform: uppercase
			color: var(--clr-secondary-text-light)
			border-bottom: 2px solid var(--clr-grey-300)

		.total-row
			td
				padding: 8px
				font-weight: 600
				border-top: 2px solid var(--clr-grey-300)

	.empty
		color: var(--clr-secondary-text-light)
		font-style: italic
		padding: 24px 0
</style>
