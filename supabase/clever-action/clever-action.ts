// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Type declarations for Deno runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

// Function to translate text using Cloudflare AI
async function translateToChineseWithAI(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  if (!cfAccountId || !cfApiToken) {
    return text;
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  try {
    console.log("翻译内容：" + JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate the given English text into Simplified Chinese. Only return the translated text in Simplified Chinese without any additional explanations, formatting, or quotation marks."
          },
          {
            role: "user",
            content: text
          }
        ]
      }))
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
            content: "You are a professional translator. Translate the given English text into Simplified Chinese. Only return the translated text in Simplified Chinese without any additional explanations, formatting, or quotation marks."
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
    return translatedText.trim();
  } catch (error) {
    return text;
  }
}

// Optimized function to translate all texts for a subreddit in one API call
async function translateSubredditTextsInBatch(subredditTitle: string, postTitles: string[]): Promise<{
  subredditTitleZh: string;
  postTitlesZh: string[];
}> {
  // If no text to translate, return originals
  if (!subredditTitle && (!postTitles || postTitles.length === 0)) {
    return {
      subredditTitleZh: subredditTitle || '',
      postTitlesZh: postTitles || []
    };
  }

  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
  
  if (!cfAccountId || !cfApiToken) {
    return {
      subredditTitleZh: subredditTitle || '',
      postTitlesZh: postTitles || []
    };
  }

  try {
    // Combine all texts into one batch with separators
    const allTexts: string[] = [];
    let subredditIndex = -1;
    let postStartIndex = -1;

    if (subredditTitle && subredditTitle.trim()) {
      subredditIndex = allTexts.length;
      allTexts.push(subredditTitle.trim());
    }

    if (postTitles && postTitles.length > 0) {
      postStartIndex = allTexts.length;
      allTexts.push(...postTitles.filter(title => title && title.trim()));
    }

    // If no texts to translate, return originals
    if (allTexts.length === 0) {
      return {
        subredditTitleZh: subredditTitle || '',
        postTitlesZh: postTitles || []
      };
    }

    // Create a single prompt with numbered items for batch translation
    const batchText = allTexts.map((text, index) => `${index + 1}. ${text}`).join('\n');
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    
    
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
            content: "You are a professional translator. Translate the given numbered English texts into Simplified Chinese. Return the translated texts in the same numbered format, with each translation on a separate line. Only return the numbered translations without any additional explanations or formatting."
          },
          {
            role: "user",
            content: batchText
          }
        ]
      })
    });

    if (!response.ok) {
      console.log(`翻译API调用失败: ${response.status}`);
      return {
        subredditTitleZh: subredditTitle || '',
        postTitlesZh: postTitles || []
      };
    }

    const result = await response.json();
    const translatedText = result.result?.response || '';
    
    // Parse the numbered translations
    const translatedLines = translatedText.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        // Remove numbering (e.g., "1. " or "1." or "1 ")
        return line.replace(/^\d+\.?\s*/, '').trim();
      });

    // Extract results based on original indices
    let subredditTitleZh = subredditTitle || '';
    let postTitlesZh = postTitles || [];

    if (subredditIndex >= 0 && translatedLines[subredditIndex]) {
      subredditTitleZh = translatedLines[subredditIndex];
    }

    if (postStartIndex >= 0) {
      const translatedPosts = translatedLines.slice(postStartIndex, postStartIndex + (postTitles?.length || 0));
      postTitlesZh = postTitles?.map((originalTitle, index) => {
        return translatedPosts[index] || originalTitle;
      }) || [];
    }

    console.log(`批量翻译完成: subreddit标题${subredditIndex >= 0 ? '已翻译' : '跳过'}, ${postTitlesZh.length}个帖子标题已翻译`);

    return {
      subredditTitleZh,
      postTitlesZh
    };

  } catch (error) {
    console.log(`批量翻译失败: ${error}`);
    return {
      subredditTitleZh: subredditTitle || '',
      postTitlesZh: postTitles || []
    };
  }
}

