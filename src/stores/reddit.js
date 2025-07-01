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
    return posts.value[subreddit]?.hot_posts || []
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
  const callSupabaseFunction = async (subreddits, limit = 10, forceRefresh = false) => {
    const requestBody = {
      subreddits: subreddits,
      limit: limit,
      force_refresh: forceRefresh
    }

    console.log('🚀 Making API request:', {
      environment: isProduction ? 'production (via proxy)' : 'development (via proxy)',
      url: SUPABASE_FUNCTION_URL,
      subreddits,
      limit,
      forceRefresh
    })

    return await makeApiRequest(requestBody)
  }

  // Actions
  const fetchPosts = async (subreddits = ['saas', 'programming', 'technology', 'webdev', 'javascript'], limit = 10, forceRefresh = false) => {
    loading.value = true
    error.value = null

    try {
      const data = await callSupabaseFunction(subreddits, limit, forceRefresh)
      posts.value = data
      console.log('✅ Posts fetched successfully')
    } catch (err) {
      error.value = err.message || 'Failed to fetch posts'
      console.error('Error fetching posts:', err)
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
      const data = await callSupabaseFunction([subredditName], limit, true)
      
      const subredditData = data[subredditName]
      
      if (!subredditData) {
        throw new Error(`No data found for r/${subredditName}`)
      }

      if (subredditData.error) {
        throw new Error(subredditData.error)
      }

      // Format data to match previous structure
      const formattedPosts = subredditData.hot_posts.map(post => ({
        id: post.id,
        title: post.title,
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
        over_18: false
      }))

      searchResult.value = {
        about: {
          display_name: subredditData.display_name,
          title: subredditData.title,
          public_description: subredditData.public_description,
          description: subredditData.description,
          subscribers: subredditData.subscribers,
          active_user_count: subredditData.active_users,
          created_utc: subredditData.created_utc ? Math.floor(subredditData.created_utc / 1000) : null,
          subreddit_type: subredditData.subreddit_type,
          icon_img: subredditData.icon_img,
          banner_img: subredditData.banner_img
        },
        posts: formattedPosts
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
    isLoading,
    hasError,
    hasSearchError,
    // Actions
    fetchPosts,
    searchSubreddit,
    clearError,
    clearSearchError,
    clearSearchResult
  }
})
