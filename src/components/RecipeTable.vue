<script setup lang="ts">
import { watch } from 'vue'
import { useRecipeStore } from '~/stores/recipe'
import IngredientRow from './IngredientRow.vue'

const recipeStore = useRecipeStore()

// Editable total: resizes the whole recipe (instancing) on commit.
let totalStr = $ref(String(recipeStore.displayTotal))
watch(() => recipeStore.displayTotal, (v) => {
	totalStr = String(v)
})

function onUpdateGrams (index: number, grams: number) {
	recipeStore.updateGrams(index, grams)
}

function onUpdateBrix (index: number, brix: number | undefined) {
	recipeStore.updateMeasuredBrix(index, brix)
}

function onRemove (index: number) {
	recipeStore.removeIngredient(index)
}

function onTotalCommit () {
	const n = parseFloat(totalStr)
	if (!isNaN(n) && n > 0) recipeStore.setDisplayTotal(n)
	totalStr = String(recipeStore.displayTotal)
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
				v-for="(ing, i) in recipeStore.displayIngredients"
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
				td.total-grams
					input.total-input(
						v-model="totalStr"
						type="number"
						min="1"
						step="1"
						@change="onTotalCommit"
						@keyup.enter="onTotalCommit"
					)
					span.unit  g
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

			.total-grams
				white-space: nowrap

				.total-input
					width: 80px
					padding: 4px 8px
					border: 1px solid var(--clr-grey-300)
					border-radius: 4px
					font-size: 14px
					font-weight: 600
					text-align: right

				.unit
					color: var(--clr-secondary-text-light)

	.empty
		color: var(--clr-secondary-text-light)
		font-style: italic
		padding: 24px 0
</style>
