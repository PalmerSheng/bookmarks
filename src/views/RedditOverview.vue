<template>
  <div class="reddit-overview">
    <div class="container">
      <!-- 搜索组件 -->
      <SubredditSearch @search="handleSearch" />
      
      <!-- 搜索结果 -->
      <div v-if="showSearchResult" class="search-result-section">
        <div class="search-header">
          <button @click="clearSearch" class="back-btn">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            {{ $t('common.back') }}
          </button>
          <h2 class="search-title">{{ $t('search.searchResults') }}: r/{{ currentSearchQuery }}</h2>
        </div>
        
        <!-- 搜索错误信息 -->
        <ErrorMessage 
          v-if="redditStore.hasSearchError" 
          :message="redditStore.searchError"
          @retry="retrySearch"
        />
        
        <!-- 搜索结果 -->
        <SubredditInfo 
          v-else-if="redditStore.searchResult"
          :subreddit-name="currentSearchQuery"
        />
        
        <!-- 搜索加载状态 -->
        <LoadingSpinner v-else-if="redditStore.isSearching" />
      </div>
      
      <!-- 默认内容 -->
      <div v-else>
        <div class="overview-header">
          <h2 class="overview-title">{{ $t('reddit.overview.title') }}</h2>
          <p class="overview-subtitle">{{ $t('reddit.overview.subtitle') }}</p>
          
          <div class="controls">
            <button @click="loadPosts" class="refresh-btn" :disabled="redditStore.isLoading">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" :class="{ 'spinning': redditStore.isLoading }">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
              </svg>
              {{ $t('subreddits.refresh') }}
            </button>
          </div>
        </div>

        <ErrorMessage 
          v-if="redditStore.hasError" 
          :message="redditStore.error"
          @retry="loadPosts"
        />

        <SubredditGroupList 
          v-else
          :subreddits="subreddits" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRedditStore } from '../stores/reddit.js'
import SubredditGroupList from '../components/SubredditGroupList.vue'
import SubredditSearch from '../components/SubredditSearch.vue'
import SubredditInfo from '../components/SubredditInfo.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const redditStore = useRedditStore()

const subreddits = ref([
  'saas', 
  'programming', 
  'technology', 
  'webdev', 
  'javascript', 
  'Python',
  'node',
  'frontend',
  'backend',
  'startups',
  'entrepreneur',
  'MachineLearning'
])

const currentSearchQuery = ref('')
const showSearchResult = computed(() => !!redditStore.searchResult || redditStore.isSearching || redditStore.hasSearchError)

const loadPosts = async () => {
  await redditStore.fetchPosts(subreddits.value, 10, false)
}

const handleSearch = (query) => {
  currentSearchQuery.value = query
}

const clearSearch = () => {
  redditStore.clearSearchResult()
  currentSearchQuery.value = ''
}

const retrySearch = () => {
  if (currentSearchQuery.value) {
    redditStore.searchSubreddit(currentSearchQuery.value)
  }
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.reddit-overview {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.overview-header {
  text-align: center;
  margin-bottom: 3rem;
}

.overview-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.overview-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-result-section {
  margin-bottom: 2rem;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 45px;
  height: 45px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.search-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .overview-title {
    font-size: 2rem;
  }
  
  .overview-subtitle {
    font-size: 1rem;
  }
  
  .search-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .search-title {
    font-size: 1.2rem;
  }
}
</style> 