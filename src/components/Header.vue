<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>{{ pageTitle }}</h1>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="navigation">
          <!-- 首页链接 -->
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ active: $route.name === 'Home' }"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5z"/>
            </svg>
            {{ $t('nav.home') }}
          </router-link>
          
          <!-- 动态生成工具导航链接 -->
          <router-link 
            v-for="tool in tools"
            :key="tool.id"
            :to="tool.route" 
            class="nav-link"
            :class="{ active: $route.name === tool.routeName }"
          >
            <svg width="20" height="20" fill="currentColor" :viewBox="tool.icon.viewBox">
              <path :d="tool.icon.path"/>
            </svg>
            {{ $t(`nav.${tool.i18nKey}`) }}
          </router-link>
        </nav>
        
        <div class="language-switcher">
          <button 
            @click="switchLanguage('en')"
            :class="{ active: currentLocale === 'en' }"
            class="lang-btn"
          >
            EN
          </button>
          <button 
            @click="switchLanguage('zh')"
            :class="{ active: currentLocale === 'zh' }"
            class="lang-btn"
          >
            中文
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getAllTools } from '../utils/tools.js'

const { locale, t } = useI18n()
const route = useRoute()
const tools = getAllTools()

const currentLocale = computed(() => locale.value)

// 动态标题计算属性
const pageTitle = computed(() => {
  const routeName = route.name
  console.log(routeName)
  // 根据路由名称返回对应的标题
  switch (routeName) {
    case 'Home':
      return t('nav.title')
    case 'Reddit':
      return t('reddit.overview.title')
    case 'Calculator':
      return t('calculator.title')
    case 'Translator':
      return t('translator.title')
    default:
      // 如果是其他工具页面，尝试从工具配置中获取标题
      const tool = tools.find(t => t.routeName === routeName)
      if (tool) {
        return t(`${tool.i18nKey}.title`)
      }
      return t('nav.title')
  }
})

// 动态副标题计算属性
const pageSubtitle = computed(() => {
  const routeName = route.name
  
  // 根据路由名称返回对应的副标题
  switch (routeName) {
    case 'Home':
      return t('nav.subtitle')
    case 'Reddit':
      return t('reddit.overview.subtitle')
    case 'Calculator':
      return t('calculator.subtitle')
    case 'Translator':
      return t('translator.subtitle')
    default:
      // 如果是其他工具页面，使用通用副标题
      const tool = tools.find(t => t.routeName === routeName)
      if (tool) {
        return tool.description
      }
      return t('nav.subtitle')
  }
})

const switchLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

// Load saved language on mount
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('language')
  if (savedLang) {
    locale.value = savedLang
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo p {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
}

.navigation {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-color: rgba(255, 255, 255, 0.9);
}

.nav-link svg {
  flex-shrink: 0;
}

.language-switcher {
  display: flex;
  gap: 0.5rem;
}

.lang-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.lang-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 968px) {
  .header-content {
    text-align: center;
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation {
    order: 2;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .language-switcher {
    order: 3;
  }
  
  .logo h1 {
    font-size: 1.75rem;
  }
  
  .logo p {
    font-size: 0.9rem;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 0.75rem 0;
  }
  
  .navigation {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .nav-link {
    justify-content: center;
    width: 100%;
    max-width: 200px;
    padding: 0.4rem 0.8rem;
  }
  
  .header-content {
    gap: 0.75rem;
  }
}
</style> 