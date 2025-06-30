# Reddit Top Posts - 多列表网格布局

这是一个现代化的Reddit热门帖子展示应用，采用了类似 [TopSub.cc](https://topsub.cc/) 的多列表网格布局设计。

## 🌟 特性

- **多列表网格布局**: 每个subreddit都有独立的列表卡片，每行最多显示3个subreddit
- **响应式设计**: 
  - 移动端：1列布局
  - 平板端：2列布局  
  - 大屏幕：3列布局（最大列数）
- **现代化UI**: 毛玻璃效果、渐变背景、平滑动画
- **国际化支持**: 中英文双语
- **实时数据**: 从Reddit API获取最新热门帖子

## 🎨 设计亮点

### 网格布局
- 使用CSS Grid实现响应式多列布局，每行最多3列
- 每个subreddit卡片包含：
  - 彩色头部显示subreddit名称和帖子数量
  - 最多显示10个热门帖子的精简信息
  - 点赞数、评论数、作者、发布时间等关键信息
  - 直接跳转到Reddit的外链按钮

### 视觉效果
- 渐变背景和毛玻璃效果
- 悬停动画和过渡效果
- 错峰加载动画让页面更生动
- 优化的滚动条和选择样式

### 用户体验
- 简洁的刷新按钮替代复杂的标签切换
- 清晰的错误状态和加载状态
- 无障碍设计，支持键盘导航
- 更宽的卡片设计，提供更好的内容展示空间

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📱 支持的Subreddit

当前支持以下技术相关的subreddit：

- `saas` - SaaS产品和服务
- `programming` - 编程讨论
- `technology` - 科技新闻
- `webdev` - Web开发
- `javascript` - JavaScript技术
- `startups` - 创业相关
- `entrepreneur` - 企业家精神
- `MachineLearning` - 机器学习
- `artificial` - 人工智能
- `datascience` - 数据科学
- `Python` - Python编程
- `reactjs` - React.js
- `node` - Node.js
- `frontend` - 前端开发
- `backend` - 后端开发

## 🛠 技术栈

- **前端框架**: Vue 3 + Composition API
- **状态管理**: Pinia
- **国际化**: Vue I18n
- **构建工具**: Vite
- **样式**: CSS3 + CSS Grid + Flexbox
- **API**: Reddit API (通过Supabase Edge Function)

## 📦 项目结构

```
src/
├── components/
│   ├── SubredditGroupList.vue  # 新的网格布局组件
│   ├── PostCard.vue           # 单个帖子卡片
│   ├── Header.vue             # 页面头部
│   ├── LoadingSpinner.vue     # 加载动画
│   └── ErrorMessage.vue       # 错误提示
├── views/
│   └── Home.vue               # 主页面（已重构）
├── stores/
│   └── reddit.js              # Reddit数据状态管理
├── locales/
│   ├── en.json                # 英文翻译
│   └── zh.json                # 中文翻译
└── style.css                  # 全局样式
```

## 🎯 设计理念

参考了 TopSub.cc 的设计理念，将传统的单列表切换改为多列表并行展示：

1. **信息密度优化**: 用户可以同时浏览多个subreddit的内容
2. **减少交互成本**: 无需点击切换就能看到所有内容
3. **视觉层次清晰**: 每个subreddit有独立的视觉容器
4. **响应式友好**: 在不同屏幕尺寸下都有良好的展示效果

## 🚀 部署说明

### Cloudflare Pages 部署

本项目已优化支持 Cloudflare Pages 部署：

1. **构建配置**:
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`

2. **环境变量配置**:
   ```
   VITE_SUPABASE_URL=https://husdiczqouillhvovodl.supabase.co/functions/v1/clever-action
   VITE_SUPABASE_TOKEN=your_supabase_token
   ```

3. **路由支持**: 
   - 已配置 `public/_redirects` 文件支持 SPA 路由
   - 支持直接访问 `/reddit`、`/calculator` 等路径

详细部署指南请参考 [DEPLOY.md](./DEPLOY.md)

## �� 许可证

MIT License 