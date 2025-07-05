# Cloudflare Pages + Clerk 认证配置指南

## 问题描述

在 Cloudflare Pages 部署时遇到错误：
```
This component/composable can only be used when the Vue plugin is installed.
```

这个错误通常是因为 Clerk Vue 插件没有正确安装或配置导致的。

## 问题原因

1. **环境变量缺失**: `VITE_CLERK_PUBLISHABLE_KEY` 没有在 Cloudflare Pages 中正确设置
2. **插件未安装**: 当环境变量为空时，Clerk 插件没有被安装，但组件仍然尝试使用 Clerk 的 composables
3. **构建时环境差异**: 本地开发环境和 Cloudflare Pages 构建环境的配置不一致

## 解决方案

### 1. 检查 Cloudflare Pages 环境变量

确保在 Cloudflare Pages 项目设置中正确配置了以下环境变量：

1. 登录 Cloudflare Dashboard
2. 进入 `Workers & Pages` > 选择你的项目
3. 点击 `Settings` 标签
4. 在 `Environment variables` 部分添加：

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZmx5dG9vbHMucGFnZXMuZGV2JA
VITE_SUPABASE_URL=https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action
VITE_SUPABASE_TOKEN=your_supabase_token
VITE_SUPABASE_TRANSLATE_URL=https://husdiczqouillhvovodl.supabase.co/functions/v1/translate
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_API_TIMEOUT=15000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_CACHE_DURATION=3600000
```

⚠️ **重要**: 
- 确保变量名以 `VITE_` 开头
- 替换示例值为你的实际配置
- 环境变量更改后需要重新部署

### 2. 代码修改

项目已经修改为支持认证功能的优雅降级：

#### main.js 修改
```javascript
// 总是安装 Clerk 插件，但使用不同的配置
if (!clerkPublishableKey) {
  console.warn('Missing Clerk Publishable Key. Authentication features will be disabled.')
  // 使用测试密钥来避免组件错误
  app.use(clerkPlugin, {
    publishableKey: 'pk_test_disabled',
    // ... 其他配置
  })
} else {
  console.log('Clerk authentication enabled')
  app.use(clerkPlugin, {
    publishableKey: clerkPublishableKey,
    // ... 其他配置
  })
}
```

#### Header.vue 修改
```vue
<!-- 认证不可用状态 -->
<div v-else-if="!authEnabled" class="auth-disabled">
  <button class="auth-btn auth-disabled-btn" disabled>
    {{ $t('nav.authDisabled') }}
  </button>
</div>
```

### 3. 构建配置

确保 `package.json` 中的构建脚本正确：

```json
{
  "scripts": {
    "build": "vite build --mode production",
    "build:prod": "vite build --mode production"
  }
}
```

### 4. 部署配置

在 Cloudflare Pages 项目设置中：

- **Framework preset**: `Vue`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

### 5. 验证部署

部署后检查：

1. 打开浏览器开发者工具
2. 查看 Console 是否有 Clerk 相关错误
3. 检查 Network 标签页的请求
4. 验证环境变量是否正确加载

## 常见问题

### Q: 为什么本地开发正常，但部署后出错？

A: 本地开发环境使用 `.env` 文件，而 Cloudflare Pages 使用项目设置中的环境变量。确保两者一致。

### Q: 如何确认环境变量是否正确设置？

A: 在代码中添加调试日志：
```javascript
console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing')
```

### Q: 更改环境变量后为什么没有生效？

A: Cloudflare Pages 需要重新部署才能使环境变量生效。可以通过以下方式触发重新部署：
1. 推送新的提交到 Git 仓库
2. 在 Cloudflare Dashboard 中手动触发重新部署

### Q: 如何处理多环境配置？

A: 使用不同的环境变量配置：
- Production: `VITE_CLERK_PUBLISHABLE_KEY=pk_live_...`
- Development: `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`

## 安全注意事项

1. **公钥安全**: Clerk 的 Publishable Key 是公开的，可以安全地在前端使用
2. **私钥保护**: 永远不要在前端代码中使用 Clerk 的 Secret Key
3. **环境隔离**: 生产环境和开发环境使用不同的 Clerk 应用

## 测试步骤

1. 本地测试：
   ```bash
   npm run build
   npm run preview
   ```

2. 部署测试：
   - 推送代码到 Git 仓库
   - 等待 Cloudflare Pages 自动部署
   - 访问部署的 URL 进行测试

## 联系支持

如果问题仍然存在：
1. 检查 Cloudflare Pages 的部署日志
2. 查看浏览器开发者工具的错误信息
3. 参考 [Clerk Vue 文档](https://clerk.com/docs/quickstarts/vue)
4. 检查 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/) 