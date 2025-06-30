<template>
  <div class="loading-container">
    <div class="loading-card">
      <div class="spinner"></div>
      <p class="loading-text">{{ $t('subreddits.loading') }}</p>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this simple component
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.loading-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #667eea;
  font-weight: 500;
  margin: 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .loading-card {
    padding: 2rem 1.5rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
}
</style> 