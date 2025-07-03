import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import createAppRouter from './utils/router.js'
import App from './App.vue'
import './style.css'

// Import language files
import en from './locales/en.json'
import zh from './locales/zh.json'

// 使用动态路由配置
const router = createAppRouter()

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