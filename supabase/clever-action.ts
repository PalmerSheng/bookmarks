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

// Function to translate text using Google Translate API
async function translateToChineseWithGoogle(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }
  
  
  try {
    // Encode the text for URL
    const encodedText = encodeURIComponent(text);
    // Google Translate API URL - auto detect source language, translate to simplified Chinese
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=zh-CN&q=${encodedText}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Google翻译API请求失败:', {
        status: response.status,
        statusText: response.statusText
      });
      return text; // Return original text on error
    }
    
    const result = await response.json();
    
    // Parse Google Translate response format: [[[translated_text, original_text, ...], ...], ...]
    if (result && Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const translatedText = result[0][0][0] || text;
      return translatedText;
    } else {
      console.warn('⚠️ Google翻译返回格式异常，使用原文本');
      return text;
    }
    
  } catch (error) {
    console.error('❌ Google翻译过程中发生错误:', error);
    return text; // Return original text on error
  }
}

// 🚀 优化版批量翻译函数 - 使用Google翻译API批量处理
// Function to translate multiple texts using Google Translate API
async function translateTextsBatchGoogle(texts: string[]): Promise<string[]> {
  if (!texts || texts.length === 0) {
    return [];
  }
  
  console.log(`🌐 开始使用Google翻译批量翻译文本: ${texts}`);
  
  try {
    // Google Translate doesn't support batch translation directly, so we'll use concurrent requests
    // But limit concurrency to avoid rate limiting
    const batchSize = 3; // Process 3 translations at a time to be respectful to Google's API
    const results: string[] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => translateToChineseWithGoogle(text));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Google翻译失败 (索引 ${i + index}):`, result.reason);
          results.push(batch[index]); // Use original text on failure
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between batches
      }
    }
    
    console.log(`✅ Google批量翻译完成: 翻译了 ${results.length} 个文本`);
    return results;
    
  } catch (error) {
    console.error('❌ Google批量翻译过程中发生错误:', error);
    // Fallback to individual translation
    console.log('🔄 回退到逐个Google翻译...');
    const results: string[] = [];
    for (const text of texts) {
      const translated = await translateToChineseWithGoogle(text);
      results.push(translated);
      // Small delay between individual requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return results;
  }
}

// 📤 备用翻译函数 - 当Google翻译失败时使用原有的AI翻译
// Function to translate multiple texts concurrently with rate limiting (AI fallback method)
async function translateTextsAIFallback(texts: string[]): Promise<string[]> {
  console.log('🔄 Google翻译不可用，尝试使用AI翻译作为备用方案...');
  
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  
  if (!cfAccountId || !cfApiToken) {
    console.warn('⚠️ AI翻译凭据也未找到，返回原文本');
    return texts;
  }
  
  const batchSize = 5; // Process 5 translations at a time to avoid rate limits
  const results: string[] = [];
  for(let i = 0; i < texts.length; i += batchSize){
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map((text)=>translateToChineseWithAI(text));
    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((result, index)=>{
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`AI翻译失败 (索引 ${i + index}):`, result.reason);
        results.push(batch[index]); // Use original text on failure
      }
    });
    // Add delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise((resolve)=>setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  return results;
}

// Legacy AI translation function (kept as fallback)
async function translateToChineseWithAI(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }
  console.log(`🤖 使用AI翻译文本: ${text.substring(0, 50)}...`);
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  if (!cfAccountId || !cfApiToken) {
    console.warn('⚠️ Cloudflare AI凭据未找到，跳过翻译');
    return text; // Return original text if no credentials
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-4-scout-17b-16e-instruct`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'supabase-reddit-translator/1.0.0'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a friendly translator assistant. Translate the given English text into Simplified Chinese. Only return the translated text in Simplified Chinese without any additional explanations or formatting."
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text().catch(()=>'Unknown error');
      console.error('❌ Cloudflare AI翻译失败:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return text; // Return original text on error
    }
    const result = await response.json();
    const translatedText = result.result?.response || text;
    console.log(`✅ AI翻译完成: ${translatedText.substring(0, 50)}...`);
    return translatedText;
  } catch (error) {
    console.error('❌ AI翻译过程中发生错误:', error);
    return text; // Return original text on error
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

// Function to get Reddit OAuth access token
async function getRedditAccessToken() {
  console.log('🔑 开始获取Reddit OAuth access token...');
  const appId = Deno.env.get('REDDIT_APP_ID');
  const appSecret = Deno.env.get('REDDIT_APP_SECRET');
  console.log('📋 环境变量检查:', {
    hasAppId: !!appId,
    hasAppSecret: !!appSecret,
    appIdLength: appId?.length || 0
  });
  if (!appId || !appSecret) {
    console.error('❌ Reddit应用凭据未找到');
    throw new Error('Reddit app credentials not found. Please set REDDIT_APP_ID and REDDIT_APP_SECRET environment variables.');
  }
  const credentials = btoa(`${appId}:${appSecret}`);
  console.log('🔐 生成Basic认证凭据，长度:', credentials.length);
  console.log('📡 发送OAuth token请求到Reddit API...');
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'supabase-reddit-api:v2.0.0 (by /u/supabase_user)'
    },
    body: 'grant_type=client_credentials'
  });
  console.log('📥 OAuth响应状态:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  if (!response.ok) {
    const errorText = await response.text().catch(()=>'Unknown error');
    console.error('❌ OAuth token获取失败:', {
      status: response.status,
      statusText: response.statusText,
      errorText
    });
    throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const tokenData = await response.json();
  console.log('✅ OAuth token获取成功:', {
    tokenType: tokenData.token_type,
    expiresIn: tokenData.expires_in,
    scope: tokenData.scope,
    accessTokenLength: tokenData.access_token?.length || 0
  });
  return tokenData.access_token;
}

