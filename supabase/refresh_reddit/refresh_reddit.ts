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

// Type definitions for batch processing results
interface BatchResult {
  batch_number: number;
  subreddits: string[];
  success: boolean;
  data?: any;
  error?: string;
  duration_ms: number;
}

// Initialize Supabase client
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

// Function to get all subreddits from database
async function getAllSubredditsFromDatabase(): Promise<string[]> {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('subreddit_top')
      .select('subreddit')
      .order('subreddit');
    
    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No subreddits found in database');
      return [];
    }
    
    const subreddits = data.map((item: any) => item.subreddit);
    console.log(`📊 Found ${subreddits.length} subreddits in database: [${subreddits.join(', ')}]`);
    
    return subreddits;
  } catch (error) {
    console.error('❌ Error fetching subreddits from database:', error);
    throw error;
  }
}

// Function to call clever-action endpoint
async function callCleverAction(subreddits: string[], forceRefresh: boolean = true): Promise<any> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  
  // Construct the clever-action endpoint URL
  const cleverActionUrl = `${supabaseUrl}/functions/v1/clever-action`;
  
  const requestBody = {
    subreddits: subreddits,
    limit: 10,
    force_refresh: forceRefresh
  };
  
  console.log(`🚀 Calling clever-action endpoint with ${subreddits.length} subreddits`);
  console.log(`📝 Request payload:`, JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(cleverActionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'User-Agent': 'supabase-refresh-reddit/1.0.0'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Clever-action API error: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log(`✅ Clever-action API call successful`);
    
    return responseData;
  } catch (error) {
    console.error('❌ Error calling clever-action API:', error);
    throw error;
  }
}

// Enhanced CORS headers for full cross-origin support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
  console.log(`🚀 Refresh Reddit request started at ${new Date().toISOString()}`);
  
  // Handle CORS preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return createCorsResponse(null, 204);
  }
  
  try {
    // Parse request body (optional parameters)
    let body: any = {};
    if (req.method === 'POST') {
      try {
        const textBody = await req.text();
        if (textBody.trim()) {
          body = JSON.parse(textBody);
        }
      } catch (parseError) {
        console.log('⚠️ Invalid JSON in request body, using defaults');
      }
    }
    
    // Extract parameters with defaults
    const forceRefresh = body.force_refresh !== undefined ? body.force_refresh : true;
    const batchSize = body.batch_size || 50; // Process subreddits in batches
    
    console.log(`📋 Configuration: force_refresh=${forceRefresh}, batch_size=${batchSize}`);
    
    // Step 1: Get all subreddits from database
    const dbQueryStartTime = Date.now();
    const allSubreddits = await getAllSubredditsFromDatabase();
    const dbQueryEndTime = Date.now();
    console.log(`🗄️ Database query completed in ${dbQueryEndTime - dbQueryStartTime}ms`);
    
    if (allSubreddits.length === 0) {
      const response = {
        success: true,
        message: 'No subreddits found in database to refresh',
        data: {
          subreddits_processed: 0,
          results: []
        },
        meta: {
          total_duration_ms: Date.now() - requestStartTime,
          timestamp: new Date().toISOString()
        }
      };
      return createCorsResponse(response);
    }
    
    // Step 2: Process subreddits in batches to avoid overwhelming the API
    const processingStartTime = Date.now();
    const results: BatchResult[] = [];
    let processedCount = 0;
    
    for (let i = 0; i < allSubreddits.length; i += batchSize) {
      const batch = allSubreddits.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allSubreddits.length / batchSize);
      
      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} with ${batch.length} subreddits`);
      
      try {
        const batchStartTime = Date.now();
        const batchResult = await callCleverAction(batch, forceRefresh);
        const batchEndTime = Date.now();
        
        console.log(`✅ Batch ${batchNumber} completed in ${batchEndTime - batchStartTime}ms`);
        
        results.push({
          batch_number: batchNumber,
          subreddits: batch,
          success: true,
          data: batchResult,
          duration_ms: batchEndTime - batchStartTime
        });
        
        processedCount += batch.length;
        
        // Add a small delay between batches to be respectful to the API
        if (i + batchSize < allSubreddits.length) {
          console.log('⏳ Waiting 1 second before next batch...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error);
        results.push({
          batch_number: batchNumber,
          subreddits: batch,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: 0
        });
      }
    }
    
    const processingEndTime = Date.now();
    const totalDuration = processingEndTime - requestStartTime;
    
    // Calculate statistics
    const successfulBatches = results.filter(r => r.success).length;
    const failedBatches = results.filter(r => !r.success).length;
    const totalSubreddits = allSubreddits.length;
    
    console.log(`🏁 Refresh completed: ${successfulBatches}/${results.length} batches successful, ${totalSubreddits} subreddits processed in ${totalDuration}ms`);
    
    const response = {
      success: true,
      message: `Refresh completed for ${totalSubreddits} subreddits`,
      data: {
        subreddits_total: totalSubreddits,
        subreddits_processed: processedCount,
        batches_successful: successfulBatches,
        batches_failed: failedBatches,
        results: results
      },
      meta: {
        force_refresh: forceRefresh,
        batch_size: batchSize,
        total_duration_ms: totalDuration,
        database_query_ms: dbQueryEndTime - dbQueryStartTime,
        processing_ms: processingEndTime - processingStartTime,
        timestamp: new Date().toISOString(),
        cors_enabled: true
      }
    };
    
    return createCorsResponse(response);
    
  } catch (error) {
    const totalRequestTime = Date.now() - requestStartTime;
    console.error(`💥 Refresh Reddit request failed after ${totalRequestTime}ms:`, error);
    
    const errorResponse = {
      success: false,
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
