<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>{{ pageTitle }}</h1>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :class="{ active: isMobileMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <!-- 导航菜单 -->
        <nav class="navigation" :class="{ 'mobile-open': isMobileMenuOpen }">
          <!-- 移动端菜单遮罩 -->
          <div 
            class="mobile-overlay" 
            :class="{ active: isMobileMenuOpen }"
            @click="closeMobileMenu"
          ></div>
          
          <!-- 菜单内容 -->
          <div class="nav-content">
            <!-- 移动端菜单头部 -->
            <div class="mobile-menu-header">
              <h2>{{ $t('nav.menu') }}</h2>
              <button class="close-btn" @click="closeMobileMenu">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </div>
            
            <!-- 首页链接 -->
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ active: $route.name === 'Home' }"
              @click="closeMobileMenu"
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
              @click="closeMobileMenu"
            >
              <svg width="20" height="20" fill="currentColor" :viewBox="tool.icon.viewBox">
                <path :d="tool.icon.path"/>
              </svg>
              {{ $t(`nav.${tool.i18nKey}`) }}
            </router-link>
          </div>
        </nav>
        
        <div class="language-switcher">
          <button 
            @click="toggleLanguage"
            class="lang-toggle-btn"
            :title="$t('nav.switchLanguage')"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
              <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z"/>
            </svg>
            <span class="lang-text">{{ currentLocale === 'en' ? 'EN' : '中文' }}</span>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" class="lang-arrow">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getAllTools } from '../utils/tools.js'

const { locale, t } = useI18n()
const route = useRoute()
const tools = getAllTools()

const currentLocale = computed(() => locale.value)
const isMobileMenuOpen = ref(false)

// 移动端菜单控制
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 防止背景滚动
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 监听窗口大小变化，大屏幕时关闭移动菜单
const handleResize = () => {
  if (window.innerWidth > 968) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = '' // 清理样式
})

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

// 语言切换函数
const toggleLanguage = () => {
  const newLang = currentLocale.value === 'en' ? 'zh' : 'en'
  locale.value = newLang
  localStorage.setItem('language', newLang)
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-height: 60px;
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

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 22px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  transition: opacity 0.3s ease;
}

.mobile-menu-btn span {
  width: 100%;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* 移除X变换动画，保持汉堡菜单样式 */
.mobile-menu-btn.active {
  opacity: 0.7;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: none;
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 1;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: none;
}

.navigation {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
}

.nav-content {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
}

.mobile-menu-header {
  display: none;
}

.mobile-overlay {
  display: none;
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
  flex-shrink: 0;
  min-width: fit-content;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
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
  align-items: center;
  flex-shrink: 0;
}

.lang-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  min-width: 120px;
  height: 44px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lang-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.lang-text {
  font-size: 0.9rem;
  min-width: 2.5rem;
  text-align: center;
  display: inline-block;
}

.lang-arrow {
  transition: transform 0.3s ease;
  opacity: 0.7;
  flex-shrink: 0;
}

.lang-toggle-btn:hover .lang-arrow {
  transform: rotate(180deg);
}

@media (max-width: 1200px) {
  .container {
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .header-content {
    gap: 0.75rem;
  }
  
  .navigation {
    gap: 0.5rem;
  }
  
  .nav-content {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .lang-toggle-btn {
    padding: 0.4rem 0.8rem;
    min-width: 100px;
    height: 40px;
  }
  
  .lang-text {
    font-size: 0.8rem;
    min-width: 2rem;
  }
}

@media (max-width: 968px) {
  .header-content {
    text-align: center;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    min-height: 60px;
  }
  
  .logo {
    order: 1;
    flex: 1;
    text-align: left;
  }
  
  .language-switcher {
    order: 2;
    flex-shrink: 0;
  }
  
  .mobile-menu-btn {
    display: flex;
    order: 3;
    flex-shrink: 0;
  }
  
  .navigation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: none;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .navigation.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .mobile-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
  
  .nav-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    gap: 0;
    align-items: stretch;
    padding: 0;
    overflow-y: auto;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .mobile-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
  }
  
  .mobile-menu-header h2 {
    margin: 0;
    font-size: 1.2rem;
    color: white;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .nav-link {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: none;
    padding: 1rem;
    justify-content: flex-start;
    white-space: normal;
    transition: background 0.3s ease;
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: none;
    box-shadow: none;
  }
  
  .nav-link.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .lang-toggle-btn {
    padding: 0.4rem 0.8rem;
    min-width: 100px;
    height: 40px;
  }
  
  .lang-text {
    font-size: 0.8rem;
    min-width: 2rem;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 0.75rem 0;
  }
  
  .header-content {
    min-height: 50px;
  }
  
  .nav-content {
    width: 260px;
  }
  
  .logo h1 {
    font-size: 1.3rem;
  }
  
  .lang-toggle-btn {
    padding: 0.3rem 0.6rem;
    gap: 0.3rem;
    min-width: 85px;
    height: 36px;
  }
  
  .lang-text {
    font-size: 0.75rem;
    min-width: 1.8rem;
  }
}
</style> 