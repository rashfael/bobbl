<script setup lang="ts">
import type { IngredientCategory } from '~/lib/types'
import { ingredientGroups } from '~/lib/ingredients'
import { useRecipeStore } from '~/stores/recipe'

const recipeStore = useRecipeStore()

let selectedValue = $ref('')
let gramsStr = $ref('100')

function add () {
	const grams = parseInt(gramsStr)
	if (!selectedValue || isNaN(grams) || grams <= 0) return
	// split on the first ':' — category/ids are colon-free slugs, but this stays robust if that changes
	const idx = selectedValue.indexOf(':')
	const category = selectedValue.slice(0, idx) as IngredientCategory
	const ingredientId = selectedValue.slice(idx + 1)
	recipeStore.addIngredient({ ingredientId, category, grams })
	selectedValue = ''
	gramsStr = '100'
}
</script>

<template lang="pug">
.c-ingredient-picker
	bunt-select(
		v-model="selectedValue"
		:options="ingredientGroups"
		:getOptionLabel="i => i?.name?.de ?? ''"
		:getOptionGroupLabel="g => g?.label?.de ?? ''"
		optionValue="value"
		label="Ingredient"
		placeholder="Select ingredient..."
	)
	bunt-input(
		v-model="gramsStr"
		type="number"
		label="Grams"
	)
	bunt-button(:disabled="!selectedValue || parseInt(gramsStr) <= 0" @click="add") Add
</template>

<style lang="sass">
.c-ingredient-picker
	display: flex
	gap: 8px
	align-items: baseline
	flex-wrap: wrap
	padding: 8px 0

	.bunt-select
		min-width: 240px

	.bunt-input
		--input-size: compact
		--input-layout: inline
		width: 100px
</style>
