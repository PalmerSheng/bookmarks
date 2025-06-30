# Cloudflare Pages 部署指南

本指南说明如何将此应用部署到 Cloudflare Pages 并解决跨域问题。

## 🚀 部署步骤

### 1. 构建配置

确保项目根目录有以下文件：

- `public/_headers` - 设置CORS头部
- `public/_redirects` - 配置SPA路由
- `package.json` - 包含构建脚本

### 2. Cloudflare Pages 设置

1. 登录 Cloudflare Dashboard
2. 进入 Pages 部分
3. 连接你的 GitHub/GitLab 仓库
4. 配置构建设置：
   - **Framework preset**: `Vue`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (项目根目录)

### 3. 环境变量配置

在 Cloudflare Pages 项目设置中添加以下环境变量：

```
VITE_SUPABASE_URL=https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action
VITE_SUPABASE_TOKEN=your_supabase_anon_key_here
```

⚠️ **重要**: 替换 `your_supabase_anon_key_here` 为你的实际 Supabase anon key。

### 4. 域名设置（可选）

如果使用自定义域名：
1. 在 Cloudflare Pages 设置中添加自定义域名
2. 确保 DNS 记录正确配置

## 🔧 跨域问题解决方案

### 问题原因

在 Cloudflare Pages 静态部署环境中：
- Vite 的开发代理不可用
- 需要直接调用 Supabase Edge Functions
- 可能遇到浏览器 CORS 限制

### 解决方案

本项目采用以下策略解决跨域问题：

1. **环境分离**: 开发环境使用代理，生产环境直接调用
2. **CORS 配置**: 通过 `_headers` 文件设置响应头
3. **请求优化**: 使用 `fetch` API 并配置正确的 CORS 模式

### 代码实现

```javascript
// 生产环境直接调用 Supabase
const SUPABASE_FUNCTION_URL = isProduction 
  ? 'https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action'
  : '/api/supabase/functions/v1/clever-action'

// 生产环境请求配置
const config = {
  method: 'POST',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  },
  credentials: 'omit' // 避免凭据相关的CORS问题
}
```

## 🏗️ 构建和部署

### 本地构建测试

```bash
npm run build
npm run preview
```

### 自动部署

推送到 main 分支会自动触发 Cloudflare Pages 构建和部署。

### 手动部署

也可以使用 Wrangler CLI：

```bash
npm install -g @cloudflare/wrangler
wrangler pages publish dist
```

## 🐛 常见问题

### 1. CORS 错误

**错误**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解决**: 
- 确保 `_headers` 文件正确配置
- 检查环境变量是否正确设置
- 验证 Supabase Edge Function 的 CORS 设置

### 2. 404 错误

**错误**: `Supabase Edge Function not found`

**解决**:
- 检查 Supabase Edge Function 是否正确部署
- 验证函数 URL 是否正确
- 确保函数名称匹配

### 3. 认证错误

**错误**: `Authentication failed`

**解决**:
- 检查 `VITE_SUPABASE_TOKEN` 环境变量
- 确保使用正确的 anon key
- 验证 Supabase 项目配置

### 4. 环境变量未生效

**解决**:
- 重新部署项目（环境变量更改需要重新部署）
- 确保变量名以 `VITE_` 开头
- 检查变量值是否正确

## 📊 性能优化

### 1. 缓存策略

`_headers` 文件包含缓存控制，优化加载速度。

### 2. 构建优化

Vite 配置已优化：
- 代码分割
- 资源压缩
- Tree shaking

### 3. CDN 加速

Cloudflare Pages 自动提供全球 CDN 加速。

## 🔍 调试

### 开发工具

使用浏览器开发者工具：
1. Network 标签页检查请求
2. Console 查看错误日志
3. Application 标签页检查环境变量

### 日志

应用包含详细的控制台日志：
```javascript
console.log('🚀 Making API request:', {
  environment: isProduction ? 'production' : 'development',
  url: SUPABASE_FUNCTION_URL
})
```

## 📞 技术支持

如果遇到问题：
1. 检查 Cloudflare Pages 部署日志
2. 查看浏览器开发者工具
3. 验证 Supabase Edge Function 状态
4. 参考本文档的常见问题部分 