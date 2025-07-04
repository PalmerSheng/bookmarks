// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Type definitions
interface RequestBody {
  subreddits?: string[];
  limit?: number;
  force_refresh?: boolean;
}

interface SubredditResult {
  subreddit: string;
  data: any;
}

// 📊 时间统计工具
interface TimingStats {
  operation: string;
  duration: number;
  timestamp: string;
}

const timingStats: TimingStats[] = [];

function recordTiming(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  const timing: TimingStats = {
    operation,
    duration,
    timestamp: new Date().toISOString()
  };
  timingStats.push(timing);
  console.log(`⏱️ ${operation}: ${duration}ms`);
  return duration;
}

function logTimingSummary() {
  console.log('\n📊 ===== 性能统计摘要 =====');
  const grouped = timingStats.reduce((acc, stat) => {
    const key = stat.operation.split(' - ')[0]; // Group by main operation
    if (!acc[key]) acc[key] = [];
    acc[key].push(stat.duration);
    return acc;
  }, {} as Record<string, number[]>);
  
  Object.entries(grouped).forEach(([operation, durations]) => {
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);
    console.log(`📈 ${operation}: 总计${total}ms, 平均${avg.toFixed(1)}ms, 最大${max}ms, 最小${min}ms (${durations.length}次)`);
  });
  console.log('================================\n');
}

// 🚀 优化：添加内存缓存减少重复翻译
const translationCache = new Map<string, string>();
const TOKEN_CACHE_KEY = 'reddit_oauth_token';
const TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50分钟缓存
let tokenCache: { token: string; expiry: number } | null = null;

