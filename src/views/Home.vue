<template>
  <div class="home">
    <div class="container">
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">{{ $t('home.welcome.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('home.welcome.subtitle') }}</p>
          
          <div class="feature-cards">
            <!-- 动态生成功能卡片 -->
            <router-link 
              v-for="tool in tools"
              :key="tool.id"
              :to="tool.route" 
              class="feature-card"
            >
              <div class="feature-icon">
                <svg width="48" height="48" fill="currentColor" :viewBox="tool.icon.viewBox">
                  <path :d="tool.icon.path"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ $t(`home.features.${tool.i18nKey}.title`) }}</h3>
              <p class="feature-description">{{ $t(`home.features.${tool.i18nKey}.description`) }}</p>
              <div class="feature-action">
                {{ $t(`home.features.${tool.i18nKey}.action`) }}
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                </svg>
              </div>
            </router-link>
          </div>
          
         
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAllTools } from '../utils/tools.js'

// 获取所有工具配置
const tools = getAllTools()
</script>

<style scoped>
.home {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.welcome-section {
  text-align: center;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.welcome-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.feature-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.feature-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-action {
  background: white;
  transform: translateX(5px);
}

.navigation-hint {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.navigation-hint p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .home {
    padding: 2rem 0;
  }
  
  .welcome-title {
    font-size: 2.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 2rem;
  }
  
  .welcome-content {
    gap: 2rem;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-icon {
    padding: 1rem;
  }
  
  .feature-icon svg {
    width: 36px;
    height: 36px;
  }
}
</style> 