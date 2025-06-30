<template>
  <div class="post-card">
    <div class="post-header">
      <div class="subreddit-info">
        <span class="subreddit">r/{{ post.subreddit }}</span>
        <span class="author">{{ $t('post.author') }} {{ post.author }}</span>
      </div>
      <div class="post-stats">
        <span class="score">{{ formatNumber(post.score) }} {{ $t('post.score') }}</span>
        <span class="comments">{{ post.comment_count }} {{ $t('post.comments') }}</span>
      </div>
    </div>
    
    <h3 class="post-title">
      {{ currentLocale === 'zh' && post.titleZh ? post.titleZh : post.title }}
    </h3>
    
    <div class="post-content" v-if="post.content">
      <p v-show="!isExpanded" class="content-preview">
        {{ truncatedContent }}
      </p>
      <p v-show="isExpanded" class="content-full">
        {{ post.content }}
      </p>
      <button 
        v-if="post.content.length > 200"
        @click="toggleExpanded"
        class="toggle-btn"
      >
        {{ isExpanded ? $t('post.readLess') : $t('post.readMore') }}
      </button>
    </div>
    
    <div class="post-footer">
      <span class="post-time">{{ formatTime(post.created) }}</span>
      <a 
        :href="post.url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="reddit-link"
      >
        {{ $t('post.viewOnReddit') }}
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
          <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const isExpanded = ref(false)

const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  return props.post.content.length > 200 
    ? props.post.content.substring(0, 200) + '...'
    : props.post.content
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}
</script>

<style scoped>
.post-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subreddit-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.subreddit {
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.author {
  font-size: 0.8rem;
  color: #666;
}

.post-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #888;
}

.score {
  color: #ff4500;
  font-weight: 500;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  color: #333;
}

.post-content {
  margin-bottom: 1rem;
}

.content-preview,
.content-full {
  line-height: 1.6;
  color: #555;
  margin: 0 0 0.5rem 0;
  white-space: pre-wrap;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.toggle-btn:hover {
  color: #764ba2;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.post-time {
  font-size: 0.8rem;
  color: #888;
}

.reddit-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(102, 126, 234, 0.1);
}

.reddit-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .post-card {
    padding: 1rem;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .post-stats {
    gap: 0.5rem;
  }
  
  .post-title {
    font-size: 1.1rem;
  }
  
  .post-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style> 