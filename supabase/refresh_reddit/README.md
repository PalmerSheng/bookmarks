# Refresh Reddit Function

这是一个 Supabase Edge Function，用于批量刷新数据库中所有 subreddit 的数据。

## 功能说明

该函数会：
1. 从 `subreddit_top` 表中获取所有的 subreddit 名称
2. 分批调用 `clever-action` 函数来刷新每个 subreddit 的数据
3. 返回处理结果和统计信息

## API 端点

```
POST /functions/v1/refresh-reddit
```

## 请求参数

请求体是可选的 JSON 对象，支持以下参数：

```json
{
  "force_refresh": true,    // 是否强制刷新（默认: true）
  "batch_size": 50         // 批处理大小（默认: 50）
}
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "message": "Refresh completed for 100 subreddits",
  "data": {
    "subreddits_total": 100,
    "subreddits_processed": 100,
    "batches_successful": 2,
    "batches_failed": 0,
    "results": [
      {
        "batch_number": 1,
        "subreddits": ["saas", "technology", "..."],
        "success": true,
        "data": { /* clever-action 响应数据 */ },
        "duration_ms": 5000
      }
    ]
  },
  "meta": {
    "force_refresh": true,
    "batch_size": 50,
    "total_duration_ms": 12000,
    "database_query_ms": 150,
    "processing_ms": 11800,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "cors_enabled": true
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "具体错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cors_enabled": true,
  "timing": {
    "total_duration_ms": 1000
  }
}
```

## 使用示例

### 1. 使用默认参数刷新所有 subreddit

```bash
curl -X POST https://your-project.supabase.co/functions/v1/refresh-reddit \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 2. 自定义参数

```bash
curl -X POST https://your-project.supabase.co/functions/v1/refresh-reddit \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "force_refresh": false,
    "batch_size": 25
  }'
```

### 3. JavaScript 调用示例

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/refresh-reddit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    force_refresh: true,
    batch_size: 30
  })
});

const result = await response.json();
console.log(result);
```

## 环境变量

确保以下环境变量已配置：

- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `REDDIT_APP_ID`: Reddit 应用 ID
- `REDDIT_APP_SECRET`: Reddit 应用密钥
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID（用于翻译）
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 令牌（用于翻译）

## 工作原理

1. **获取 subreddit 列表**: 从 `subreddit_top` 表查询所有 subreddit 名称
2. **分批处理**: 将 subreddit 分成批次，避免一次性处理过多数据
3. **调用 clever-action**: 对每个批次调用 `clever-action` 函数
4. **批次间延迟**: 批次之间有 1 秒延迟，避免过于频繁的 API 调用
5. **结果统计**: 收集所有批次的处理结果和统计信息

## 注意事项

- 该函数会处理数据库中的所有 subreddit，可能需要较长时间
- 建议在低峰时段运行以避免影响其他服务
- 如果某个批次失败，其他批次仍会继续处理
- 函数支持 CORS，可以从前端直接调用

## 日志说明

函数会输出详细的日志信息，包括：
- 处理进度（批次信息）
- 每个批次的处理时间
- 错误信息（如果有）
- 总体统计信息

这些日志可以在 Supabase 控制台的 Edge Functions 日志中查看。 