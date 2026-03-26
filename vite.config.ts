import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import yaml from '@modyfi/vite-plugin-yaml'
import * as YAML from 'yaml'

function recipesPlugin (): Plugin {
	const recipesDir = path.resolve(__dirname, 'recipes')

	return {
		name: 'recipes-api',
		configureServer (server) {
			if (!fs.existsSync(recipesDir)) {
				fs.mkdirSync(recipesDir, { recursive: true })
			}

			server.middlewares.use('/api/recipes', (req, res, next) => {
				const url = new URL(req.url ?? '/', 'http://localhost')
				const name = decodeURIComponent(url.pathname.slice(1)) // strip leading /

				if (req.method === 'GET' && !name) {
					// List recipes
					const files = fs.readdirSync(recipesDir)
						.filter(f => f.endsWith('.yaml'))
						.map(f => f.replace(/\.yaml$/, ''))
					res.setHeader('Content-Type', 'application/json')
					res.end(JSON.stringify(files))
					return
				}

				if (req.method === 'GET' && name) {
					// Read one recipe
					const filePath = path.join(recipesDir, `${name}.yaml`)
					if (!fs.existsSync(filePath)) {
						res.statusCode = 404
						res.end('Not found')
						return
					}
					const content = fs.readFileSync(filePath, 'utf-8')
					const data = YAML.parse(content)
					res.setHeader('Content-Type', 'application/json')
					res.end(JSON.stringify(data))
					return
				}

				if (req.method === 'POST' && name) {
					// Save recipe
					let body = ''
					req.on('data', chunk => body += chunk)
					req.on('end', () => {
						const data = JSON.parse(body)
						const yamlContent = YAML.stringify(data)
						fs.writeFileSync(path.join(recipesDir, `${name}.yaml`), yamlContent)
						res.statusCode = 200
						res.end('OK')
					})
					return
				}

				if (req.method === 'DELETE' && name) {
					// Delete recipe
					const filePath = path.join(recipesDir, `${name}.yaml`)
					if (fs.existsSync(filePath)) {
						fs.unlinkSync(filePath)
					}
					res.statusCode = 200
					res.end('OK')
					return
				}

				next()
			})
		},
	}
}

export default defineConfig({
	test: {
		exclude: ['e2e/**', 'node_modules/**'],
	},
	plugins: [
		vue({
			template: {
				preprocessOptions: {
					basedir: path.resolve(__dirname, './src'),
				},
			},
		}),
		ReactivityTransform(),
		yaml(),
		recipesPlugin(),
	],
	build: {
		target: 'esnext',
	},
	optimizeDeps: {
		exclude: ['buntpapier']
	},
	resolve: {
		alias: [
			{ find: '~', replacement: path.resolve(__dirname, './src') },
		],
	},
})
