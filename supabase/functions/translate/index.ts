import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Google Translate function
async function translateWithGoogle(text: string, targetLang: string = 'zh-CN'): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=${targetLang}&q=${encodedText}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result && Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const translatedText = result[0][0][0] || text;
      return translatedText;
    } else {
      throw new Error('Invalid response format from Google Translate');
    }
  } catch (error) {
    console.error('Google Translate error:', error);
    throw error;
  }
}

// Cloudflare AI translation function
async function translateWithCloudflareAI(text: string, targetLang: string = 'Chinese'): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }
  
  const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
  
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials');
  }
  
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`;
    
    const systemPrompt = `You are a friendly translator assistant. Only return the translated message in ${targetLang}. Do not include any explanations or additional text.`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0.0'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Cloudflare AI API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.result && result.result.response) {
      return result.result.response.trim();
    } else {
      throw new Error('Invalid response format from Cloudflare AI');
    }
  } catch (error) {
    console.error('Cloudflare AI error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLang = 'zh-CN', method = 'google' } = await req.json()
    
    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    let translatedText: string;
    let translationMethod: string;
    
    if (method === 'ai' || method === 'cloudflare') {
      // Use Cloudflare AI translation
      translationMethod = 'Cloudflare AI';
      const aiTargetLang = targetLang === 'zh-CN' ? 'Chinese' : 
                          targetLang === 'en' ? 'English' : 
                          targetLang === 'ja' ? 'Japanese' : 
                          targetLang === 'ko' ? 'Korean' : 
                          targetLang === 'fr' ? 'French' : 
                          targetLang === 'de' ? 'German' : 
                          targetLang === 'es' ? 'Spanish' : 'Chinese';
      
      translatedText = await translateWithCloudflareAI(text, aiTargetLang);
    } else {
      // Use Google Translate (default)
      translationMethod = 'Google Translate';
      translatedText = await translateWithGoogle(text, targetLang);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        originalText: text,
        translatedText,
        targetLang,
        method: translationMethod,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Translation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Translation failed',
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 