import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		redirect: '/new',
	},
	{
		path: '/new',
		name: 'new-recipe',
		component: () => import('~/views/Calculator.vue'),
	},
	{
		path: '/recipes/:id',
		name: 'recipe',
		component: () => import('~/views/Calculator.vue'),
	},
]

export default routes
