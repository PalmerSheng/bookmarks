# Clerk 用户认证设置指南

本项目已集成 Clerk 用户认证服务，提供完整的用户登录、注册、个人资料管理等功能。

## 🚀 快速开始

### 1. 创建 Clerk 应用

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 注册账户并创建新应用
3. 选择适合的认证方式（邮箱、社交登录等）

### 2. 获取 API 密钥

1. 在 Clerk Dashboard 中进入你的应用
2. 点击左侧菜单的 "API Keys"
3. 复制 "Publishable Key"（以 `pk_test_` 或 `pk_live_` 开头）

### 3. 配置环境变量

#### 本地开发
在项目根目录的 `.env` 文件中添加：
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

#### 生产环境（Cloudflare Pages）
在 Cloudflare Pages 项目设置中添加环境变量：
- 变量名：`VITE_CLERK_PUBLISHABLE_KEY`
- 值：你的 Clerk Publishable Key

### 4. 启动项目

```bash
npm run dev
```

## 🎯 功能特性

### 已实现的功能

- ✅ **登录按钮**：点击调出 Clerk 登录模态框
- ✅ **用户菜单**：登录后显示用户头像和姓名
- ✅ **个人资料**：访问用户个人资料页面
- ✅ **账户管理**：管理账户设置
- ✅ **退出登录**：安全退出功能
- ✅ **响应式设计**：适配桌面和移动设备
- ✅ **国际化支持**：中英文界面切换

### 认证流程

1. **未登录状态**：显示"登录"按钮
2. **点击登录**：弹出 Clerk 登录模态框
3. **登录成功**：按钮变为用户菜单
4. **用户菜单**：包含个人资料、账户设置、退出登录

## 🎨 自定义外观

项目已配置了与应用主题匹配的 Clerk 外观设置：

```javascript
appearance: {
  baseTheme: undefined,
  variables: {
    colorPrimary: '#667eea',        // 主色调
    colorText: '#1f2937',           // 文本颜色
    colorTextSecondary: '#6b7280',  // 次要文本颜色
    colorBackground: '#ffffff',      // 背景色
    colorInputBackground: '#f9fafb', // 输入框背景
    colorInputText: '#1f2937',      // 输入框文本
    borderRadius: '0.5rem'          // 圆角半径
  }
}
```

## 🔧 高级配置

### 支持的认证方式

Clerk 支持多种认证方式，你可以在 Dashboard 中配置：

- 📧 **邮箱 + 密码**
- 📱 **手机号 + 验证码**
- 🔗 **社交登录**：
  - Google
  - GitHub
  - Facebook
  - Twitter
  - Discord
  - 等等...

### 自定义重定向

```javascript
// 在 main.js 中配置
app.use(clerkPlugin, {
  publishableKey: clerkPublishableKey,
  afterSignOutUrl: '/',           // 退出后重定向
  afterSignInUrl: '/',            // 登录后重定向
  afterSignUpUrl: '/',            // 注册后重定向
  // ... 其他配置
})
```

## 🛡️ 安全最佳实践

1. **环境变量安全**：
   - Publishable Key 可以安全地在客户端使用
   - 永远不要在客户端暴露 Secret Key

2. **HTTPS 要求**：
   - 生产环境必须使用 HTTPS
   - Clerk 在生产环境下要求 HTTPS

3. **域名配置**：
   - 在 Clerk Dashboard 中配置允许的域名
   - 确保生产域名已添加到白名单

## 📱 移动端适配

项目已完美适配移动设备：

- 🔄 **响应式布局**：按钮和菜单自动调整大小
- 👆 **触摸友好**：适合触摸操作的按钮大小
- 🎯 **优化体验**：移动端优化的交互体验

## 🌍 国际化支持

认证相关的文本已支持中英文切换：

- 中文：登录、退出、个人资料、账户
- 英文：Sign In、Sign Out、Profile、Account

## 🔍 故障排除

### 常见问题

1. **登录按钮不显示**
   - 检查环境变量是否正确设置
   - 确认 Publishable Key 格式正确

2. **登录模态框不弹出**
   - 检查网络连接
   - 确认域名是否在 Clerk Dashboard 中配置

3. **样式问题**
   - 清除浏览器缓存
   - 检查 CSS 是否正确加载

### 调试技巧

1. **查看控制台**：
   ```javascript
   console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
   ```

2. **检查 Clerk 状态**：
   ```javascript
   console.log('Is Signed In:', isSignedIn.value)
   console.log('User:', user.value)
   ```

## 📚 更多资源

- [Clerk 官方文档](https://clerk.com/docs)
- [Clerk Vue 文档](https://clerk.com/docs/references/vue/overview)
- [Clerk Dashboard](https://dashboard.clerk.com/)

## 🤝 技术支持

如果遇到问题，可以：

1. 查看 [Clerk 官方文档](https://clerk.com/docs)
2. 在 [Clerk 社区](https://clerk.com/discord) 寻求帮助
3. 提交 [GitHub Issue](https://github.com/clerkinc/javascript)

---

✨ 现在你的应用已经具备了完整的用户认证功能！ 