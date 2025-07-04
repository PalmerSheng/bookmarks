<template>
  <div id="app">
    <Header />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>

<style>
/* Global styles are in style.css */
.main-content {
  flex: 1;
  min-height: calc(100vh - 200px);
}

.footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 0;
  margin-top: 2rem;
}

.footer .container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer {
    padding: 1rem 0;
  }
  
  .footer p {
    font-size: 0.8rem;
  }
}
</style> 