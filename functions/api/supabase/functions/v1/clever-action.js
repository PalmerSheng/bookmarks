export async function onRequestPost(context) {
  const { request } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // 获取请求体
    const requestBody = await request.json();
    
    // Supabase Edge Function URL
    const supabaseUrl = 'https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action';
    
    // 从原始请求中获取 Authorization header
    const authHeader = request.headers.get('Authorization');
    
    // 构建代理请求
    const proxyRequest = new Request(supabaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2RpY3pxb3VpbGxodm92b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTM2NTUsImV4cCI6MjA2NjQ2OTY1NX0.-ejxki8XiXECuGVOVVi9d5WgyHVefy0nxbu4qftMsLw',
        'User-Agent': 'Cloudflare-Pages-Proxy/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔄 Proxying request to Supabase:', {
      url: supabaseUrl,
      method: 'POST',
      subreddits: requestBody.subreddits,
      limit: requestBody.limit
    });

    // 发送请求到 Supabase
    const response = await fetch(proxyRequest);
    
    console.log('📥 Supabase response:', {
      status: response.status,
      statusText: response.statusText
    });

    // 获取响应数据
    const responseData = await response.text();
    
    // 构建响应头，包含 CORS 头
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
    };

    // 如果 Supabase 返回错误状态，仍然要返回带 CORS 头的响应
    if (!response.ok) {
      console.error('❌ Supabase error:', response.status, responseData);
      
      // 尝试解析错误响应
      let errorData;
      try {
        errorData = JSON.parse(responseData);
      } catch {
        errorData = { 
          success: false, 
          message: `Supabase request failed: ${response.status} ${response.statusText}`,
          details: responseData
        };
      }
      
      return new Response(JSON.stringify(errorData), {
        status: 200, // 返回 200 以避免前端的网络错误，在响应体中包含错误信息
        headers: responseHeaders
      });
    }

    console.log('✅ Successfully proxied request');

    // 返回成功响应
    return new Response(responseData, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // 返回错误响应，确保包含 CORS 头
    const errorResponse = {
      success: false,
      message: 'Proxy request failed',
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // 返回 200 以避免前端的网络错误
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  }
}

// 处理其他 HTTP 方法
export async function onRequest(context) {
  const { request } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'POST') {
    return onRequestPost(context);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  // 不支持的方法
  return new Response(JSON.stringify({
    success: false,
    message: 'Method not allowed. Only POST requests are supported.'
  }), {
    status: 405,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    }
  });
} 