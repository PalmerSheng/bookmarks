# Cloudflare Pages 部署指南

## 部署步骤

### 1. 准备项目
确保项目已经按照方案一进行了修改：
- ✅ 创建了 `public/_redirects` 文件
- ✅ 更新了 `vite.config.js` 构建配置
- ✅ 优化了 `src/stores/reddit.js` 中的API配置

### 2. Cloudflare Pages 设置

#### 构建配置
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **根目录**: `/`

#### 环境变量配置
在 Cloudflare Pages 后台的 "Settings" > "Environment variables" 中添加：

```
VITE_SUPABASE_URL=https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action
VITE_SUPABASE_TOKEN=xxx
```

### 3. 部署流程

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 配置构建设置和环境变量
4. 触发部署

### 4. 问题解决

#### 如果遇到路由404问题
确保 `public/_redirects` 文件存在且内容正确：
```
/*    /index.html   200
/api/supabase/*  https://husdiczqouillhvovodl.supabase.co/:splat  200
```

#### 如果遇到API调用失败
1. 检查环境变量是否正确配置
2. 确认Supabase Edge Function是否正常运行
3. 查看浏览器控制台的错误信息

#### 如果遇到CORS问题
- 开发环境会使用Vite代理
- 生产环境会直接调用Supabase或使用Cloudflare的重定向代理

### 5. 验证部署

部署成功后，访问以下页面确认功能正常：
- `/` - 首页
- `/reddit` - Reddit页面
- `/calculator` - 计算器页面

## 注意事项

1. **环境变量安全**: 虽然这些是前端环境变量，但建议定期轮换API Token
2. **缓存问题**: 如果更新后看不到变化，尝试清除浏览器缓存
3. **构建时间**: 首次构建可能需要2-3分钟
4. **自动部署**: 推送到主分支会自动触发重新部署 