# Reddit Subreddit Data Fetcher with AI Translation

This project provides a Supabase Edge Function that fetches Reddit subreddit data using OAuth authentication and translates content to Chinese using Cloudflare AI.

## Features

- 🔐 **OAuth Authentication**: Secure Reddit API access using OAuth 2.0
- 🌐 **AI Translation**: Automatic translation of descriptions and post titles to Chinese
- 💾 **Database Caching**: Intelligent caching with 1-hour refresh intervals
- 🚀 **Parallel Processing**: Concurrent processing of multiple subreddits
- 🔄 **CORS Support**: Full cross-origin resource sharing support
- 📊 **Rate Limiting**: Built-in rate limiting for API requests

## Database Schema

The `subreddit_data` table includes the following fields:

```sql
CREATE TABLE public.subreddit_data (
    id text NOT NULL,
    subreddit text NOT NULL,
    display_name text NULL,
    title text NULL,
    description text NULL,
    description_zh text NULL,  -- Chinese translation
    subscribers integer NULL DEFAULT 0,
    active_users integer NULL DEFAULT 0,
    created_utc bigint NULL,
    subreddit_type text NULL,
    public_description text NULL,
    icon_img text NULL,
    banner_img text NULL,
    hot_posts jsonb NULL,      -- Includes title_zh for each post
    last_updated timestamp with time zone NULL DEFAULT now(),
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT subreddit_data_pkey PRIMARY KEY (subreddit)
);
```

## Environment Variables

Set up the following environment variables in your Supabase project:

### Reddit API Credentials
```bash
REDDIT_APP_ID=your_reddit_app_id
REDDIT_APP_SECRET=your_reddit_app_secret
```

### Cloudflare AI API Credentials
```bash
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### Supabase Credentials (automatically provided)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Usage

### POST Request

```bash
curl -X POST https://your-project.supabase.co/functions/v1/clever-action \
  -H "Content-Type: application/json" \
  -d '{
    "subreddits": ["programming", "MachineLearning", "webdev"],
    "limit": 10,
    "force_refresh": false
  }'
```

### Request Parameters

- `subreddits` (required): Array of subreddit names to fetch
- `limit` (optional): Number of hot posts to fetch per subreddit (1-25, default: 10)
- `force_refresh` (optional): Force refresh data ignoring cache (default: false)

### Response Format

```json
{
  "success": true,
  "data": {
    "programming": {
      "subreddit": "programming",
      "display_name": "programming",
      "title": "Computer Programming",
      "description": "Computer Programming",
      "description_zh": "计算机编程",
      "subscribers": 4500000,
      "active_users": 8500,
      "hot_posts": [
        {
          "id": "abc123",
          "title": "Best practices for clean code",
          "title_zh": "干净代码的最佳实践",
          "url": "https://example.com",
          "score": 1500,
          "author": "developer",
          "content": "...",
          "created": 1634567890000,
          "subreddit": "programming",
          "comment_count": 250,
          "upvote_ratio": 0.95,
          "permalink": "https://reddit.com/r/programming/comments/..."
        }
      ],
      "last_updated": "2024-01-01T12:00:00.000Z",
      "source": "fresh"
    }
  },
  "meta": {
    "limit": 10,
    "force_refresh": false,
    "subreddits_requested": 1,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "cors_enabled": true
  }
}
```

## Translation Features

### Subreddit Description Translation
- Automatically translates subreddit descriptions to Chinese
- Stored in the `description_zh` field
- Uses Cloudflare AI's Llama-3-8b-instruct model

### Post Title Translation
- Translates hot post titles to Chinese
- Stored as `title_zh` within the `hot_posts` JSON array
- Batch processing with rate limiting (5 concurrent translations)

### Translation Configuration
- **Model**: `@cf/meta/llama-3-8b-instruct`
- **Rate Limiting**: 5 concurrent translations per batch
- **Delay**: 1 second between batches
- **Fallback**: Returns original text if translation fails

## Caching Strategy

- **Cache Duration**: 1 hour per subreddit
- **Cache Key**: Subreddit name (lowercase)
- **Force Refresh**: Use `force_refresh: true` to bypass cache
- **Auto-refresh**: Data older than 1 hour is automatically refreshed

## Error Handling

The function includes comprehensive error handling:

- **Reddit API Errors**: Graceful fallback with detailed error messages
- **Translation Errors**: Falls back to original text
- **Database Errors**: Detailed error reporting
- **Rate Limiting**: Built-in delays and retry logic

## Setup Instructions

1. **Create Reddit App**:
   - Go to https://www.reddit.com/prefs/apps
   - Create a new application (script type)
   - Note the client ID and secret

2. **Setup Cloudflare AI**:
   - Get your Cloudflare Account ID
   - Create an API token with AI permissions

3. **Deploy to Supabase**:
   ```bash
   supabase functions deploy clever-action
   ```

4. **Set Environment Variables**:
   ```bash
   supabase secrets set REDDIT_APP_ID=your_app_id
   supabase secrets set REDDIT_APP_SECRET=your_app_secret
   supabase secrets set CLOUDFLARE_ACCOUNT_ID=your_account_id
   supabase secrets set CLOUDFLARE_API_TOKEN=your_token
   ```

5. **Run Database Migration**:
   ```bash
   supabase db reset
   ```

## Performance Considerations

- **Parallel Processing**: Multiple subreddits processed concurrently
- **Translation Batching**: Titles translated in batches of 5
- **Caching**: 1-hour cache reduces API calls
- **Rate Limiting**: Respects Reddit and Cloudflare rate limits

## Monitoring

Monitor the function through:
- Supabase Dashboard logs
- Database query performance
- Translation success rates
- API response times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 