<script setup lang="ts">
import { useRecipeStore } from '~/stores/recipe'

const recipeStore = useRecipeStore()
import RangeIndicator from './RangeIndicator.vue'

const parameterLabels = [
	{ key: 'ts', balanceKey: 'totalSolidsPercent', label: 'TS', unit: '%' },
	{ key: 'fat', balanceKey: 'fatPercent', label: 'Fat', unit: '%' },
	{ key: 'slng', balanceKey: 'slngPercent', label: 'SLNG', unit: '%' },
	{ key: 'sugar', balanceKey: 'sugarPercent', label: 'Sugar', unit: '%' },
	{ key: 'pod', balanceKey: 'pod', label: 'POD', unit: '' },
	{ key: 'pac', balanceKey: 'pac', label: 'PAC', unit: '' },
	{ key: 'protein', balanceKey: 'proteinPercent', label: 'Protein', unit: '%' },
] as const
</script>
<template lang="pug">
.c-balance-panel
	h3 Balance
	.summary
		.stat
			span.label Weight
			span.value {{ recipeStore.displayTotal.toFixed(0) }} g
		.stat
			span.label Water
			span.value {{ recipeStore.balance.waterPercent.toFixed(1) }}%
		.stat(v-if="recipeStore.balance.maxSlng > 0")
			span.label SLNG Limit
			span.value(:class="{ 'is-warning': recipeStore.status.slngLimit === 'high' }") {{ recipeStore.balance.slngPercent.toFixed(1) }} / {{ recipeStore.balance.maxSlng.toFixed(1) }}%
	.indicators
		RangeIndicator(
			v-for="p in parameterLabels"
			:key="p.key"
			:value="recipeStore.balance[p.balanceKey]"
			:range="recipeStore.ranges[p.key]"
			:status="recipeStore.status[p.key]"
			:label="p.label"
			:unit="p.unit"
		)
</template>
<style lang="sass">
.c-balance-panel
	h3
		margin: 0 0 16px
		font-size: 16px

	.summary
		display: flex
		gap: 24px
		margin-bottom: 16px
		padding: 8px 0
		border-bottom: 1px solid var(--clr-grey-200)

		.stat
			display: flex
			flex-direction: column
			gap: 2px

			.label
				font-size: 11px
				text-transform: uppercase
				color: var(--clr-secondary-text-light)

			.value
				font-size: 14px
				font-weight: 600

			.is-warning
				color: var(--clr-red-600)

	.indicators
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))
		gap: 8px
</style>
