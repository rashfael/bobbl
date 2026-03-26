<script setup lang="ts">
import { useRecipeStore } from '~/stores/recipe'
import { targetRanges, iceCreamTypes } from '~/lib/ranges'

const recipeStore = useRecipeStore()

const typeOptions = iceCreamTypes.map(t => ({
	value: t,
	label: targetRanges[t].label.de,
}))

let batchSizeStr = $ref(String(recipeStore.recipe.batchSize))

function onBatchSizeUpdate (val: string) {
	batchSizeStr = val
	const num = parseInt(val)
	if (!isNaN(num) && num > 0) {
		recipeStore.recipe.batchSize = num
	}
}
</script>

<template lang="pug">
.c-type-selector
	bunt-select(
		v-model="recipeStore.recipe.type"
		:options="typeOptions"
		label="Type"
		optionLabel="label"
		optionValue="value"
	)
	bunt-input(
		type="number"
		label="Batch (g)"
		:modelValue="batchSizeStr"
		@update:modelValue="onBatchSizeUpdate"
	)
</template>

<style lang="sass">
.c-type-selector
	display: flex
	align-items: center
	gap: 16px
	flex-wrap: wrap

	.bunt-select
		min-width: 200px

	.bunt-input
		width: 120px
</style>
