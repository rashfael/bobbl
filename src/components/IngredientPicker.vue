<script setup lang="ts">
import { watch } from 'vue'
import type { IngredientCategory, Ingredient } from '~/lib/types'
import { categories, getCategory } from '~/lib/ingredients'
import { useRecipeStore } from '~/stores/recipe'

const recipeStore = useRecipeStore()

let selectedCategory = $ref<IngredientCategory>('dairy')
let selectedIngredientId = $ref('')
let gramsStr = $ref('100')

const availableIngredients = $computed<Ingredient[]>(() => getCategory(selectedCategory))

watch(() => selectedCategory, () => {
	selectedIngredientId = ''
})

function add () {
	const grams = parseInt(gramsStr)
	if (!selectedIngredientId || isNaN(grams) || grams <= 0) return
	recipeStore.addIngredient({
		ingredientId: selectedIngredientId,
		category: selectedCategory,
		grams,
	})
	selectedIngredientId = ''
	gramsStr = '100'
}
</script>

<template lang="pug">
.c-ingredient-picker
	bunt-select(
		v-model="selectedCategory"
		:options="categories"
		:getOptionLabel="c => c?.label?.de ?? ''"
		optionValue="id"
		label="Category"
	)
	bunt-select(
		v-model="selectedIngredientId"
		:options="availableIngredients"
		:getOptionLabel="i => i?.name?.de ?? ''"
		optionValue="id"
		label="Ingredient"
		placeholder="Select ingredient..."
	)
	bunt-input(
		v-model="gramsStr"
		type="number"
		label="Grams"
	)
	bunt-button(:disabled="!selectedIngredientId || parseInt(gramsStr) <= 0" @click="add") Add
</template>

<style lang="sass">
.c-ingredient-picker
	display: flex
	gap: 8px
	align-items: baseline
	flex-wrap: wrap
	padding: 8px 0

	.bunt-select
		min-width: 180px

	.bunt-input
		--input-size: compact
		--input-layout: inline
		width: 100px
</style>
