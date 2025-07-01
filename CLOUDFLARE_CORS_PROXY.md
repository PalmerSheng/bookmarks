# Cloudflare Pages Function CORS 代理配置

## 问题背景

在生产环境中直接从浏览器调用 Supabase Edge Function 时遇到 CORS 错误，因为：
1. 浏览器的同源策略限制
2. Supabase Edge Function 的 CORS 配置可能不够灵活
3. 需要在不同域之间进行 API 调用

## 解决方案

使用 Cloudflare Pages Functions 作为代理，在同一域下代理对 Supabase Edge Function 的请求。

## 文件结构

```
functions/
└── api/
    └── supabase/
        └── functions/
            └── v1/
                └── clever-action.js    # Cloudflare Pages Function 代理
```

## 代理函数功能

`functions/api/supabase/functions/v1/clever-action.js` 提供：

1. **CORS 支持**：设置正确的 CORS 头，允许跨域请求
2. **请求代理**：将前端请求转发到真实的 Supabase Edge Function
3. **错误处理**：优雅处理各种错误情况
4. **日志记录**：便于调试和监控

## 请求流程

```
前端应用 → Cloudflare Pages Function → Supabase Edge Function
         (同域，无CORS问题)        (服务器到服务器)
```

## 配置变更

### 1. URL 配置更新

在 `src/stores/reddit.js` 中：

```javascript
// 之前：直接调用 Supabase
const SUPABASE_FUNCTION_URL = 'https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action'

// 现在：通过代理调用
const SUPABASE_FUNCTION_URL = '/api/supabase/functions/v1/clever-action'
```

### 2. 请求方式统一

现在生产环境和开发环境都使用相同的代理方式，简化了代码逻辑。

## 部署检查

1. **确保文件路径正确**：`functions/api/supabase/functions/v1/clever-action.js`
2. **检查代理函数中的 Supabase URL**：确保指向正确的 Edge Function
3. **验证 Authorization token**：确保代理请求包含正确的认证信息

## 调试

### 查看 Cloudflare Pages Function 日志

1. 登录 Cloudflare Dashboard
2. 进入你的 Pages 项目
3. 查看 Functions 标签页的日志

### 本地测试

使用 Wrangler CLI 进行本地测试：

```bash
npx wrangler pages dev dist --compatibility-date=2023-05-18
```

## 优势

1. **解决 CORS 问题**：无需修改 Supabase Edge Function
2. **统一开发体验**：生产和开发环境使用相同的请求方式
3. **更好的错误处理**：可以在代理层添加额外的错误处理逻辑
4. **性能优化**：可以在代理层添加缓存等优化

## 注意事项

1. **API 密钥安全**：确保不在前端代码中暴露敏感信息
2. **请求限制**：注意 Cloudflare Pages Functions 的请求限制
3. **监控**：定期检查代理函数的执行情况和错误率 