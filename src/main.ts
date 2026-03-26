import { createApp } from 'vue'
import Buntpapier from 'buntpapier'
import App from './App.vue'
import router from './router'

import './assets/main.sass'
import 'buntpapier/style'

const app = createApp(App)
app.use(Buntpapier)
app.use(router)
app.mount('#app')

if (import.meta.env.DEV) {
	document.documentElement.style.setProperty('--bunt-will-change', 'all')
}
