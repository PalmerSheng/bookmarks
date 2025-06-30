<template>
  <div class="home">
    <div class="container">
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">{{ $t('home.welcome.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('home.welcome.subtitle') }}</p>
          
          <div class="feature-cards">
            <router-link to="/reddit" class="feature-card">
              <div class="feature-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.167 8a.831.831 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.232.232 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.604 2.014-.496.111-.746.387-.746.734 0 .715.01.843.09.931.08.088.497.314.847.463.35.148.543.25.543.395 0 .134-.012.197-.012.197-.34.013-.668.05-.668.381 0 .132.096.267.322.267.492 0 .717-.21.717-.508 0-.315-.077-.408-.14-.438-.063-.03-.277-.13-.277-.13s.196-.05.275-.088c.793-.038 1.596-.047 2.387-.011.08.037.218.06.218.06s-.196.098-.277.13c-.08.032-.156.121-.156.438 0 .297.225.508.718.508.225 0 .322-.135.322-.267 0-.332-.328-.368-.668-.381 0 0-.012-.063-.012-.197 0-.146.193-.247.543-.395.35-.149.767-.375.847-.463.08-.088.09-.216.09-.931 0-.347-.25-.623-.746-.734-2.27-1.02-3.826-1.69-4.604-2.014-.138-.058-.21-.09-.288-.09-.077 0-.15.032-.288.09z"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('home.features.reddit.title') }}</h3>
              <p class="feature-description">{{ $t('home.features.reddit.description') }}</p>
              <div class="feature-action">
                {{ $t('home.features.reddit.action') }}
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                </svg>
              </div>
            </router-link>
            
            <router-link to="/calculator" class="feature-card">
              <div class="feature-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                  <path d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('home.features.calculator.title') }}</h3>
              <p class="feature-description">{{ $t('home.features.calculator.description') }}</p>
              <div class="feature-action">
                {{ $t('home.features.calculator.action') }}
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
// 简单的欢迎页面，不需要复杂的逻辑
</script>

<style scoped>
.home {
  min-height: calc(100vh - 200px);
  padding: 4rem 0;
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
  max-width: 800px;
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