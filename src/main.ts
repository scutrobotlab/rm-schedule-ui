/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

import '@/styles/fonts.scss'

import { configure } from "vue-gtag";

configure({
  tagId: import.meta.env.VITE_APP_GA_ID,
})

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
