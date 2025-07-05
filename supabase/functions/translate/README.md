# Translation Edge Function

This Supabase Edge Function provides translation services using both Google Translate and Cloudflare AI.

## Features

- **Google Translate**: Free translation service using Google's unofficial API
- **Cloudflare AI**: AI-powered translation using Cloudflare's LLaMA 3 model
- **Multiple Languages**: Support for Chinese, English, Japanese, Korean, French, German, Spanish, and Russian
- **Auto Language Detection**: Automatically detect source language (Google Translate only)
- **CORS Support**: Ready for web applications

## API Usage

### Endpoint
```
POST https://your-project.supabase.co/functions/v1/translate
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

### Request Body
```json
{
  "text": "Hello, world!",
  "targetLang": "zh-CN",
  "method": "google"
}
```

### Parameters
- `text` (required): Text to translate
- `targetLang` (optional): Target language code (default: "zh-CN")
- `method` (optional): Translation method - "google" or "ai" (default: "google")

### Response
```json
{
  "success": true,
  "originalText": "Hello, world!",
  "translatedText": "你好，世界！",
  "targetLang": "zh-CN",
  "method": "Google Translate",
  "timestamp": "2025-01-05T01:12:00.000Z"
}
```

## Deployment

### 1. Prerequisites
- Supabase CLI installed
- Supabase project created

### 2. Environment Variables (for Cloudflare AI)
Set these in your Supabase project dashboard under Settings > Edge Functions:

```bash
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### 3. Deploy the Function
```bash
# Navigate to your project root
cd /path/to/your/project

# Deploy the function
supabase functions deploy translate --project-ref YOUR_PROJECT_REF
```

### 4. Test the Function
```bash
# Test Google Translate
curl -X POST 'https://your-project.supabase.co/functions/v1/translate' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello, world!",
    "targetLang": "zh-CN",
    "method": "google"
  }'

# Test Cloudflare AI
curl -X POST 'https://your-project.supabase.co/functions/v1/translate' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello, world!",
    "targetLang": "zh-CN",
    "method": "ai"
  }'
```

## Supported Languages

### Google Translate
- `auto`: Auto-detect (source language only)
- `en`: English
- `zh-CN`: Chinese (Simplified)
- `ja`: Japanese
- `ko`: Korean
- `fr`: French
- `de`: German
- `es`: Spanish
- `ru`: Russian

### Cloudflare AI
The AI model accepts language names in English:
- `Chinese`
- `English`
- `Japanese`
- `Korean`
- `French`
- `German`
- `Spanish`

## Error Handling

The function returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing text)
- `500`: Internal server error

Error response format:
```json
{
  "error": "Error message",
  "success": false,
  "timestamp": "2025-01-05T01:12:00.000Z"
}
```

## Rate Limiting

- **Google Translate**: No official rate limits, but use responsibly
- **Cloudflare AI**: Subject to Cloudflare's rate limits and pricing

## Security Notes

1. Never expose your Cloudflare API token in client-side code
2. Use environment variables for sensitive credentials
3. Consider implementing additional rate limiting for production use
4. Monitor usage to avoid unexpected costs

## Troubleshooting

### Common Issues

1. **"Missing Cloudflare credentials"**
   - Ensure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are set in Supabase

2. **"Translation failed"**
   - Check network connectivity
   - Verify API credentials
   - Check if the target language is supported

3. **CORS errors**
   - Ensure you're using the correct headers
   - Check if your domain is allowed in Supabase settings

### Debug Mode
Enable debug logging by checking the Supabase Edge Function logs in your dashboard. 