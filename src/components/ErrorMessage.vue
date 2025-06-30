<template>
  <div class="error-container">
    <div class="error-card">
      <div class="error-icon">
        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
      </div>
      <h3 class="error-title">{{ $t('common.error') }}</h3>
      <p class="error-message">{{ message || $t('subreddits.error') }}</p>
      <button @click="handleRetry" class="retry-btn">
        {{ $t('subreddits.retry') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['retry'])

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  color: #e74c3c;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.error-title {
  color: #e74c3c;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.error-message {
  color: #666;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.retry-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .error-card {
    padding: 2rem 1.5rem;
  }
  
  .error-title {
    font-size: 1.25rem;
  }
  
  .retry-btn {
    padding: 0.65rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style> 