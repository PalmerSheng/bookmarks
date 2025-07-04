import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useRedditStore = defineStore('reddit', () => {
  // State
  const posts = ref({})
  const loading = ref(false)
  const error = ref(null)
  
  // Search related state
  const searchResult = ref(null)
  const isSearching = ref(false)
  const searchError = ref(null)

  // 环境检测
  const isProduction = import.meta.env.PROD
  const isDevelopment = import.meta.env.DEV

  // Supabase Edge Function URL - 生产环境使用 Cloudflare Pages Function 代理
  const SUPABASE_FUNCTION_URL = isProduction 
    ? '/api/supabase/functions/v1/clever-action'  // 使用 Cloudflare Pages Function 代理
    : '/api/supabase/functions/v1/clever-action'

  // Bearer Token - 使用环境变量或fallback
  const SUPABASE_BEARER_TOKEN = import.meta.env.VITE_SUPABASE_TOKEN 
    ? `Bearer ${import.meta.env.VITE_SUPABASE_TOKEN}`
    : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2RpY3pxb3VpbGxodm92b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTM2NTUsImV4cCI6MjA2NjQ2OTY1NX0.-ejxki8XiXECuGVOVVi9d5WgyHVefy0nxbu4qftMsLw'

  // 生产环境的请求配置 - 现在使用 Cloudflare Pages Function 代理
  const createRequestConfig = () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': SUPABASE_BEARER_TOKEN
    }

    // 现在生产环境和开发环境都使用代理，可以使用相同的配置
    return {
      timeout: 30000,
      headers: {
        ...headers,
        'Accept': 'application/json'
      },
      withCredentials: false
    }
  }

  // Getters
  const getPostsBySubreddit = computed(() => (subreddit) => {
    // First check if we have posts in the main posts object
    if (posts.value[subreddit]?.hot_posts) {
      return posts.value[subreddit].hot_posts
    }
    
    // If this is a search result, check searchResult
    if (searchResult.value && searchResult.value.about?.display_name === subreddit) {
      return searchResult.value.posts || []
    }
    
    return []
  })

  // 新增：动态获取当前可用的 subreddit 列表
  const availableSubreddits = computed(() => {
    return Object.keys(posts.value || {})
  })

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasSearchError = computed(() => searchError.value !== null)

  // 统一的 API 请求函数 - 现在生产环境也使用代理
  const makeApiRequest = async (requestBody) => {
    console.log('🚀 Making API request via proxy:', SUPABASE_FUNCTION_URL)
    
    const config = createRequestConfig()
    
    try {
      const response = await axios({
        method: 'POST',
        url: SUPABASE_FUNCTION_URL,
        data: requestBody,
        ...config
      })

      console.log('📥 Response:', response.status)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Request was not successful')
      }

      return response.data.data

    } catch (axiosError) {
      console.error('❌ API request failed:', axiosError)
      
      if (axiosError.response?.status === 404) {
        throw new Error('API endpoint not found. Please check the proxy configuration.')
      } else if (axiosError.response?.status >= 500) {
        throw new Error('Server error. Please check the function logs.')
      }
      
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Request failed')
    }
  }

  // 统一的API调用函数 - 现在不需要区分环境
  const callSupabaseFunction = async (subreddits, limit = 10, forceRefresh = false, action = 'fetch') => {
    const requestBody = {
      subreddits: subreddits,
      limit: limit,
      force_refresh: forceRefresh
    }

    // 如果是清除缓存操作且subreddits为空数组，使用clear_action
    if (action === 'clear' && Array.isArray(subreddits) && subreddits.length === 0) {
      requestBody.action = 'clear_action'
    }

    console.log('🚀 Making API request:', {
      environment: isProduction ? 'production (via proxy)' : 'development (via proxy)',
      url: SUPABASE_FUNCTION_URL,
      subreddits,
      limit,
      forceRefresh,
      action: requestBody.action || 'fetch'
    })

    return await makeApiRequest(requestBody)
  }

  // Actions
  const fetchPosts = async (subreddits = [], limit = 10, forceRefresh = false) => {
    loading.value = true
    error.value = null

    try {
      const response = await callSupabaseFunction(subreddits, limit, forceRefresh, 'fetch')
      
      // Convert array response to object format expected by the UI
      // API returns: { success: true, data: [{ subreddit: 'name', data: {...} }] }
      // We need: { 'subreddit1': {...}, 'subreddit2': {...} }
      const convertedData = {}
      if (Array.isArray(response)) {
        // Handle array response format
        response.forEach(item => {
          if (item.subreddit && item.data && !item.data.error) {
            convertedData[item.subreddit] = {
              ...item.data,
              last_updated: item.data.last_updated // Add last_updated field
            }
          }
        })
      } else {
        // Handle direct object format (backward compatibility)
        Object.assign(convertedData, response)
      }
      
      posts.value = convertedData
      console.log('✅ Posts fetched successfully:', {
        subredditsCount: Object.keys(convertedData).length,
        subreddits: Object.keys(convertedData)
      })
    } catch (err) {
      error.value = err.message || 'Failed to fetch posts'
      console.error('Error fetching posts:', err)
    } finally {
      loading.value = false
    }
  }

  // 新增：清除缓存函数
  const clearCache = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await callSupabaseFunction([], 10, false, 'clear')
      console.log('✅ Cache cleared successfully')
      
      // Convert array response to object format expected by the UI
      const convertedData = {}
      if (Array.isArray(response)) {
        // Handle array response format
        response.forEach(item => {
          if (item.subreddit && item.data && !item.data.error) {
            convertedData[item.subreddit] = {
              ...item.data,
              last_updated: item.data.last_updated // Add last_updated field
            }
          }
        })
      } else if (response && typeof response === 'object') {
        // Handle direct object format (backward compatibility)
        Object.assign(convertedData, response)
      }
      
      // 如果返回了数据，则更新到页面状态中
      if (Object.keys(convertedData).length > 0) {
        posts.value = convertedData
        console.log('📊 Updated posts with returned data:', Object.keys(convertedData))
      } else {
        // 如果没有返回数据，则清除本地状态
        posts.value = {}
        searchResult.value = null
        console.log('🧹 Cleared local state as no data returned')
      }
    } catch (err) {
      error.value = err.message || 'Failed to clear cache'
      console.error('Error clearing cache:', err)
    } finally {
      loading.value = false
    }
  }

  // Search subreddit function
  const searchSubreddit = async (subredditName, limit = 10) => {
    isSearching.value = true
    searchError.value = null
    searchResult.value = null

    try {
      const response = await callSupabaseFunction([subredditName], limit, false, 'fetch')
      
      // Handle array response format
      let subredditData = null
      if (Array.isArray(response)) {
        const found = response.find(item => item.subreddit === subredditName.toLowerCase())
        if (found && found.data && !found.data.error) {
          subredditData = found.data
        }
      } else if (response && response[subredditName]) {
        // Handle direct object format (backward compatibility)
        subredditData = response[subredditName]
      }
      
      if (!subredditData) {
        throw new Error(`No data found for r/${subredditName}`)
      }

      if (subredditData.error) {
        throw new Error(subredditData.error)
      }

      // Format data to match previous structure with new title_zh support
      const formattedPosts = subredditData.hot_posts.map(post => ({
        id: post.id,
        title: post.title,
        titleZh: post.title_zh, // Add Chinese title support
        author: post.author,
        score: post.score,
        num_comments: post.comment_count,
        created_utc: Math.floor(post.created / 1000),
        url: post.url,
        permalink: post.permalink,
        selftext: post.content,
        subreddit: post.subreddit,
        thumbnail: null,
        preview: null,
        is_video: false,
        media: null,
        over_18: false,
        comment_count: post.comment_count, // Add for consistency
        created: post.created // Keep original timestamp for compatibility
      }))

      searchResult.value = {
        about: {
          display_name: subredditData.display_name,
          title: subredditData.title,
          titleZh: subredditData.title_zh, // Add Chinese title support
          public_description: subredditData.public_description,
          description: subredditData.description,
          subscribers: subredditData.subscribers,
          active_user_count: subredditData.active_users,
          created_utc: subredditData.created_utc ? Math.floor(subredditData.created_utc / 1000) : null,
          subreddit_type: subredditData.subreddit_type,
          icon_img: subredditData.icon_img,
          banner_img: subredditData.banner_img,
          last_updated: subredditData.last_updated // Add last_updated field
        },
        posts: formattedPosts
      }

      // Also store in the main posts object for consistency with getPostsBySubreddit
      posts.value[subredditName] = {
        hot_posts: formattedPosts,
        display_name: subredditData.display_name,
        title: subredditData.title,
        title_zh: subredditData.title_zh,
        subscribers: subredditData.subscribers,
        active_users: subredditData.active_users,
        last_updated: subredditData.last_updated // Add last_updated field
      }

      console.log('✅ Subreddit search completed successfully')

    } catch (err) {
      console.error('Error searching subreddit:', err)
      
      if (err.message.includes('No subreddit data found') || err.message.includes('No data found')) {
        searchError.value = `Subreddit r/${subredditName} not found`
      } else if (err.message.includes('private') || err.message.includes('banned')) {
        searchError.value = `Subreddit r/${subredditName} is private or banned`
      } else {
        searchError.value = err.message || 'Failed to search subreddit'
      }
    } finally {
      isSearching.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSearchError = () => {
    searchError.value = null
  }

  const clearSearchResult = () => {
    searchResult.value = null
    searchError.value = null
  }

  return {
    // State
    posts,
    loading,
    error,
    searchResult,
    isSearching,
    searchError,
    // Getters
    getPostsBySubreddit,
    availableSubreddits,
    isLoading,
    hasError,
    hasSearchError,
    // Actions
    fetchPosts,
    searchSubreddit,
    clearError,
    clearSearchError,
    clearSearchResult,
    clearCache
  }
})
