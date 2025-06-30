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

  // Supabase configuration - 优化生产环境配置
  const SUPABASE_URL = import.meta.env.DEV 
    ? '/api/supabase/functions/v1/clever-action'  // 开发环境使用代理
    : (import.meta.env.VITE_SUPABASE_URL || 'https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action')  // 生产环境
  
  const SUPABASE_BEARER_TOKEN = import.meta.env.VITE_SUPABASE_TOKEN 
    ? `Bearer ${import.meta.env.VITE_SUPABASE_TOKEN}`
    : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2RpY3pxb3VpbGxodm92b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTM2NTUsImV4cCI6MjA2NjQ2OTY1NX0.-ejxki8XiXECuGVOVVi9d5WgyHVefy0nxbu4qftMsLw'

  // 简化的axios配置
  const axiosConfig = {
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': SUPABASE_BEARER_TOKEN
    },
    withCredentials: false
  }

  // Getters
  const getPostsBySubreddit = computed(() => (subreddit) => {
    return posts.value[subreddit]?.hot_posts || []
  })

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasSearchError = computed(() => searchError.value !== null)

  // 简化的Supabase函数调用，通过代理避免CORS问题
  const callSupabaseFunction = async (subreddits, limit = 10, forceRefresh = false) => {
    console.log('🚀 调用Supabase Edge Function:', {
      url: SUPABASE_URL,
      subreddits,
      limit,
      forceRefresh
    })

    const requestBody = {
      subreddits: subreddits,
      limit: limit,
      force_refresh: forceRefresh
    }

    try {
      // 使用fetch API
      const response = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': SUPABASE_BEARER_TOKEN,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Response data:', data)

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch data from Supabase')
      }

      return data.data

    } catch (fetchError) {
      console.warn('⚠️ Fetch failed, trying axios:', fetchError.message)
      
      // Fallback to axios
      try {
        const response = await axios({
          method: 'POST',
          url: SUPABASE_URL,
          data: requestBody,
          ...axiosConfig
        })

        console.log('📥 Axios response:', response.status, response.statusText)

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch data from Supabase')
        }

        return response.data.data

      } catch (axiosError) {
        console.error('❌ Both fetch and axios failed:', axiosError)
        
        // 如果是开发环境且是CORS错误，尝试简化的请求
        if (import.meta.env.DEV && (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('CORS'))) {
          console.warn('🔄 尝试简化的请求方式...')
          return await simplifiedRequest(requestBody)
        }
        
        if (axiosError.response?.status === 404) {
          throw new Error('函数未找到(404)。请确保Edge Function已正确部署。')
        } else if (axiosError.response?.status >= 500) {
          throw new Error(`服务器错误(${axiosError.response.status})。请检查Supabase函数日志。`)
        }
        
        throw new Error(axiosError.response?.data?.message || axiosError.message || '请求失败')
      }
    }
  }

  // 简化的请求方法作为最后的备用方案
  const simplifiedRequest = async (requestBody) => {
    try {
      const response = await fetch('https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
      
    } catch (error) {
      console.error('简化请求也失败了:', error)
      throw new Error('所有请求方式都失败了，请检查网络连接')
    }
  }

  // Actions
  const fetchPosts = async (subreddits = ['saas', 'programming', 'technology', 'webdev', 'javascript'], limit = 10, forceRefresh = false) => {
    loading.value = true
    error.value = null

    try {
      const data = await callSupabaseFunction(subreddits, limit, forceRefresh)
      posts.value = data
    } catch (err) {
      error.value = err.message || 'Failed to fetch posts'
      console.error('Error fetching posts:', err)
    } finally {
      loading.value = false
    }
  }

  // Search subreddit function - now using Supabase edge function
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
