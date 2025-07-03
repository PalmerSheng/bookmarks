<template>
  <div class="subreddit-search">
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="search-input"
          @keyup.enter="handleSearch"
          @input="handleInput"
        />
        <button 
          @click="handleSearch" 
          class="search-btn"
          :disabled="!searchQuery.trim() || redditStore.isSearching"
        >
          <svg v-if="!redditStore.isSearching" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <svg v-else width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="spinning">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
          </svg>
          {{ $t('search.button') }}
        </button>
        <button 
          @click="handleRefresh" 
          class="refresh-btn"
          :disabled="isRefreshing"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" :class="{ 'spinning': isRefreshing }">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
          </svg>
          {{ $t('subreddits.refresh') }}
        </button>
      </div>
      
      <div v-if="searchSuggestions.length > 0" class="search-suggestions">
        <div class="suggestions-header">{{ $t('search.suggestions') }}</div>
        <div 
          v-for="suggestion in searchSuggestions" 
          :key="suggestion"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          r/{{ suggestion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRedditStore } from '../stores/reddit.js'

const redditStore = useRedditStore()

const searchQuery = ref('')
const searchSuggestions = ref([])
const isRefreshing = ref(false)

// 常见的subreddit建议
const popularSubreddits = [
  'programming', 'technology', 'webdev', 'javascript', 'python', 
  'reactjs', 'vue', 'nodejs', 'frontend', 'backend', 'saas',
  'startups', 'entrepreneur', 'business', 'investing', 'stocks',
  'news', 'worldnews', 'science', 'space', 'futurology',
  'gaming', 'pcgaming', 'nintendo', 'playstation', 'xbox',
  'movies', 'television', 'books', 'music', 'art'
]

const emit = defineEmits(['search', 'refresh'])

const handleInput = () => {
  if (searchQuery.value.trim()) {
    // 过滤匹配的建议
    searchSuggestions.value = popularSubreddits
      .filter(sub => sub.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .slice(0, 5)
  } else {
    searchSuggestions.value = []
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  const query = searchQuery.value.trim().replace(/^r\//, '') // 移除 r/ 前缀
  searchSuggestions.value = []
  
  try {
    await redditStore.searchSubreddit(query)
    emit('search', query)
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    emit('refresh')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  searchSuggestions.value = []
  handleSearch()
}
</script>

<style scoped>
.subreddit-search {
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  color: #2c3e50;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(44, 62, 80, 0.6);
}

.search-btn, .refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.refresh-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  box-shadow: 0 2px 10px rgba(40, 167, 69, 0.3);
}

.search-btn:hover:not(:disabled), .refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.search-btn:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.refresh-btn:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.search-btn:disabled, .refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  margin-top: 0.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.suggestions-header {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.8);
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.suggestion-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-input-wrapper {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-btn, .refresh-btn {
    padding: 0.65rem 1rem;
    justify-content: center;
    width: 100%;
  }
  
  .search-input {
    padding: 0.65rem 1rem;
  }
}
</style> 