// 🚀 优化：批量翻译优化 - 增大批次大小，减少延迟
async function translateTextsBatchGoogleOptimized(texts: string[]): Promise<string[]> {
  const startTime = Date.now();
  
  if (!texts || texts.length === 0) {
    return [];
  }
  
  console.log(`🌐 开始优化版Google翻译批量翻译: ${texts.length}个文本`);
  
  // 检查缓存
  const cacheCheckStart = Date.now();
  const results: string[] = [];
  const textsToTranslate: { text: string; index: number }[] = [];
  
  texts.forEach((text, index) => {
    const cached = translationCache.get(text);
    if (cached) {
      results[index] = cached;
    } else {
      textsToTranslate.push({ text, index });
    }
  });
  
  recordTiming('批量翻译 - 缓存检查', cacheCheckStart);
  
  if (textsToTranslate.length === 0) {
    console.log('✅ 所有翻译都有缓存，直接返回');
    recordTiming('批量翻译 - 全缓存命中', startTime);
    return results;
  }
  
  console.log(`📦 缓存命中: ${texts.length - textsToTranslate.length}/${texts.length}`);
  
  try {
    const translateStart = Date.now();
    // 🚀 优化：增大批次大小到10，减少延迟到200ms
    const batchSize = 10;
    
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      const batchStart = Date.now();
      const batch = textsToTranslate.slice(i, i + batchSize);
      
      // 🚀 优化：使用Promise.allSettled而不是Promise.all，避免一个失败影响整批
      const batchPromises = batch.map(async ({ text }) => {
        try {
          const translated = await translateToChineseWithGoogleOptimized(text);
          // 缓存翻译结果
          translationCache.set(text, translated);
          return translated;
        } catch (error) {
          console.warn(`Google翻译单个文本失败: ${text.substring(0, 30)}...`, error);
          return text; // 返回原文本
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, batchIndex) => {
        const originalIndex = batch[batchIndex].index;
        if (result.status === 'fulfilled') {
          results[originalIndex] = result.value;
        } else {
          results[originalIndex] = batch[batchIndex].text;
        }
      });
      
      recordTiming(`批量翻译 - 批次${Math.floor(i/batchSize) + 1}(${batch.length}项)`, batchStart);
      
      // 🚀 优化：减少批次间延迟到200ms
      if (i + batchSize < textsToTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    recordTiming('批量翻译 - 翻译执行', translateStart);
    recordTiming('批量翻译 - 总计', startTime);
    
    console.log(`✅ 优化版Google批量翻译完成: 翻译了 ${textsToTranslate.length} 个新文本`);
    return results;
    
  } catch (error) {
    console.error('❌ 优化版Google批量翻译失败:', error);
    recordTiming('批量翻译 - 失败', startTime);
    // 回退：返回原文本或缓存结果
    return texts.map((text, index) => results[index] || text);
  }
}

// 🚀 优化：添加超时控制的Google翻译
async function translateToChineseWithGoogleOptimized(text: string): Promise<string> {
  const startTime = Date.now();
  
  if (!text || text.trim() === '') {
    return '';
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=zh-CN&q=${encodedText}`;
    
    // 🚀 优化：添加5秒超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const fetchStart = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    recordTiming('单个翻译 - API请求', fetchStart);
    
    if (!response.ok) {
      console.error('❌ Google翻译API请求失败:', {
        status: response.status,
        statusText: response.statusText
      });
      recordTiming('单个翻译 - 失败', startTime);
      return text;
    }
    
    const parseStart = Date.now();
    const result = await response.json();
    recordTiming('单个翻译 - 解析响应', parseStart);
    
    if (result && Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const translatedText = result[0][0][0] || text;
      recordTiming('单个翻译 - 成功', startTime);
      return translatedText;
    } else {
      console.warn('⚠️ Google翻译返回格式异常，使用原文本');
      recordTiming('单个翻译 - 格式异常', startTime);
      return text;
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ Google翻译请求超时');
      recordTiming('单个翻译 - 超时', startTime);
    } else {
      console.error('❌ Google翻译过程中发生错误:', error);
      recordTiming('单个翻译 - 错误', startTime);
    }
    return text;
  }
}

// 🚀 优化：OAuth token缓存机制
async function getRedditAccessTokenOptimized(): Promise<string> {
  const startTime = Date.now();
  console.log('🔑 检查Reddit OAuth token缓存...');
  
  // 检查缓存
  if (tokenCache && Date.now() < tokenCache.expiry) {
    console.log('📦 使用缓存的OAuth token');
    recordTiming('OAuth Token - 缓存命中', startTime);
    return tokenCache.token;
  }
  
  console.log('🔄 获取新的Reddit OAuth token...');
  const appId = Deno.env.get('REDDIT_APP_ID');
  const appSecret = Deno.env.get('REDDIT_APP_SECRET');
  
  if (!appId || !appSecret) {
    console.error('❌ Reddit应用凭据未找到');
    recordTiming('OAuth Token - 凭据缺失', startTime);
    throw new Error('Reddit app credentials not found. Please set REDDIT_APP_ID and REDDIT_APP_SECRET environment variables.');
  }
  
  const credentials = btoa(`${appId}:${appSecret}`);
  
  // 🚀 优化：添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
  
  try {
    const fetchStart = Date.now();
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'supabase-reddit-api:v2.1.0 (by /u/supabase_user)'
      },
      body: 'grant_type=client_credentials',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    recordTiming('OAuth Token - API请求', fetchStart);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      recordTiming('OAuth Token - 失败', startTime);
      throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }
    
    const parseStart = Date.now();
    const tokenData = await response.json();
    recordTiming('OAuth Token - 解析响应', parseStart);
    
    // 🚀 优化：缓存token
    tokenCache = {
      token: tokenData.access_token,
      expiry: Date.now() + TOKEN_CACHE_DURATION
    };
    
    console.log('✅ 新OAuth token获取并缓存成功');
    recordTiming('OAuth Token - 新获取', startTime);
    return tokenData.access_token;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      recordTiming('OAuth Token - 超时', startTime);
      throw new Error('Reddit OAuth请求超时');
    }
    recordTiming('OAuth Token - 错误', startTime);
    throw error;
  }
}

// 🚀 优化：并发控制的Reddit API调用
async function fetchRedditDataConcurrent(subredditName: string, limit: number, accessToken: string) {
  const startTime = Date.now();
  console.log(`🚀 并发获取 r/${subredditName} 的信息和帖子...`);
  
  // 🚀 优化：并行获取subreddit信息和热门帖子
  const [subredditInfo, hotPosts] = await Promise.allSettled([
    fetchSubredditInfoOptimized(subredditName, accessToken),
    fetchSubredditHotPostsOptimized(subredditName, limit, accessToken)
  ]);
  
  if (subredditInfo.status === 'rejected') {
    recordTiming(`Reddit数据获取 - r/${subredditName} - 失败`, startTime);
    throw new Error(`获取subreddit信息失败: ${subredditInfo.reason}`);
  }
  
  if (hotPosts.status === 'rejected') {
    console.warn(`获取热门帖子失败，使用空数组: ${hotPosts.reason}`);
    recordTiming(`Reddit数据获取 - r/${subredditName} - 部分失败`, startTime);
    return {
      subredditInfo: subredditInfo.value,
      hotPosts: []
    };
  }
  
  recordTiming(`Reddit数据获取 - r/${subredditName} - 成功`, startTime);
  return {
    subredditInfo: subredditInfo.value,
    hotPosts: hotPosts.value
  };
}

// 🚀 优化：添加超时控制的subreddit信息获取
async function fetchSubredditInfoOptimized(subredditName: string, accessToken: string) {
  const startTime = Date.now();
  const url = `https://oauth.reddit.com/r/${subredditName}/about`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
  
  try {
    const fetchStart = Date.now();
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'supabase-reddit-api:v2.1.0 (by /u/supabase_user)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    recordTiming(`Subreddit信息 - r/${subredditName} - API请求`, fetchStart);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      recordTiming(`Subreddit信息 - r/${subredditName} - 失败`, startTime);
      throw new Error(`Failed to fetch subreddit info: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }
    
    const parseStart = Date.now();
    const data = await response.json();
    recordTiming(`Subreddit信息 - r/${subredditName} - 解析`, parseStart);
    
    if (!data.data) {
      recordTiming(`Subreddit信息 - r/${subredditName} - 无数据`, startTime);
      throw new Error(`No subreddit data found for r/${subredditName}`);
    }
    
    const subredditData = data.data;
    const result = {
      subreddit: subredditData.display_name?.toLowerCase() || subredditName.toLowerCase(),
      display_name: subredditData.display_name,
      title: subredditData.title,
      description: subredditData.description,
      subscribers: subredditData.subscribers || 0,
      active_users: subredditData.active_user_count || 0,
      created_utc: subredditData.created_utc ? Math.floor(subredditData.created_utc * 1000) : null,
      subreddit_type: subredditData.subreddit_type,
      public_description: subredditData.public_description,
      icon_img: subredditData.icon_img || subredditData.community_icon,
      banner_img: subredditData.banner_img || subredditData.banner_background_image
    };
    
    recordTiming(`Subreddit信息 - r/${subredditName} - 成功`, startTime);
    return result;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      recordTiming(`Subreddit信息 - r/${subredditName} - 超时`, startTime);
      throw new Error(`获取r/${subredditName}信息超时`);
    }
    recordTiming(`Subreddit信息 - r/${subredditName} - 错误`, startTime);
    throw error;
  }
}

// 🚀 优化：添加超时控制的热门帖子获取
async function fetchSubredditHotPostsOptimized(subredditName: string, limit: number, accessToken: string) {
  const startTime = Date.now();
  const url = `https://oauth.reddit.com/r/${subredditName}/hot?limit=${limit}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
  
  try {
    const fetchStart = Date.now();
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'supabase-reddit-api:v2.1.0 (by /u/supabase_user)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    recordTiming(`热门帖子 - r/${subredditName} - API请求`, fetchStart);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      recordTiming(`热门帖子 - r/${subredditName} - 失败`, startTime);
      throw new Error(`Failed to fetch hot posts: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }
    
    const parseStart = Date.now();
    const data = await response.json();
    recordTiming(`热门帖子 - r/${subredditName} - 解析`, parseStart);
    
    if (!data.data || !data.data.children) {
      console.log(`⚠️ r/${subredditName} 没有返回帖子数据`);
      recordTiming(`热门帖子 - r/${subredditName} - 无数据`, startTime);
      return [];
    }
    
    const processStart = Date.now();
    const posts = data.data.children.map((child: any) => {
      const post = child.data;
      return {
        id: post.id,
        url: post.url,
        score: post.score,
        title: post.title,
        author: post.author,
        content: post.selftext || '',
        created: post.created_utc * 1000,
        subreddit: post.subreddit,
        comment_count: post.num_comments,
        upvote_ratio: post.upvote_ratio,
        permalink: `https://reddit.com${post.permalink}`
      };
    });
    recordTiming(`热门帖子 - r/${subredditName} - 数据处理`, processStart);
    
    // 🚀 优化：使用优化版批量翻译
    const translateStart = Date.now();
    const titles = posts.map((post: any) => post.title);
    const translatedTitles = await translateTextsBatchGoogleOptimized(titles);
    recordTiming(`热门帖子 - r/${subredditName} - 标题翻译`, translateStart);
    
    const postsWithTranslations = posts.map((post: any, index: number) => ({
      ...post,
      title_zh: translatedTitles[index] || post.title
    }));
    
    console.log(`✅ 成功获取 r/${subredditName} 的 ${postsWithTranslations.length} 个热门帖子 (含优化翻译)`);
    recordTiming(`热门帖子 - r/${subredditName} - 总计`, startTime);
    return postsWithTranslations;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      recordTiming(`热门帖子 - r/${subredditName} - 超时`, startTime);
      throw new Error(`获取r/${subredditName}热门帖子超时`);
    }
    recordTiming(`热门帖子 - r/${subredditName} - 错误`, startTime);
    throw error;
  }
}

// Initialize Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Database functions (keeping original functionality)
async function getSubredditFromDatabase(subredditName: string) {
  const startTime = Date.now();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('subreddit_top')
    .select('*')
    .eq('subreddit', subredditName.toLowerCase())
    .single();
    
  if (error && error.code !== 'PGRST116') {
    recordTiming(`数据库查询 - r/${subredditName} - 失败`, startTime);
    throw new Error(`Database query error: ${error.message}`);
  }
  recordTiming(`数据库查询 - r/${subredditName} - 成功`, startTime);
  return data;
}

async function getDefaultSubreddits() {
  const startTime = Date.now();
  console.log('📋 获取默认subreddits配置...');
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('sys_config')
    .select('data')
    .eq('biz_code', 'reddit_default_subreddits')
    .single();
    
  if (error) {
    console.error('❌ 获取默认subreddits配置失败:', error);
    recordTiming('默认配置查询 - 失败', startTime);
    return ['saas', 'technology'];
  }
  
  if (!data || !data.data) {
    console.warn('⚠️ sys_config中未找到数据，使用备用默认值');
    recordTiming('默认配置查询 - 无数据', startTime);
    return ['saas', 'technology'];
  }

  try {
    let configData;
    if (typeof data.data === 'string') {
      configData = JSON.parse(data.data);
    } else {
      configData = data.data;
    }
    
    if (!configData || !configData.subreddits || !Array.isArray(configData.subreddits)) {
      console.warn('⚠️ 解析后的配置格式不正确，使用备用默认值');
      recordTiming('默认配置查询 - 格式错误', startTime);
      return ['saas', 'technology'];
    }
    
    console.log('✅ 成功获取默认subreddits配置:', configData.subreddits);
    recordTiming('默认配置查询 - 成功', startTime);
    return configData.subreddits;
  } catch (parseError) {
    console.error('❌ 解析默认subreddits配置失败:', parseError);
    recordTiming('默认配置查询 - 解析失败', startTime);
    return ['saas', 'technology'];
  }
}

async function saveSubredditToDatabase(subredditInfo: any, hotPosts: any[]) {
  const startTime = Date.now();
  const supabase = createSupabaseClient();
  
  // 🚀 优化：使用优化版翻译
  const translateStart = Date.now();
  let titleZh = '';
  if (subredditInfo.title) {
    const cached = translationCache.get(subredditInfo.title);
    if (cached) {
      titleZh = cached;
    } else {
      titleZh = await translateToChineseWithGoogleOptimized(subredditInfo.title);
      translationCache.set(subredditInfo.title, titleZh);
    }
  }
  recordTiming(`数据库保存 - r/${subredditInfo.subreddit} - 标题翻译`, translateStart);
  
  const prepareStart = Date.now();
  const dbRecord = {
    id: subredditInfo.subreddit,
    subreddit: subredditInfo.subreddit,
    display_name: subredditInfo.display_name,
    title: subredditInfo.title,
    title_zh: titleZh,
    description: subredditInfo.description,
    subscribers: subredditInfo.subscribers,
    active_users: subredditInfo.active_users,
    created_utc: subredditInfo.created_utc,
    subreddit_type: subredditInfo.subreddit_type,
    public_description: subredditInfo.public_description,
    icon_img: subredditInfo.icon_img,
    banner_img: subredditInfo.banner_img,
    hot_posts: hotPosts,
    last_updated: new Date().toISOString()
  };
  recordTiming(`数据库保存 - r/${subredditInfo.subreddit} - 数据准备`, prepareStart);
  
  const upsertStart = Date.now();
  const { error } = await supabase
    .from('subreddit_top')
    .upsert(dbRecord, { onConflict: 'subreddit' });
    
  if (error) {
    recordTiming(`数据库保存 - r/${subredditInfo.subreddit} - 失败`, startTime);
    throw new Error(`Database upsert error: ${error.message}`);
  }
  recordTiming(`数据库保存 - r/${subredditInfo.subreddit} - 写入`, upsertStart);
  
  console.log(`💾 成功保存 r/${subredditInfo.subreddit} 数据到数据库`);
  recordTiming(`数据库保存 - r/${subredditInfo.subreddit} - 总计`, startTime);
}

// 🚀 优化：主处理函数 - 使用并发优化
async function processSubredditOptimized(subredditName: string, limit = 10, forceRefresh = false) {
  const startTime = Date.now();
  const cleanSubredditName = subredditName.trim().toLowerCase();
  
  try {
    // Check cache first
    if (!forceRefresh) {
      const cacheCheckStart = Date.now();
      const cachedData = await getSubredditFromDatabase(cleanSubredditName);
      recordTiming(`处理Subreddit - r/${cleanSubredditName} - 缓存检查`, cacheCheckStart);
      
      if (cachedData) {
        const lastUpdated = new Date(cachedData.last_updated);
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        if (lastUpdated > twelveHoursAgo) {
          console.log(`📦 使用缓存数据 r/${cleanSubredditName}`);
          recordTiming(`处理Subreddit - r/${cleanSubredditName} - 缓存命中`, startTime);
          return { ...cachedData, source: 'cache' };
        }
      }
    }
    
    console.log(`🔄 从Reddit获取新数据 r/${cleanSubredditName}...`);
    
    // 🚀 优化：使用缓存的token和并发请求
    const tokenStart = Date.now();
    const accessToken = await getRedditAccessTokenOptimized();
    recordTiming(`处理Subreddit - r/${cleanSubredditName} - Token获取`, tokenStart);
    
    const fetchStart = Date.now();
    const { subredditInfo, hotPosts } = await fetchRedditDataConcurrent(cleanSubredditName, limit, accessToken);
    recordTiming(`处理Subreddit - r/${cleanSubredditName} - 数据获取`, fetchStart);
    
    // Save to database
    const saveStart = Date.now();
    await saveSubredditToDatabase(subredditInfo, hotPosts);
    recordTiming(`处理Subreddit - r/${cleanSubredditName} - 保存`, saveStart);
    
    recordTiming(`处理Subreddit - r/${cleanSubredditName} - 总计`, startTime);
    return {
      ...subredditInfo,
      hot_posts: hotPosts,
      last_updated: new Date().toISOString(),
      source: 'fresh'
    };
    
  } catch (error) {
    recordTiming(`处理Subreddit - r/${cleanSubredditName} - 失败`, startTime);
    throw new Error(`Failed to process r/${cleanSubredditName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Request validation
async function validateRequest(body: RequestBody) {
  const startTime = Date.now();
  let subreddits = body.subreddits;
  
  if (!subreddits || !Array.isArray(subreddits) || subreddits.length === 0) {
    console.log('📋 subreddits为空，获取默认配置...');
    subreddits = await getDefaultSubreddits();
  }
  
  if (!Array.isArray(subreddits) || subreddits.length === 0) {
    recordTiming('请求验证 - 失败', startTime);
    throw new Error('No subreddits available');
  }
  
  const limit = body.limit || 10;
  if (limit < 1 || limit > 25) {
    recordTiming('请求验证 - 失败', startTime);
    throw new Error('Limit must be between 1 and 25');
  }
  
  const forceRefresh = body.force_refresh === true;
  
  recordTiming('请求验证 - 成功', startTime);
  return { subreddits, limit, forceRefresh };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name, X-HTTP-Method-Override',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin'
};

function createCorsResponse(data: any, status = 200) {
  return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

// 🚀 优化：主处理器 - 增强并发控制
Deno.serve(async (req) => {
  const requestStartTime = Date.now();
  console.log('\n🚀 ===== Reddit2 优化版 Edge Function 开始执行 =====');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createCorsResponse(null, 204);
  }
  
  // Handle GET requests
  if (req.method === 'GET') {
    const apiInfo = {
      name: 'Reddit2 优化版 Edge Function',
      version: '2.2.0',
      description: '高性能Reddit数据获取和翻译服务',
      optimizations: [
        '翻译缓存机制',
        'OAuth token缓存',
        '批量翻译优化',
        '并发API调用',
        '超时控制',
        '错误隔离',
        '详细性能监控'
      ],
      performance_improvements: {
        translation_cache: 'In-memory caching for repeated translations',
        token_cache: '50-minute OAuth token caching',
        batch_optimization: 'Increased batch size to 10, reduced delays',
        concurrent_requests: 'Parallel subreddit info and posts fetching',
        timeout_control: 'Request timeout protection',
        error_isolation: 'Individual request failures don\'t affect others',
        timing_monitoring: 'Detailed performance timing for all operations'
      },
      timestamp: new Date().toISOString()
    };
    recordTiming('整体请求 - GET请求', requestStartTime);
    return createCorsResponse(apiInfo);
  }
  
  try {
    if (req.method !== 'POST') {
      recordTiming('整体请求 - 方法不允许', requestStartTime);
      return createCorsResponse({
        error: 'Method not allowed',
        message: 'Only POST requests are supported for data fetching'
      }, 405);
    }
    
    // Parse request body
    const parseStart = Date.now();
    let body: RequestBody = {};
    try {
      const textBody = await req.text();
      if (textBody.trim()) {
        body = JSON.parse(textBody) as RequestBody;
      }
    } catch (parseError) {
      recordTiming('整体请求 - JSON解析失败', requestStartTime);
      return createCorsResponse({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, 400);
    }
    recordTiming('整体请求 - 请求解析', parseStart);
    
    // Validate and process
    const validationStart = Date.now();
    const { subreddits, limit, forceRefresh } = await validateRequest(body);
    recordTiming('整体请求 - 验证', validationStart);
    
    console.log(`🚀 开始优化并发处理 ${subreddits.length} 个subreddits...`);
    
    // 🚀 优化：使用有限并发控制 - 最多同时处理5个subreddit
    const processStart = Date.now();
    const maxConcurrency = Math.min(5, subreddits.length);
    const results: SubredditResult[] = new Array(subreddits.length);
    let successCount = 0;
    let errorCount = 0;
    
    // 分批处理以控制并发
    for (let i = 0; i < subreddits.length; i += maxConcurrency) {
      const batchStart = Date.now();
      const batch = subreddits.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (subreddit, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const data = await processSubredditOptimized(subreddit, limit, forceRefresh);
          console.log(`✅ r/${subreddit} 处理完成 (${data.source})`);
          return { index: globalIndex, subreddit, data, success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ r/${subreddit} 处理失败:`, errorMessage);
          return { 
            index: globalIndex, 
            subreddit, 
            data: { error: errorMessage }, 
            success: false 
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { index, subreddit, data, success } = result.value;
          results[index] = { subreddit, data };
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });
      
      recordTiming(`处理批次 - 批次${Math.floor(i/maxConcurrency) + 1}(${batch.length}项)`, batchStart);
    }
    
    recordTiming('整体请求 - 数据处理', processStart);
    
    console.log('🎉 优化版处理完成');
    console.log('📊 优化版结果统计:', {
      总数: subreddits.length,
      成功: successCount,
      失败: errorCount,
      成功率: `${(successCount / subreddits.length * 100).toFixed(1)}%`,
      缓存命中数: translationCache.size
    });
    
    // 输出性能统计
    logTimingSummary();
    
    const responseStart = Date.now();
    const response = {
      success: true,
      data: results,
      meta: {
        limit,
        force_refresh: forceRefresh,
        subreddits_requested: subreddits.length,
        subreddits_used: subreddits,
        translation_cache_size: translationCache.size,
        performance_optimizations: true,
        timing_stats: timingStats,
        timestamp: new Date().toISOString()
      }
    };
    recordTiming('整体请求 - 响应准备', responseStart);
    
    console.log('✅ 优化版响应准备完成');
    recordTiming('整体请求 - 总计', requestStartTime);
    console.log('🏁 ===== Reddit2 优化版 Edge Function 执行完成 =====\n');
    return createCorsResponse(response);
    
  } catch (error) {
    console.error('💥 优化版Edge Function发生错误:', error);
    recordTiming('整体请求 - 失败', requestStartTime);
    return createCorsResponse({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timing_stats: timingStats,
      timestamp: new Date().toISOString()
    }, 500);
  }
}); 