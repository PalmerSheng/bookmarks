import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { clerkPlugin } from '@clerk/vue'
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

// 集成 Clerk 认证
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  console.warn('Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.')
} else {
  app.use(clerkPlugin, {
    publishableKey: clerkPublishableKey,
    afterSignOutUrl: '/',
    telemetry: false,
    appearance: {
      baseTheme: undefined,
      variables: {
        colorPrimary: '#667eea',
        colorText: '#1f2937',
        colorTextSecondary: '#6b7280',
        colorBackground: '#ffffff',
        colorInputBackground: '#f9fafb',
        colorInputText: '#1f2937',
        borderRadius: '0.5rem'
      }
    },
    experimental: {
      disableSmartLinks: true
    }
  })
}

app.mount('#app') 