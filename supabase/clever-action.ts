// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
// Function to translate text using Cloudflare AI
async function translateToChineseWithAI(text) {
  if (!text || text.trim() === '') {
    return '';
  }
  console.log(`🌐 开始翻译文本: ${text.substring(0, 50)}...`);
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  if (!cfAccountId || !cfApiToken) {
    console.warn('⚠️ Cloudflare AI凭据未找到，跳过翻译');
    return text; // Return original text if no credentials
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3-8b-instruct`;
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
            content: "You are a friendly translator assistant, translate the given English text to Chinese. Only return the translated Chinese text without any additional explanations or formatting."
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
    console.log(`✅ 翻译完成: ${translatedText.substring(0, 50)}...`);
    return translatedText;
  } catch (error) {
    console.error('❌ 翻译过程中发生错误:', error);
    return text; // Return original text on error
  }
}
// Function to translate multiple texts concurrently with rate limiting
async function translateTexts(texts) {
  const batchSize = 5; // Process 5 translations at a time to avoid rate limits
  const results = [];
  for(let i = 0; i < texts.length; i += batchSize){
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map((text)=>translateToChineseWithAI(text));
    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((result, index)=>{
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`翻译失败 (索引 ${i + index}):`, result.reason);
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
async function fetchSubredditInfo(subredditName) {
  console.log(`📋 获取 r/${subredditName} 的基本信息...`);
  // Get OAuth access token
  const accessToken = await getRedditAccessToken();
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
async function fetchSubredditHotPosts(subredditName, limit = 10) {
  console.log(`🔥 获取 r/${subredditName} 的热门帖子 (limit: ${limit})...`);
  // Get OAuth access token
  const accessToken = await getRedditAccessToken();
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
  // Translate post titles to Chinese
  console.log(`🌐 开始翻译 ${posts.length} 个帖子标题...`);
  const titles = posts.map((post)=>post.title);
  const translatedTitles = await translateTexts(titles);
  // Add Chinese translations to posts
  const postsWithTranslations = posts.map((post, index)=>({
      ...post,
      title_zh: translatedTitles[index]
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
async function saveSubredditToDatabase(subredditInfo, hotPosts) {
  const supabase = createSupabaseClient();
  // Translate subreddit description to Chinese
  console.log('🌐 翻译subreddit描述...');
  const titleZh = await translateToChineseWithAI(subredditInfo.title || '');
  console.log("翻译后描述" + titleZh);
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
        // Check if data is recent (less than 1 hour old)
        const lastUpdated = new Date(cachedData.last_updated);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (lastUpdated > oneHourAgo) {
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
    const [subredditInfo, hotPosts] = await Promise.all([
      fetchSubredditInfo(cleanSubredditName),
      fetchSubredditHotPosts(cleanSubredditName, limit)
    ]);
    // Translate subreddit description to Chinese
    console.log('🌐 翻译subreddit描述...');
    const titleZh = await translateToChineseWithAI(subredditInfo.title || '');
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
function validateRequest(body) {
  if (!body.subreddits || !Array.isArray(body.subreddits) || body.subreddits.length === 0) {
    throw new Error('subreddits array is required and must contain at least one subreddit name');
  }
  const limit = body.limit || 10;
  if (limit < 1 || limit > 25) {
    throw new Error('Limit must be between 1 and 25');
  }
  const forceRefresh = body.force_refresh === true;
  console.log("raw:" + body.force_refresh + " forceRefresh" + forceRefresh);
  return {
    subreddits: body.subreddits,
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
      version: '2.0.0',
      description: 'Fetch Reddit subreddit data with OAuth',
      status: 'healthy',
      cors: 'enabled',
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
    let body;
    try {
      const textBody = await req.text();
      console.log('📝 原始请求体长度:', textBody.length);
      console.log('📝 原始请求体内容:', textBody.substring(0, 200) + (textBody.length > 200 ? '...' : ''));
      if (!textBody.trim()) {
        throw new Error('Request body is empty');
      }
      body = JSON.parse(textBody);
      console.log('✅ 请求体解析成功:', {
        subreddits: body.subreddits,
        limit: body.limit,
        force_refresh: body.force_refresh,
        keys: Object.keys(body)
      });
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
      const { subreddits, limit, forceRefresh } = validateRequest(body);
      console.log('✅ 请求参数验证通过:', {
        subreddits,
        limit,
        forceRefresh
      });
      // Process all subreddits
      const results = {};
      console.log(`🔄 并行处理 ${subreddits.length} 个subreddits...`);
      const promises = subreddits.map(async (subreddit)=>{
        try {
          const data = await processSubreddit(subreddit, limit, forceRefresh);
          results[subreddit] = data;
          console.log(`✅ r/${subreddit} 处理完成 (${data.source})`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          results[subreddit] = {
            error: errorMessage
          };
          console.error(`❌ r/${subreddit} 处理失败:`, errorMessage);
        }
      });
      await Promise.allSettled(promises);
      console.log('🎉 所有subreddits处理完成');
      // Fix TypeScript errors by properly typing the results
      const successCount = Object.values(results).filter((result)=>!result.error).length;
      const errorCount = Object.values(results).filter((result)=>result.error).length;
      console.log('📊 处理结果统计:', {
        总数: subreddits.length,
        成功: successCount,
        失败: errorCount,
        成功率: `${(successCount / subreddits.length * 100).toFixed(1)}%`
      });
      const response = {
        success: true,
        data: results,
        meta: {
          limit,
          force_refresh: forceRefresh,
          subreddits_requested: subreddits.length,
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
