# 环境配置说明
# Environment Configuration Guide

本项目支持三套环境：开发环境、测试环境和正式环境，每个环境都有独立的配置文件。

## 环境文件说明

### 1. 开发环境 (Development)
- **配置文件**: `.env.development`
- **用途**: 本地开发使用
- **特点**: 
  - 启用调试模式
  - 较长的 API 超时时间
  - 开发服务器端口: 3000

### 2. 测试环境 (Test)
- **配置文件**: `.env.test`
- **用途**: 测试环境部署
- **特点**:
  - 关闭调试模式
  - 启用模拟数据
  - 开发服务器端口: 3001

### 3. 正式环境 (Production)
- **配置文件**: `.env.production`
- **用途**: 生产环境部署
- **特点**:
  - 关闭调试模式
  - 启用分析和错误报告
  - 代码压缩和优化
  - 开发服务器端口: 3002

## 使用方法

### 开发命令
```bash
# 开发环境
npm run dev              # 使用 .env.development

# 测试环境
npm run dev:test         # 使用 .env.test

# 正式环境
npm run dev:prod         # 使用 .env.production
```

### 构建命令
```bash
# 默认构建（正式环境）
npm run build            # 使用 .env.production

# 开发环境构建
npm run build:dev        # 使用 .env.development

# 测试环境构建
npm run build:test       # 使用 .env.test

# 正式环境构建
npm run build:prod       # 使用 .env.production
```

### 预览命令
```bash
# 预览构建结果
npm run preview          # 默认模式
npm run preview:test     # 测试环境
npm run preview:prod     # 正式环境
```

## 环境变量说明

### 通用变量
- `VITE_SUPABASE_URL`: Supabase Edge Function URL
- `VITE_SUPABASE_TOKEN`: Supabase 匿名密钥
- `VITE_SUPABASE_TRANSLATE_URL`: 翻译功能 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名密钥（翻译功能）
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk 公开密钥

### 环境特定变量
- `VITE_APP_ENV`: 应用环境标识
- `VITE_DEBUG_MODE`: 调试模式开关
- `VITE_API_TIMEOUT`: API 请求超时时间

### 测试环境特有
- `VITE_ENABLE_MOCK_DATA`: 启用模拟数据
- `VITE_TEST_USER_ID`: 测试用户 ID

### 正式环境特有
- `VITE_ENABLE_ANALYTICS`: 启用分析功能
- `VITE_ENABLE_ERROR_REPORTING`: 启用错误报告
- `VITE_CACHE_DURATION`: 缓存持续时间

## 配置步骤

### 1. 复制环境文件
确保你有以下环境文件：
- `.env.development` (开发环境)
- `.env.test` (测试环境)
- `.env.production` (正式环境)

### 2. 配置各环境的实际值
根据你的实际项目配置，更新每个环境文件中的变量值：

#### 开发环境
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co/functions/v1/clever-action
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_dev_key
```

#### 测试环境
```env
VITE_SUPABASE_URL=https://your-test-project.supabase.co/functions/v1/clever-action
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_test_key
```

#### 正式环境
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co/functions/v1/clever-action
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_prod_key
```

### 3. 在代码中使用环境变量
```javascript
// 获取当前环境
const currentEnv = import.meta.env.VITE_APP_ENV

// 检查调试模式
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Debug mode enabled')
}

// 使用全局常量（在 vite.config.js 中定义）
if (__DEBUG_MODE__) {
  console.log('Current environment:', __APP_ENV__)
}
```

## 部署配置

### Cloudflare Pages
在 Cloudflare Pages 的环境变量设置中，为不同的环境分支配置相应的变量。

### 其他部署平台
根据你使用的部署平台，在相应的环境变量配置中设置这些值。

## 注意事项

1. **安全性**: 
   - 不要在代码中硬编码敏感信息
   - 正式环境使用 `pk_live_` 开头的 Clerk 密钥
   - 测试和开发环境使用 `pk_test_` 开头的密钥

2. **版本控制**:
   - 将实际的环境文件添加到 `.gitignore`
   - 只提交 `.env.example` 作为模板

3. **环境隔离**:
   - 确保每个环境使用独立的数据库和服务
   - 避免测试数据污染正式环境

4. **调试**:
   - 开发环境启用详细日志
   - 正式环境关闭调试信息以提高性能 