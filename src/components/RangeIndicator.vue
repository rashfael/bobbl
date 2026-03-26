<script setup lang="ts">
import type { BalanceStatus, Range } from '~/lib/types'

const { value, range, status, label, unit = '' } = defineProps<{
	value: number
	range: Range
	status: BalanceStatus
	label: string
	unit?: string
}>()

// Map value to a 0–100% position on the bar.
// The target range occupies the middle 60% (20%–80%).
const markerPosition = $computed(() => {
	const span = range.max - range.min
	if (span === 0) return 50
	// How far through the range is the value? 0 = at min, 1 = at max
	const ratio = (value - range.min) / span
	// Map to 20%–80% for in-range, allow overflow for out-of-range
	const pos = 20 + ratio * 60
	return Math.max(2, Math.min(98, pos))
})
</script>
<template lang="pug">
.c-range-indicator(:class="'is-' + status")
	.label {{ label }}
	.bar
		.range-zone
		.marker(:style="{ left: markerPosition + '%' }")
	.values
		span.value {{ value.toFixed(1) }}{{ unit }}
		span.target {{ range.min }}–{{ range.max }}{{ unit }}
</template>
<style lang="sass">
.c-range-indicator
	display: flex
	flex-direction: column
	gap: 4px
	padding: 8px

	.label
		font-size: 12px
		font-weight: 600
		text-transform: uppercase
		letter-spacing: 0.5px
		color: var(--clr-secondary-text-light)

	.bar
		position: relative
		height: 8px
		background: var(--clr-grey-200)
		border-radius: 4px
		overflow: visible

		.range-zone
			position: absolute
			left: 20%
			right: 20%
			top: 0
			bottom: 0
			background: var(--clr-green-100)
			border-radius: 4px

		.marker
			position: absolute
			top: -2px
			width: 12px
			height: 12px
			border-radius: 50%
			background: var(--clr-green-600)
			transform: translateX(-50%)
			transition: left 0.3s ease

	.values
		display: flex
		justify-content: space-between
		font-size: 11px

		.value
			font-weight: 600

		.target
			color: var(--clr-secondary-text-light)

	&.is-low
		.marker
			background: var(--clr-blue-600)
		.bar .range-zone
			background: var(--clr-blue-50)

	&.is-high
		.marker
			background: var(--clr-red-600)
		.bar .range-zone
			background: var(--clr-red-50)
</style>
