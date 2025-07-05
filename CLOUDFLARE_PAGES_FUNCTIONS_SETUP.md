# Cloudflare Pages Functions 设置指南

## 🚀 问题解决方案

你遇到的 405 错误是因为 Cloudflare Pages 静态部署环境无法处理 API 代理。解决方案是使用 Cloudflare Pages Functions。

## 📁 文件结构

现在你的项目应该有以下结构：

```
project/
├── functions/
│   └── api/
│       └── supabase/
│           └── functions/
│               └── v1/
│                   └── clever-action.js  # 新创建的代理函数
├── public/
│   ├── _headers                         # 已更新
│   └── _redirects                       # 已更新
└── src/
    └── stores/
        └── reddit.js                    # 无需修改
```

## 🔧 工作原理

1. **客户端请求**: 前端发送请求到 `/api/supabase/functions/v1/clever-action`
2. **Pages Function**: Cloudflare Pages Function 接收请求
3. **代理转发**: 函数将请求转发到真实的 Supabase Edge Function
4. **响应返回**: 将 Supabase 的响应返回给前端

## 🛠️ 部署步骤

### 1. 确认文件已创建

确保以下文件存在：
- `functions/api/supabase/functions/v1/clever-action.js`
- `public/_redirects` (已更新)
- `public/_headers` (已存在)

### 2. 提交代码

```bash
git add .
git commit -m "Add Cloudflare Pages Functions for API proxy"
git push origin main
```

### 3. 重新部署

推送代码后，Cloudflare Pages 会自动重新部署。

### 4. 验证部署

部署完成后，检查：
1. 访问你的网站
2. 打开浏览器开发者工具
3. 尝试使用需要调用 API 的功能
4. 检查 Network 标签页，确认请求成功

## 🔍 调试

如果仍然有问题，可以：

### 1. 检查 Cloudflare Pages 日志

在 Cloudflare Dashboard → Pages → 你的项目 → Functions 中查看日志。

### 2. 测试 API 端点

直接访问：`https://你的域名.pages.dev/api/supabase/functions/v1/clever-action`

应该返回 405 错误（因为是 GET 请求），但不应该是 404。

### 3. 检查环境变量

确保在 Cloudflare Pages 设置中配置了：
- `VITE_SUPABASE_TOKEN`

## 💡 关键改进

1. **API 代理**: 使用 Cloudflare Pages Functions 处理 API 代理
2. **CORS 处理**: 在代理函数中正确设置 CORS 头部
3. **错误处理**: 添加了详细的错误处理和日志
4. **OPTIONS 支持**: 支持预检请求

## 🎯 预期结果

部署后，你的应用应该能够：
- ✅ 在生产环境正常调用 Supabase Edge Functions
- ✅ 避免 CORS 错误
- ✅ 正确处理 API 请求和响应
- ✅ 不再出现 405 错误

## 🔄 如果问题仍然存在

1. 检查 Cloudflare Pages 构建日志
2. 确认 `functions` 目录被正确部署
3. 验证环境变量设置
4. 查看 Functions 运行时日志

## 📞 技术支持

如果仍有问题，请提供：
1. 完整的错误信息
2. 浏览器开发者工具的 Network 标签页截图
3. Cloudflare Pages 的构建日志 