// Initialize Supabase client once
let supabaseClient: any = null;
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
async function getRedditAccessToken(): Promise<string> {
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
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const tokenData = await response.json();
  return tokenData.access_token;
}
// Function to fetch subreddit info with OAuth
async function fetchSubredditInfo(subredditName: string, accessToken: string) {
  const url = `https://oauth.reddit.com/r/${subredditName}/about`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.2.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
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
// Function to fetch hot posts from subreddit with OAuth (removed translation logic)
async function fetchSubredditHotPosts(subredditName: string, limit = 10, accessToken: string) {
  const url = `https://oauth.reddit.com/r/${subredditName}/hot?limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'supabase-reddit-api:v2.2.0 (by /u/supabase_user)',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch hot posts: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }
  const data = await response.json();
  if (!data.data || !data.data.children) {
    return [];
  }
  
  // Return posts without translations - translations will be handled in batch
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

  return posts;
}
// Optimized database functions - fetch all data in single queries
async function getAllSubredditsFromDatabase(subredditNames: string[]) {
  const supabase = getSupabaseClient();
  const lowerCaseNames = subredditNames.map((name) => name.toLowerCase());
  const { data, error } = await supabase.from('subreddit_top').select('*').in('subreddit', lowerCaseNames);
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database query error: ${error.message}`);
  }
  // Convert array to map for O(1) lookup
  const cachedData: any = {};
  if (data) {
    data.forEach((item: any) => {
      cachedData[item.subreddit] = item;
    });
  }
  return cachedData;
}
// Function to get default subreddits from sys_config table - single query
async function getDefaultSubreddits(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('sys_config').select('data').eq('biz_code', 'reddit_default_subreddits').single();
  if (error) {
    return ['saas', 'technology'];
  }
  if (!data || !data.data) {
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
      return ['saas', 'technology'];
    }
    return configData.subreddits;
  } catch (parseError) {
    return ['saas', 'technology'];
  }
}
// Modified save function to accept pre-translated data
async function saveSubredditToDatabase(subredditInfo: any, hotPosts: any[], titleZh: string) {
  const supabase = getSupabaseClient();
  
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
function needsFreshData(subredditNames: string[], cachedData: any, forceRefresh: boolean): boolean {
  if (forceRefresh) return true;
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  for (const name of subredditNames) {
    const cleanName = name.trim().toLowerCase();
    const cached = cachedData[cleanName];
    if (!cached) return true;
    const lastUpdated = new Date(cached.last_updated);
    if (lastUpdated <= twelveHoursAgo) return true;
  }
  return false;
}
// Optimized main processing function for a single subreddit
async function processSubreddit(subredditName: string, limit: number, forceRefresh: boolean, cachedData: any, accessToken?: string) {
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
    
    const translationStartTime = Date.now();
    
    // Fetch fresh data from Reddit (without individual translations)
    const [subredditInfo, hotPosts] = await Promise.all([
      fetchSubredditInfo(cleanSubredditName, accessToken),
      fetchSubredditHotPosts(cleanSubredditName, limit, accessToken)
    ]);

    // Extract all texts that need translation
    const subredditTitle = subredditInfo.title || '';
    const postTitles = hotPosts.map((post: any) => post.title);

    // Perform single batch translation for this subreddit
    const { subredditTitleZh, postTitlesZh } = await translateSubredditTextsInBatch(subredditTitle, postTitles);
    
    const translationEndTime = Date.now();
    console.log(`🌐 r/${cleanSubredditName} 批量翻译完成，耗时 ${translationEndTime - translationStartTime}ms`);

    // Add Chinese translations to posts
    const postsWithTranslations = hotPosts.map((post: any, index: number) => ({
      ...post,
      title_zh: postTitlesZh[index] || post.title
    }));

    // Save to database with translated title
    await saveSubredditToDatabase(subredditInfo, postsWithTranslations, subredditTitleZh);

    return {
      ...subredditInfo,
      title_zh: subredditTitleZh,
      hot_posts: postsWithTranslations,
      last_updated: new Date().toISOString(),
      source: 'fresh'
    };
  } catch (error) {
    throw new Error(`Failed to process r/${cleanSubredditName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
// Request validation
async function validateRequest(body: any) {
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
function createCorsResponse(data: any, status = 200) {
  return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}
// Main handler
Deno.serve(async (req) => {
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
        allowed_methods: ['POST', 'OPTIONS']
      }, 405);
    }
    // Parse request body
    const parseStartTime = Date.now();
    let body: any = {};
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
    const promises = subreddits.map(async (subreddit: string) => {
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
          data: { error: errorMessage },
          success: false
        };
      }
    });
    const results = await Promise.allSettled(promises);
    const processingEndTime = Date.now();
    console.log(`🔄 All subreddits processed in ${processingEndTime - processingStartTime}ms`);
    // Process results
    const resultsProcessingStartTime = Date.now();
    const orderedResults = results.map((result, index) => {
      const subreddit = subreddits[index];
      if (result.status === 'fulfilled') {
        return {
          subreddit,
          data: result.value.data
        };
      } else {
        return {
          subreddit,
          data: { error: 'Promise rejected' }
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
