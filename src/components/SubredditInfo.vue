<template>
  <div v-if="subredditData" class="subreddit-info">
    <!-- Subreddit 基本信息 -->
    <div class="subreddit-header">
      <div class="subreddit-banner" v-if="subredditData.banner_img || subredditData.banner_background_image">
        <img 
          v-if="subredditData.banner_img" 
          :src="subredditData.banner_img" 
          alt="Banner"
          class="banner-image"
        />
        <div 
          v-else-if="subredditData.banner_background_image"
          class="banner-background"
          :style="{ backgroundImage: `url(${subredditData.banner_background_image})` }"
        ></div>
      </div>
      
      <div class="subreddit-details">
        <div class="subreddit-icon-wrapper">
          <img 
            v-if="subredditData.icon_img" 
            :src="subredditData.icon_img" 
            :alt="subredditData.display_name"
            class="subreddit-icon"
          />
          <div v-else class="subreddit-icon-placeholder">
            r/
          </div>
        </div>
        
        <div class="subreddit-meta">
          <h2 class="subreddit-name">r/{{ subredditData.display_name }}</h2>
          <p v-if="subredditData.title" class="subreddit-title">{{ subredditData.title }}</p>
          <p v-if="subredditData.public_description" class="subreddit-description">
            {{ subredditData.public_description }}
          </p>
          
          <div class="subreddit-stats">
            <div class="stat-item">
              <span class="stat-number">{{ formatNumber(subredditData.subscribers) }}</span>
              <span class="stat-label">{{ $t('subreddit.members') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ formatNumber(subredditData.active_user_count) }}</span>
              <span class="stat-label">{{ $t('subreddit.online') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ new Date(subredditData.created * 1000).getFullYear() }}</span>
              <span class="stat-label">{{ $t('subreddit.created') }}</span>
            </div>
          </div>
          
          <div class="subreddit-actions">
            <a 
              :href="`https://reddit.com/r/${subredditData.display_name}`" 
              target="_blank"
              class="reddit-link"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.167 8a.831.831 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.232.232 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.604 2.014-.496.111-.746.387-.746.734 0 .715.01.843.09.931.08.088.497.314.847.463.35.148.543.25.543.395 0 .134-.012.197-.012.197-.34.013-.668.05-.668.381 0 .132.096.267.322.267.492 0 .717-.21.717-.508 0-.315-.077-.408-.14-.438-.063-.03-.277-.13-.277-.130s.196-.05.275-.088c.793-.038 1.596-.047 2.387-.011.08.037.218.06.218.06s-.196.098-.277.13c-.08.032-.156.121-.156.438 0 .297.225.508.718.508.225 0 .322-.135.322-.267 0-.332-.328-.368-.668-.381 0 0-.012-.063-.012-.197 0-.146.193-.247.543-.395.35-.149.767-.375.847-.463.08-.088.09-.216.09-.931 0-.347-.25-.623-.746-.734-2.27-1.02-3.826-1.69-4.604-2.014-.138-.058-.21-.09-.288-.09-.077 0-.15.032-.288.09z"/>
              </svg>
              {{ $t('subreddit.visitReddit') }}
            </a>
            <button 
              @click="addToFavorites" 
              class="favorite-btn"
              :class="{ active: isFavorite }"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
              </svg>
              {{ isFavorite ? $t('subreddit.removeFromFavorites') : $t('subreddit.addToFavorites') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帖子列表 -->
    <div v-if="posts && posts.length > 0" class="posts-section">
      <h3 class="posts-title">{{ $t('subreddit.topPosts') }}</h3>
      <div class="posts-grid">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
        />
      </div>
    </div>
    
    <!-- 没有帖子的提示 -->
    <div v-else-if="posts && posts.length === 0" class="no-posts">
      <p>{{ $t('subreddit.noPosts') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRedditStore } from '../stores/reddit.js'
import PostCard from './PostCard.vue'

const props = defineProps({
  subredditName: {
    type: String,
    required: true
  }
})

const redditStore = useRedditStore()
const isFavorite = ref(false)

// 计算属性
const subredditData = computed(() => redditStore.searchResult?.about)
const posts = computed(() => redditStore.searchResult?.posts || [])

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 添加到收藏
const addToFavorites = () => {
  isFavorite.value = !isFavorite.value
  // 这里可以添加实际的收藏逻辑
  console.log(`${isFavorite.value ? 'Added to' : 'Removed from'} favorites: r/${props.subredditName}`)
}
</script>

<style scoped>
.subreddit-info {
  max-width: 1200px;
  margin: 0 auto;
}

.subreddit-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.subreddit-banner {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-background {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.subreddit-details {
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.subreddit-icon-wrapper {
  flex-shrink: 0;
}

.subreddit-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.subreddit-icon-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.subreddit-meta {
  flex: 1;
}

.subreddit-name {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0 0 0.5rem 0;
}

.subreddit-title {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.subreddit-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.subreddit-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.subreddit-actions {
  display: flex;
  gap: 1rem;
}

.reddit-link,
.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.reddit-link {
  background: #ff4500;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
}

.reddit-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 69, 0, 0.4);
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.favorite-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-color: transparent;
}

.posts-section {
  margin-top: 3rem;
}

.posts-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.no-posts {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .subreddit-details {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    text-align: center;
  }
  
  .subreddit-icon,
  .subreddit-icon-placeholder {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
    margin: 0 auto;
  }
  
  .subreddit-name {
    font-size: 1.5rem;
  }
  
  .subreddit-title {
    font-size: 1rem;
  }
  
  .subreddit-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.2rem;
  }
  
  .subreddit-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .posts-title {
    font-size: 1.5rem;
  }
}
</style> 