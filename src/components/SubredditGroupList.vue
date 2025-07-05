<template>
  <div class="subreddit-groups">
    <div class="groups-container">
      <div 
        v-for="subreddit in subreddits" 
        :key="subreddit"
        class="subreddit-group"
      >
        <div class="group-header">
          <div class="subreddit-title-section">
            <h3 class="subreddit-title">r/{{ subreddit }}</h3>
            <p v-if="getSubredditTitle(subreddit)" class="subreddit-subtitle">
              {{ getSubredditTitle(subreddit) }}
            </p>
          </div>
          <div class="subreddit-meta">
            <!-- <div class="post-count">
              {{ getPostCount(subreddit) }} {{ $t('post.posts') }}
            </div> -->
            <div class="update-info">
              <div v-if="getLastUpdateTime(subreddit)" class="last-updated">
                {{ $t('time.lastUpdated') }}: {{ formatLastUpdate(subreddit) }}
              </div>
            </div>
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
                <div class="score-container">
                  <svg class="upvote-arrow" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                  </svg>
                  <span class="score">{{ formatNumber(post.score) }}</span>
                </div>
              </div>
              <div class="post-info">
                <a 
                  :href="post.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="post-title-link"
                >
                  <h4 
                    class="post-title"
                    :title="currentLocale === 'zh' && (post.titleZh || post.title_zh) ? (post.titleZh || post.title_zh) : post.title"
                  >
                    {{ currentLocale === 'zh' && (post.titleZh || post.title_zh) ? (post.titleZh || post.title_zh) : post.title }}
                  </h4>
                </a>
                <div class="post-details">
                  <div class="post-author-time">
                    <span class="author" :title="post.author">{{ post.author }}</span>
                    <span class="separator">•</span>
                    <span class="time">{{ formatTime(post.created) }}</span>
                  </div>
                  <div class="post-comments">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    </svg>
                    <span class="comment-count">{{ formatNumber(post.comment_count || 0) }}</span>
                  </div>
                </div>
              </div>
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
import { formatTimeAgo, getLatestPostTime, getSubredditLastUpdateTime } from '../utils/timeFormatter.js'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  subreddits: {
    type: Array,
    required: true
  }
})

const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)
const redditStore = useRedditStore()

const getSubredditPosts = (subreddit) => {
  return redditStore.getPostsBySubreddit(subreddit)
}

const getPostCount = (subreddit) => {
  return getSubredditPosts(subreddit).length
}

const getLastUpdateTime = (subreddit) => {
  const subredditData = redditStore.posts[subreddit]
  return getSubredditLastUpdateTime(subredditData)
}

const formatLastUpdate = (subreddit) => {
  const lastUpdateTime = getLastUpdateTime(subreddit)
  if (!lastUpdateTime) return ''
  
  return formatTimeAgo(lastUpdateTime, currentLocale.value, t)
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

const getSubredditTitle = (subreddit) => {
  const subredditData = redditStore.posts[subreddit]
  if (!subredditData) return ''
  
  if (currentLocale.value === 'zh' && subredditData.title_zh) {
    return subredditData.title_zh
  }
  
  return subredditData.title || ''
}
</script>

<style scoped>
.subreddit-groups {
  padding: 2rem 0;
  width: 100%;
}

.groups-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 98%;
  width: 100%;
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
  width: 100%;
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

.subreddit-title-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.subreddit-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.subreddit-subtitle {
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  margin: 0.25rem 0 0 0;
  line-height: 1.3;
  max-width: 500px;
}

.subreddit-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.post-count {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.update-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.last-updated {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
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
  align-items: stretch;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 80px;
  position: relative;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
  z-index: 10;
}

.post-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  min-width: 50px;
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.upvote-arrow {
  width: 14px;
  height: 14px;
  color: #ff4500;
  transition: all 0.3s ease;
}

.post-item:hover .upvote-arrow {
  transform: translateY(-2px);
  color: #ff6500;
}

.score {
  font-weight: 600;
  color: #ff4500;
  font-size: 0.8rem;
  line-height: 1;
  transition: all 0.3s ease;
}

.post-item:hover .score {
  color: #ff6500;
  transform: scale(1.05);
}

.post-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 0.1rem 0;
}

.post-title-link {
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
}

.post-title-link:hover {
  color: #667eea;
}

.post-title-link:hover .post-title {
  color: #667eea;
}

.post-title {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
  color: inherit;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  flex: 0 0 auto;
  max-height: 2.6em;
  transition: all 0.3s ease;
}

.post-title:hover::after {
  content: attr(title);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
  display: block;
  overflow: visible;
}

.post-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.post-author-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.author {
  font-weight: 500;
  font-size: 0.7rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  line-height: 1;
}

.separator {
  color: #666;
  font-size: 0.65rem;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

.time {
  color: #666;
  font-size: 0.65rem;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

.post-comments {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.comment-count {
  font-size: 0.7rem;
  color: #667eea;
  line-height: 1;
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
    max-width: 100%;
  }
  
  .group-header {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .subreddit-title-section {
    width: 100%;
  }
  
  .subreddit-meta {
    align-items: flex-start;
    width: 100%;
  }
  
  .subreddit-title {
    font-size: 1.1rem;
  }
  
  .subreddit-subtitle {
    font-size: 0.8rem;
    max-width: 100%;
    margin-top: 0.15rem;
  }
  
  .update-info {
    align-items: flex-start;
    margin-top: 0.5rem;
  }
  
  .posts-list {
    padding: 0.75rem;
    min-height: 400px;
  }
  
  .post-item {
    padding: 0.4rem;
    gap: 0.5rem;
    height: 70px;
  }
  
  .post-meta {
    min-width: 40px;
    padding-top: 0.05rem;
  }
  
  .post-info {
    padding: 0.05rem 0;
  }
  
  .score {
    font-size: 0.75rem;
  }
  
  .upvote-arrow {
    width: 12px;
    height: 12px;
  }
  
  .post-title {
    font-size: 0.8rem;
    -webkit-line-clamp: 2;
    line-height: 1.1;
    max-height: 2.2em;
  }
  
  .post-title:hover::after {
    max-width: 250px;
    font-size: 0.8rem;
  }
  
  .post-details {
    gap: 0.5rem;
    margin-top: 0.2rem;
  }
  
  .post-author-time {
    gap: 0.2rem;
  }
  
  .author {
    font-size: 0.65rem;
    max-width: 60px;
  }
  
  .separator {
    font-size: 0.6rem;
  }
  
  .time {
    font-size: 0.6rem;
  }
  
  .comment-count {
    font-size: 0.65rem;
  }
}

@media (min-width: 1600px) {
  .groups-container {
    grid-template-columns: repeat(2, 1fr);
    max-width: 98%;
  }
}

@media (min-width: 2400px) {
  .groups-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 98%;
  }
}
</style> 