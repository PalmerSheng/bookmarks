<template>
  <div class="subreddit-groups">
    <div class="groups-container">
      <div 
        v-for="subreddit in subreddits" 
        :key="subreddit"
        class="subreddit-group"
      >
        <div class="group-header">
          <h3 class="subreddit-title">r/{{ subreddit }}</h3>
          <div class="post-count">
            {{ getPostCount(subreddit) }} {{ $t('post.posts') }}
          </div>
        </div>
        
        <div class="posts-list">
          <LoadingSpinner v-if="redditStore.isLoading" />
          
          <div v-else-if="getSubredditPosts(subreddit).length > 0" class="posts-container">
            <div 
              v-for="post in getSubredditPosts(subreddit).slice(0, 10)" 
              :key="post.id"
              class="post-item"
            >
              <div class="post-meta">
                <span class="score">{{ formatNumber(post.score) }}</span>
                <span class="comments">{{ post.comment_count }}</span>
              </div>
              <div class="post-info">
                <h4 class="post-title">
                  {{ currentLocale === 'zh' && post.titleZh ? post.titleZh : post.title }}
                </h4>
                <div class="post-details">
                  <span class="author">{{ post.author }}</span>
                  <span class="time">{{ formatTime(post.created) }}</span>
                </div>
              </div>
              <a 
                :href="post.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="external-link"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                  <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div v-else class="no-posts">
            <div class="no-posts-message">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              </svg>
              <p>{{ $t('subreddits.noData') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRedditStore } from '../stores/reddit.js'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  subreddits: {
    type: Array,
    required: true
  }
})

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)
const redditStore = useRedditStore()

const getSubredditPosts = (subreddit) => {
  return redditStore.getPostsBySubreddit(subreddit)
}

const getPostCount = (subreddit) => {
  return getSubredditPosts(subreddit).length
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
.subreddit-groups {
  padding: 2rem 0;
}

.groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.subreddit-group {

  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.subreddit-group:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.group-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subreddit-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.post-count {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.posts-list {
  padding: 1rem;
  min-height: 500px;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.post-item {
  display: flex;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 0.1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
}

.post-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
}

.score {
  font-weight: 600;
  color: #ff4500;
  font-size: 0.9rem;
}

.comments {
  font-size: 0.8rem;
  color: #666;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.author {
  font-weight: 500;
}

.external-link {
  color: #667eea;
  opacity: 0.7;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.external-link:hover {
  opacity: 1;
  background: rgba(102, 126, 234, 0.1);
}

.no-posts {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.no-posts-message {
  text-align: center;
  color: #888;
}

.no-posts-message svg {
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.no-posts-message p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .groups-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .group-header {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .subreddit-title {
    font-size: 1.1rem;
  }
  
  .posts-list {
    padding: 0.75rem;
    min-height: 400px;
  }
  
  .post-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .post-meta {
    min-width: 50px;
  }
  
  .post-title {
    font-size: 0.9rem;
  }
  
  .post-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (min-width: 769px) and (max-width: 1399px) {
  .groups-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  .groups-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1500px;
  }
}
</style> 