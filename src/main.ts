import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { initTheme } from './composables/useTheme'

initTheme() // apply the saved dark/light choice before anything renders

createApp(App).mount('#app')