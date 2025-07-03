import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import Home from './views/Home.vue'
import RedditOverview from './views/RedditOverview.vue'
import Calculator from './views/Calculator.vue'
import './style.css'

// Import language files
import en from './locales/en.json'
import zh from './locales/zh.json'

// Router configuration
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/reddit', name: 'Reddit', component: RedditOverview },
  { path: '/calculator', name: 'Calculator', component: Calculator }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Get the saved language preference or default to Chinese
const getInitialLocale = () => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('language')
    if (savedLang && ['en', 'zh'].includes(savedLang)) {
      return savedLang
    }
  }
  return 'zh' // Default to Chinese
}

// i18n configuration
const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})

// Create and mount app
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app') 