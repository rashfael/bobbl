<script setup lang="ts">
import { useRecipeStore } from '~/stores/recipe'
import { targetRanges, iceCreamTypes } from '~/lib/ranges'

const recipeStore = useRecipeStore()

const typeOptions = iceCreamTypes.map(t => ({
	value: t,
	label: targetRanges[t].label.de,
}))
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
</template>

<style lang="sass">
.c-type-selector
	.bunt-select
		min-width: 180px
</style>