// Function to fetch subreddit info with OAuth
async function fetchSubredditInfo(subredditName, accessToken) {
  console.log(`📋 获取 r/${subredditName} 的基本信息...`);
  // Use provided access token instead of getting a new one
  const url = `https://oauth.reddit.com/r/${subredditName}/about`;
  console.log(`🌐 发送请求到: ${url}`);
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.0.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
  });
  console.log(`📥 Subreddit info响应 (r/${subredditName}):`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  if (!response.ok) {
    const errorText = await response.text().catch(()=>'Unknown error');
    throw new Error(`Failed to fetch subreddit info: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const data = await response.json();
  if (!data.data) {
    throw new Error(`No subreddit data found for r/${subredditName}`);
  }
  const subredditData = data.data;
  console.log(`✅ 成功获取 r/${subredditName} 基本信息`);
  return {
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
}

// Function to fetch hot posts from subreddit with OAuth
async function fetchSubredditHotPosts(subredditName, limit = 10, accessToken) {
  console.log(`🔥 获取 r/${subredditName} 的热门帖子 (limit: ${limit})...`);
  // Use provided access token instead of getting a new one
  const url = `https://oauth.reddit.com/r/${subredditName}/hot?limit=${limit}`;
  console.log(`🌐 发送请求到: ${url}`);
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.0.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
  });
  console.log(`📥 Hot posts响应 (r/${subredditName}):`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  if (!response.ok) {
    const errorText = await response.text().catch(()=>'Unknown error');
    throw new Error(`Failed to fetch hot posts: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const data = await response.json();
  if (!data.data || !data.data.children) {
    console.log(`⚠️ r/${subredditName} 没有返回帖子数据`);
    return [];
  }
  const posts = data.data.children.map((child)=>{
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
  // 🚀 批量翻译帖子标题到中文 - 优先使用Google翻译，失败时回退到AI翻译
  // Translate post titles to Chinese using Google Translate with AI fallback
  const titles = posts.map((post)=>post.title);
  let translatedTitles: string[] = [];
  
  try {
    translatedTitles = await translateTextsBatchGoogle(titles);
  } catch (error) {
    console.warn('⚠️ Google批量翻译失败，回退到AI翻译...', error);
    translatedTitles = await translateTextsAIFallback(titles);
  }
  
  // Add Chinese translations to posts
  const postsWithTranslations = posts.map((post, index)=>({
      ...post,
      title_zh: translatedTitles[index] || post.title // Fallback to original title if translation failed
    }));
  console.log(`✅ 成功获取 r/${subredditName} 的 ${postsWithTranslations.length} 个热门帖子 (含中文翻译)`);
  return postsWithTranslations;
}

// Database functions
async function getSubredditFromDatabase(subredditName) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('subreddit_top').select('*').eq('subreddit', subredditName.toLowerCase()).single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database query error: ${error.message}`);
  }
  return data;
}

// Function to get default subreddits from sys_config table
async function getDefaultSubreddits() {
  console.log('📋 获取默认subreddits配置...');
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('sys_config').select('data').eq('biz_code', 'reddit_default_subreddits').single();
  if (error) {
    console.error('❌ 获取默认subreddits配置失败:', error);
    // Return fallback default subreddits if database query fails
    return [
      'saas',
      'technology'
    ];
  }
  console.log('🔍 获取默认subreddits配置:', data);
  
  if (!data || !data.data) {
    console.warn('⚠️ sys_config中未找到数据，使用备用默认值');
    return [
      'saas',
      'technology'
    ];
  }

  try {
    // Parse the JSON string from the database
    let configData;
    if (typeof data.data === 'string') {
      configData = JSON.parse(data.data);
    } else {
      configData = data.data;
    }
    
    if (!configData || !configData.subreddits || !Array.isArray(configData.subreddits)) {
      console.warn('⚠️ 解析后的配置格式不正确，使用备用默认值');
      return [
        'saas',
        'technology'
      ];
    }
    
    console.log('✅ 成功获取默认subreddits配置:', configData.subreddits);
    return configData.subreddits;
  } catch (parseError) {
    console.error('❌ 解析默认subreddits配置失败:', parseError);
    return [
      'saas',
      'technology'
    ];
  }
}

async function saveSubredditToDatabase(subredditInfo, hotPosts) {
  const supabase = createSupabaseClient();
  // Translate subreddit description to Chinese using Google Translate
  console.log('🌐 使用Google翻译subreddit描述...');
  let titleZh = '';
  try {
    titleZh = await translateToChineseWithGoogle(subredditInfo.title || '');
  } catch (error) {
    console.warn('⚠️ Google翻译失败，尝试AI翻译备用方案...', error);
    titleZh = await translateToChineseWithAI(subredditInfo.title || '');
  }
  console.log("翻译后描述: " + titleZh);
  // Add id field using subreddit name  
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
  const { error } = await supabase.from('subreddit_top').upsert(dbRecord, {
    onConflict: 'subreddit'
  });
  if (error) {
    throw new Error(`Database upsert error: ${error.message}`);
  }
  console.log(`💾 成功保存 r/${subredditInfo.subreddit} 数据到数据库 (含中文翻译)`);
}

// Main processing function for a single subreddit
async function processSubreddit(subredditName, limit = 10, forceRefresh = false) {
  const cleanSubredditName = subredditName.trim().toLowerCase();
  try {
    // Check if we should use cached data
    if (!forceRefresh) {
      const cachedData = await getSubredditFromDatabase(cleanSubredditName);
      if (cachedData) {
        // Check if data is recent (less than 12 hours old)
        const lastUpdated = new Date(cachedData.last_updated);
        const oneDayAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        if (lastUpdated > oneDayAgo) {
          console.log(`📦 使用缓存数据 r/${cleanSubredditName} (上次更新: ${lastUpdated.toISOString()})`);
          return {
            ...cachedData,
            source: 'cache'
          };
        }
      }
    }
    // Fetch fresh data from Reddit
    console.log(`🔄 从Reddit获取新数据 r/${cleanSubredditName}...`);
    const accessToken = await getRedditAccessToken();
    const [subredditInfo, hotPosts] = await Promise.all([
      fetchSubredditInfo(cleanSubredditName, accessToken),
      fetchSubredditHotPosts(cleanSubredditName, limit, accessToken)
    ]);
    
    // Translate subreddit title using Google Translate with AI fallback
    let titleZh = '';
    if (subredditInfo.title) {
      try {
        titleZh = await translateToChineseWithGoogle(subredditInfo.title);
      } catch (error) {
        console.warn('⚠️ Google翻译subreddit标题失败，使用AI翻译备用方案...', error);
        titleZh = await translateToChineseWithAI(subredditInfo.title);
      }
    }
    
    // Save to database
    await saveSubredditToDatabase(subredditInfo, hotPosts);
    return {
      ...subredditInfo,
      title_zh: titleZh,
      hot_posts: hotPosts,
      last_updated: new Date().toISOString(),
      source: 'fresh'
    };
  } catch (error) {
    throw new Error(`Failed to process r/${cleanSubredditName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Request validation
async function validateRequest(body: RequestBody) {
  let subreddits = body.subreddits;
  // Check if subreddits is empty, null, undefined, or not an array
  if (!subreddits || !Array.isArray(subreddits) || subreddits.length === 0) {
    console.log('📋 subreddits为空或未提供，从数据库获取默认配置...');
    subreddits = await getDefaultSubreddits();
  }
  // Validate that we have at least one subreddit after getting defaults
  if (!Array.isArray(subreddits) || subreddits.length === 0) {
    throw new Error('No subreddits available - neither provided nor found in default configuration');
  }
  const limit = body.limit || 10;
  if (limit < 1 || limit > 25) {
    throw new Error('Limit must be between 1 and 25');
  }
  const forceRefresh = body.force_refresh === true;
  console.log("raw:" + body.force_refresh + " forceRefresh" + forceRefresh);
  return {
    subreddits: subreddits,
    limit,
    forceRefresh
  };
}

// Enhanced CORS headers for full cross-origin support
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

// Helper function to create CORS-enabled responses
function createCorsResponse(data, status = 200) {
  return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

// Main handler
Deno.serve(async (req)=>{
  console.log('\n🚀 ===== Reddit2 Edge Function 开始执行 =====');
  console.log('📋 请求信息:', {
    method: req.method,
    url: req.url,
    origin: req.headers.get('origin'),
    userAgent: req.headers.get('user-agent'),
    contentType: req.headers.get('content-type')
  });
  // Handle CORS preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    console.log('🔄 处理CORS预检请求');
    console.log('🔍 请求头部:', {
      origin: req.headers.get('origin'),
      accessControlRequestMethod: req.headers.get('access-control-request-method'),
      accessControlRequestHeaders: req.headers.get('access-control-request-headers')
    });
    return createCorsResponse(null, 204);
  }
  // Handle GET requests (for health checks or basic info)
  if (req.method === 'GET') {
    console.log('🔍 处理GET请求 - 返回API信息');
    const apiInfo = {
      name: 'Reddit2 Edge Function',
      version: '2.1.0',
      description: 'Fetch Reddit subreddit data with OAuth and Google Translate integration',
      status: 'healthy',
      cors: 'enabled',
      translation: {
        primary: 'Google Translate API (auto-detect → Simplified Chinese)',
        fallback: 'Cloudflare AI Translation',
        batch_support: true
      },
      endpoints: {
        GET: '/reddit2 - API信息',
        POST: '/reddit2 - 获取Reddit数据',
        OPTIONS: '/reddit2 - CORS预检'
      },
      usage: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          subreddits: [
            'subreddit1',
            'subreddit2'
          ],
          limit: 10,
          force_refresh: false
        },
        notes: {
          subreddits: '可选 - 如果为空或未提供，将从sys_config表中获取默认配置 (biz_code: reddit_default_subreddits)',
          limit: '可选 - 每个subreddit返回的帖子数量 (1-25，默认10)',
          force_refresh: '可选 - 是否强制刷新数据，忽略缓存 (默认false)',
          translation: '自动使用Google翻译API进行批量翻译，失败时回退到AI翻译'
        }
      },
      timestamp: new Date().toISOString()
    };
    return createCorsResponse(apiInfo);
  }
  try {
    // Only allow POST requests for main functionality
    if (req.method !== 'POST') {
      console.log('❌ 不支持的HTTP方法:', req.method);
      return createCorsResponse({
        error: 'Method not allowed',
        message: 'Only POST requests are supported for data fetching. Use GET for API info.',
        allowed_methods: [
          'GET',
          'POST',
          'OPTIONS'
        ]
      }, 405);
    }
    // Parse request body with error handling
    console.log('📥 解析请求体...');
    console.log('🔍 请求内容类型:', req.headers.get('content-type'));
    let body: RequestBody = {};
    try {
      const textBody = await req.text();
      console.log('📝 原始请求体长度:', textBody.length);
      console.log('📝 原始请求体内容:', textBody.substring(0, 200) + (textBody.length > 200 ? '...' : ''));
      if (textBody.trim()) {
        body = JSON.parse(textBody) as RequestBody;
        console.log('✅ 请求体解析成功:', {
          subreddits: body.subreddits,
          limit: body.limit,
          force_refresh: body.force_refresh,
          keys: Object.keys(body)
        });
      } else {
        console.log('📝 请求体为空，将使用默认配置');
        body = {}; // Empty body will trigger default subreddits loading
      }
    } catch (parseError) {
      console.error('❌ 请求体解析失败:', parseError);
      return createCorsResponse({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, 400);
    }
    // Validate input
    console.log('🔍 开始验证请求参数...');
    try {
      const { subreddits, limit, forceRefresh } = await validateRequest(body);
      console.log('✅ 请求参数验证通过:', {
        subreddits,
        limit,
        forceRefresh
      });
      // Process all subreddits
      console.log(`🔄 并行处理 ${subreddits.length} 个subreddits...`);
      
      // Create promises array while maintaining order
      const promises = subreddits.map(async (subreddit, index) => {
        try {
          const data = await processSubreddit(subreddit, limit, forceRefresh);
          console.log(`✅ r/${subreddit} 处理完成 (${data.source})`);
          return { index, subreddit, data, success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ r/${subreddit} 处理失败:`, errorMessage);
          return { 
            index, 
            subreddit, 
            data: { error: errorMessage }, 
            success: false 
          };
        }
      });
      
      const settledResults = await Promise.allSettled(promises);
      
      // Process results and maintain order
      const orderedResults: SubredditResult[] = new Array(subreddits.length);
      let successCount = 0;
      let errorCount = 0;
      
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { subreddit, data, success } = result.value;
          orderedResults[index] = { subreddit, data };
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          // This should rarely happen as we're handling errors in the map function
          const subreddit = subreddits[index];
          console.error(`❌ r/${subreddit} Promise被拒绝:`, result.reason);
          orderedResults[index] = { 
            subreddit, 
            data: { error: 'Promise rejected' } 
          };
          errorCount++;
        }
      });
      
      console.log('🎉 所有subreddits处理完成');
      console.log('📊 处理结果统计:', {
        总数: subreddits.length,
        成功: successCount,
        失败: errorCount,
        成功率: `${(successCount / subreddits.length * 100).toFixed(1)}%`
      });
      
      const response = {
        success: true,
        data: orderedResults,
        meta: {
          limit,
          force_refresh: forceRefresh,
          subreddits_requested: subreddits.length,
          subreddits_used: subreddits,
          used_default_subreddits: !body.subreddits || !Array.isArray(body.subreddits) || body.subreddits.length === 0,
          timestamp: new Date().toISOString(),
          cors_enabled: true
        }
      };
      console.log('✅ 响应准备完成，返回结果');
      console.log('🏁 ===== Reddit2 Edge Function 执行完成 =====\n');
      return createCorsResponse(response);
    } catch (validationError) {
      console.error('❌ 请求参数验证失败:', validationError);
      return createCorsResponse({
        error: 'Validation error',
        message: validationError instanceof Error ? validationError.message : 'Invalid request parameters',
        timestamp: new Date().toISOString()
      }, 400);
    }
  } catch (error) {
    console.error('💥 Reddit2 Edge Function发生严重错误:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    const errorResponse = {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      cors_enabled: true
    };
    console.log('❌ 返回错误响应:', errorResponse);
    console.log('🏁 ===== Reddit2 Edge Function 执行结束(错误) =====\n');
    return createCorsResponse(errorResponse, 500);
  }
});
