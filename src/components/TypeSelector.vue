<script setup lang="ts">
import { watch } from 'vue'
import { useRecipeStore } from '~/stores/recipe'
import { targetRanges, iceCreamTypes } from '~/lib/ranges'

const recipeStore = useRecipeStore()

const typeOptions = iceCreamTypes.map(t => ({
	value: t,
	label: targetRanges[t].label.de,
}))

// The batch field shows the displayed total and resizes the recipe on commit.
let batchStr = $ref(String(recipeStore.displayTotal))
watch(() => recipeStore.displayTotal, (v) => { batchStr = String(v) })

function onInput (val: string) {
	batchStr = val
}

function commit () {
	const num = parseFloat(batchStr)
	if (!isNaN(num) && num > 0) recipeStore.setDisplayTotal(num)
	batchStr = String(recipeStore.displayTotal)
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
		:modelValue="batchStr"
		@update:modelValue="onInput"
		@change="commit"
		@keyup.enter="commit"
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
