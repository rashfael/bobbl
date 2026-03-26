<script setup lang="ts">
import RecipeSidebar from '~/components/RecipeSidebar.vue'
</script>
<template lang="pug">
.v-app
	RecipeSidebar
	main.main
		router-view(:key="$route.path")
</template>
<style lang="sass">
.v-app
	display: flex
	height: 100vh

	.main
		flex: 1
		overflow-y: auto
</style>
