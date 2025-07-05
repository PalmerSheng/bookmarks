// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
// Function to translate text using Google Translate API
async function translateToChineseWithGoogle(text) {
  if (!text || text.trim() === '') {
    return '';
  }
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=zh-CN&q=${encodedText}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      return text;
    }
    const result = await response.json();
    if (result && Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const translatedText = result[0][0][0] || text;
      return translatedText;
    } else {
      return text;
    }
  } catch (error) {
    return text;
  }
}
// Function to translate multiple texts using Google Translate API
async function translateTextsBatchGoogle(texts) {
  if (!texts || texts.length === 0) {
    return [];
  }
  try {
    const batchSize = 3;
    const results = [];
    for(let i = 0; i < texts.length; i += batchSize){
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map((text)=>translateToChineseWithGoogle(text));
      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result, index)=>{
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push(batch[index]);
        }
      });
      if (i + batchSize < texts.length) {
        await new Promise((resolve)=>setTimeout(resolve, 500));
      }
    }
    return results;
  } catch (error) {
    const results = [];
    for (const text of texts){
      const translated = await translateToChineseWithGoogle(text);
      results.push(translated);
      await new Promise((resolve)=>setTimeout(resolve, 200));
    }
    return results;
  }
}
// Legacy AI translation function (kept as fallback)
async function translateToChineseWithAI(text) {
  if (!text || text.trim() === '') {
    return '';
  }
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  if (!cfAccountId || !cfApiToken) {
    return text;
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
      return text;
    }
    const result = await response.json();
    const translatedText = result.result?.response || text;
    return translatedText;
  } catch (error) {
    return text;
  }
}
// Initialize Supabase client once
let supabaseClient = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}
// Function to get Reddit OAuth access token
async function getRedditAccessToken() {
  const appId = Deno.env.get('REDDIT_APP_ID');
  const appSecret = Deno.env.get('REDDIT_APP_SECRET');
  if (!appId || !appSecret) {
    throw new Error('Reddit app credentials not found. Please set REDDIT_APP_ID and REDDIT_APP_SECRET environment variables.');
  }
  const credentials = btoa(`${appId}:${appSecret}`);
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'supabase-reddit-api:v2.2.0 (by /u/supabase_user)'
    },
    body: 'grant_type=client_credentials'
  });
  if (!response.ok) {
    const errorText = await response.text().catch(()=>'Unknown error');
    throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const tokenData = await response.json();
  return tokenData.access_token;
}
// Function to fetch subreddit info with OAuth
async function fetchSubredditInfo(subredditName, accessToken) {
  const url = `https://oauth.reddit.com/r/${subredditName}/about`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.2.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
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
  const url = `https://oauth.reddit.com/r/${subredditName}/hot?limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.2.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(()=>'Unknown error');
    throw new Error(`Failed to fetch hot posts: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const data = await response.json();
  if (!data.data || !data.data.children) {
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
  const titles = posts.map((post)=>post.title);
  let translatedTitles = [];
  try {
    translatedTitles = await translateTextsBatchGoogle(titles);
  } catch (error) {
    translatedTitles = titles; // Fallback to original titles
  }
  // Add Chinese translations to posts
  const postsWithTranslations = posts.map((post, index)=>({
      ...post,
      title_zh: translatedTitles[index] || post.title
    }));
  return postsWithTranslations;
}
// Optimized database functions - fetch all data in single queries
async function getAllSubredditsFromDatabase(subredditNames) {
  const supabase = getSupabaseClient();
  const lowerCaseNames = subredditNames.map((name)=>name.toLowerCase());
  const { data, error } = await supabase.from('subreddit_top').select('*').in('subreddit', lowerCaseNames);
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database query error: ${error.message}`);
  }
  // Convert array to map for O(1) lookup
  const cachedData = {};
  if (data) {
    data.forEach((item)=>{
      cachedData[item.subreddit] = item;
    });
  }
  return cachedData;
}
// Function to get default subreddits from sys_config table - single query
async function getDefaultSubreddits() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('sys_config').select('data').eq('biz_code', 'reddit_default_subreddits').single();
  if (error) {
    return [
      'saas',
      'technology'
    ];
  }
  if (!data || !data.data) {
    return [
      'saas',
      'technology'
    ];
  }
  try {
    let configData;
    if (typeof data.data === 'string') {
      configData = JSON.parse(data.data);
    } else {
      configData = data.data;
    }
    if (!configData || !configData.subreddits || !Array.isArray(configData.subreddits)) {
      return [
        'saas',
        'technology'
      ];
    }
    return configData.subreddits;
  } catch (parseError) {
    return [
      'saas',
      'technology'
    ];
  }
}
async function saveSubredditToDatabase(subredditInfo, hotPosts) {
  const supabase = getSupabaseClient();
  // Translate subreddit title
  let titleZh = '';
  try {
    titleZh = await translateToChineseWithGoogle(subredditInfo.title || '');
  } catch (error) {
    titleZh = await translateToChineseWithAI(subredditInfo.title || '');
  }
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
}
// Check if we need fresh data for any subreddit
function needsFreshData(subredditNames, cachedData, forceRefresh) {
  if (forceRefresh) return true;
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  for (const name of subredditNames){
    const cleanName = name.trim().toLowerCase();
    const cached = cachedData[cleanName];
    if (!cached) return true;
    const lastUpdated = new Date(cached.last_updated);
    if (lastUpdated <= twelveHoursAgo) return true;
  }
  return false;
}
// Main processing function for a single subreddit
async function processSubreddit(subredditName, limit, forceRefresh, cachedData, accessToken) {
  const cleanSubredditName = subredditName.trim().toLowerCase();
  try {
    // Check if we should use cached data
    if (!forceRefresh && cachedData[cleanSubredditName]) {
      const cached = cachedData[cleanSubredditName];
      const lastUpdated = new Date(cached.last_updated);
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      if (lastUpdated > twelveHoursAgo) {
        return {
          ...cached,
          source: 'cache'
        };
      }
    }
    // We need fresh data but don't have access token
    if (!accessToken) {
      throw new Error('Access token required for fetching fresh data');
    }
    // Fetch fresh data from Reddit
    const [subredditInfo, hotPosts] = await Promise.all([
      fetchSubredditInfo(cleanSubredditName, accessToken),
      fetchSubredditHotPosts(cleanSubredditName, limit, accessToken)
    ]);
    // Translate subreddit title
    let titleZh = '';
    if (subredditInfo.title) {
      try {
        titleZh = await translateToChineseWithGoogle(subredditInfo.title);
      } catch (error) {
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
async function validateRequest(body) {
  let subreddits = body.subreddits;
  // Check if subreddits is empty, null, undefined, or not an array
  if (!subreddits || !Array.isArray(subreddits) || subreddits.length === 0) {
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
  return {
    subreddits: subreddits,
    limit,
    forceRefresh
  };
}
// Enhanced CORS headers for full cross-origin support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  const requestStartTime = Date.now();
  console.log(`🚀 Request started at ${new Date().toISOString()}`);
  // Handle CORS preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return createCorsResponse(null, 204);
  }
  try {
    // Only allow POST requests for main functionality
    if (req.method !== 'POST') {
      return createCorsResponse({
        error: 'Method not allowed',
        message: 'Only POST requests are supported.',
        allowed_methods: [
          'POST',
          'OPTIONS'
        ]
      }, 405);
    }
    // Parse request body
    const parseStartTime = Date.now();
    let body = {};
    try {
      const textBody = await req.text();
      if (textBody.trim()) {
        body = JSON.parse(textBody);
      }
    } catch (parseError) {
      return createCorsResponse({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, 400);
    }
    const parseEndTime = Date.now();
    console.log(`📝 Request body parsed in ${parseEndTime - parseStartTime}ms`);
    // Validate input and get configuration
    const validateStartTime = Date.now();
    const { subreddits, limit, forceRefresh } = await validateRequest(body);
    const validateEndTime = Date.now();
    console.log(`✅ Request validation completed in ${validateEndTime - validateStartTime}ms`);
    console.log(`📊 Processing ${subreddits.length} subreddits: [${subreddits.join(', ')}]`);
    // Single database query to get all cached data
    const dbQueryStartTime = Date.now();
    const cachedData = await getAllSubredditsFromDatabase(subreddits);
    const dbQueryEndTime = Date.now();
    console.log(`🗄️ Database query completed in ${dbQueryEndTime - dbQueryStartTime}ms`);
    // Only get Reddit access token if we need fresh data
    let accessToken;
    const tokenStartTime = Date.now();
    let tokenEndTime = tokenStartTime;
    if (needsFreshData(subreddits, cachedData, forceRefresh)) {
      accessToken = await getRedditAccessToken();
      tokenEndTime = Date.now();
      console.log(`🔑 Reddit access token obtained in ${tokenEndTime - tokenStartTime}ms`);
    } else {
      console.log(`💾 Using cached data, skipping token retrieval`);
    }
    // Process all subreddits with optimized parallel processing
    const processingStartTime = Date.now();
    console.log(`⚡ Starting parallel processing of subreddits...`);
    const promises = subreddits.map(async (subreddit)=>{
      const subredditStartTime = Date.now();
      try {
        const data = await processSubreddit(subreddit, limit, forceRefresh, cachedData, accessToken);
        const subredditEndTime = Date.now();
        console.log(`✨ r/${subreddit} processed in ${subredditEndTime - subredditStartTime}ms (source: ${data.source || 'unknown'})`);
        return {
          subreddit,
          data,
          success: true
        };
      } catch (error) {
        const subredditEndTime = Date.now();
        console.log(`❌ r/${subreddit} failed in ${subredditEndTime - subredditStartTime}ms: ${error instanceof Error ? error.message : 'Unknown error'}`);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          subreddit,
          data: {
            error: errorMessage
          },
          success: false
        };
      }
    });
    const results = await Promise.allSettled(promises);
    const processingEndTime = Date.now();
    console.log(`🔄 All subreddits processed in ${processingEndTime - processingStartTime}ms`);
    // Process results
    const resultsProcessingStartTime = Date.now();
    const orderedResults = results.map((result, index)=>{
      const subreddit = subreddits[index];
      if (result.status === 'fulfilled') {
        return {
          subreddit,
          data: result.value.data
        };
      } else {
        return {
          subreddit,
          data: {
            error: 'Promise rejected'
          }
        };
      }
    });
    const resultsProcessingEndTime = Date.now();
    console.log(`📋 Results processed in ${resultsProcessingEndTime - resultsProcessingStartTime}ms`);
    const totalRequestTime = Date.now() - requestStartTime;
    console.log(`🏁 Total request completed in ${totalRequestTime}ms`);
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
        cors_enabled: true,
        timing: {
          total_duration_ms: totalRequestTime,
          stages: {
            request_parsing_ms: parseEndTime - parseStartTime,
            validation_ms: validateEndTime - validateStartTime,
            database_query_ms: dbQueryEndTime - dbQueryStartTime,
            token_retrieval_ms: tokenEndTime - tokenStartTime,
            subreddit_processing_ms: processingEndTime - processingStartTime,
            results_processing_ms: resultsProcessingEndTime - resultsProcessingStartTime
          }
        }
      }
    };
    return createCorsResponse(response);
  } catch (error) {
    const totalRequestTime = Date.now() - requestStartTime;
    console.log(`💥 Request failed after ${totalRequestTime}ms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const errorResponse = {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      cors_enabled: true,
      timing: {
        total_duration_ms: totalRequestTime
      }
    };
    return createCorsResponse(errorResponse, 500);
  }
});
