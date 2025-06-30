<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>{{ $t('nav.title') }}</h1>
          <p>{{ $t('nav.subtitle') }}</p>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="navigation">
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
          
          <router-link 
            to="/reddit" 
            class="nav-link"
            :class="{ active: $route.name === 'Reddit' }"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.167 8a.831.831 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.232.232 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.604 2.014-.496.111-.746.387-.746.734 0 .715.01.843.09.931.08.088.497.314.847.463.35.148.543.25.543.395 0 .134-.012.197-.012.197-.34.013-.668.05-.668.381 0 .132.096.267.322.267.492 0 .717-.21.717-.508 0-.315-.077-.408-.14-.438-.063-.03-.277-.13-.277-.13s.196-.05.275-.088c.793-.038 1.596-.047 2.387-.011.08.037.218.06.218.06s-.196.098-.277.13c-.08.032-.156.121-.156.438 0 .297.225.508.718.508.225 0 .322-.135.322-.267 0-.332-.328-.368-.668-.381 0 0-.012-.063-.012-.197 0-.146.193-.247.543-.395.35-.149.767-.375.847-.463.08-.088.09-.216.09-.931 0-.347-.25-.623-.746-.734-2.27-1.02-3.826-1.69-4.604-2.014-.138-.058-.21-.09-.288-.09-.077 0-.15.032-.288.09z"/>
            </svg>
            {{ $t('nav.reddit') }}
          </router-link>
          
          <router-link 
            to="/calculator" 
            class="nav-link"
            :class="{ active: $route.name === 'Calculator' }"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
              <path d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z"/>
            </svg>
            {{ $t('nav.calculator') }}
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

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

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
  padding: 2rem 0;
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
  flex-wrap: wrap;
  gap: 2rem;
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo p {
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
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
  padding: 0.75rem 1.25rem;
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
  padding: 0.5rem 1rem;
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
    gap: 1.5rem;
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
    font-size: 2rem;
  }
  
  .logo p {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .navigation {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
  
  .nav-link {
    justify-content: center;
    width: 100%;
    max-width: 200px;
  }
  
  .header-content {
    gap: 1rem;
  }
}
</style> 