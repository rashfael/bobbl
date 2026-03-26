<script setup lang="ts">
import type { RecipeIngredient, Ingredient } from '~/lib/types'
import { findIngredient } from '~/lib/ingredients'

const { ingredient, index } = defineProps<{
	ingredient: RecipeIngredient
	index: number
}>()

const emit = defineEmits<{
	updateGrams: [index: number, grams: number]
	updateBrix: [index: number, brix: number | undefined]
	remove: [index: number]
}>()

const info = $computed<Ingredient | undefined>(() => findIngredient(ingredient.category, ingredient.ingredientId))
const isFruit = $computed(() => ingredient.category === 'fruits')

function onGramsInput (event: Event) {
	const val = parseFloat((event.target as HTMLInputElement).value)
	if (!isNaN(val) && val >= 0) {
		emit('updateGrams', index, val)
	}
}

function onBrixInput (event: Event) {
	const raw = (event.target as HTMLInputElement).value
	if (raw === '') {
		emit('updateBrix', index, undefined)
	} else {
		const val = parseFloat(raw)
		if (!isNaN(val) && val >= 0) {
			emit('updateBrix', index, val)
		}
	}
}
</script>
<template lang="pug">
tr.c-ingredient-row
	td.name {{ info?.name.de ?? ingredient.ingredientId }}
	td.category {{ ingredient.category }}
	td.grams
		input(
			type="number"
			:value="ingredient.grams"
			min="0"
			step="1"
			@input="onGramsInput"
		)
	td.brix(v-if="isFruit")
		input(
			type="number"
			:value="ingredient.measuredBrix"
			placeholder="Brix"
			min="0"
			max="100"
			step="0.1"
			@input="onBrixInput"
		)
	td.brix(v-else)
		span.na —
	td.actions
		button.remove(@click="emit('remove', index)") &times;
</template>
<style lang="sass">
.c-ingredient-row
	td
		padding: 4px 8px
		vertical-align: middle

	.name
		font-weight: 500

	.category
		font-size: 12px
		color: var(--clr-secondary-text-light)

	input[type="number"]
		width: 80px
		padding: 4px 8px
		border: 1px solid var(--clr-grey-300)
		border-radius: 4px
		font-size: 14px
		text-align: right

	.na
		color: var(--clr-grey-400)
		font-size: 12px

	.remove
		background: none
		border: none
		cursor: pointer
		font-size: 18px
		color: var(--clr-red-400)
		padding: 4px 8px
		border-radius: 4px

		&:hover
			background: var(--clr-red-50)
			color: var(--clr-red-600)
</style>
