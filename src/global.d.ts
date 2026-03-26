declare module '*.yaml' {
	const data: any
	export default data
}

interface Window {
	stores: Record<string, any>
}
