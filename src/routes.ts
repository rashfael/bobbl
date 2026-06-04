import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'home',
		component: () => import('~/views/Greeter.vue'),
	},
	{
		path: '/new',
		name: 'new-recipe',
		component: () => import('~/views/Calculator.vue'),
	},
	{
		path: '/recipes/:source/:id',
		name: 'recipe',
		component: () => import('~/views/Calculator.vue'),
	},
]

export default routes
