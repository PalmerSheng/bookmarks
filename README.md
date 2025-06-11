# 🔖 我的书签网站

一个使用 Vue 3 构建的现代化个人书签导航网站，具有美观的界面和实用的搜索功能。

## ✨ 功能特点

- 🎨 **现代化设计** - 采用渐变背景和毛玻璃效果
- 🔍 **实时搜索** - 支持按标题和描述搜索书签
- 📱 **响应式布局** - 完美适配桌面和移动设备
- 🏷️ **分类管理** - 书签按类别整理，便于查找
- ⚡ **快速访问** - 点击即可在新标签页打开网站
- 🎯 **用户友好** - 简洁直观的用户界面

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动，浏览器会自动打开。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
bookmarks-website/
├── src/
│   ├── App.vue          # 主应用组件
│   ├── main.js          # 应用入口文件
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── README.md           # 项目说明
```

## 🎨 界面预览

- **渐变背景** - 紫蓝色渐变背景，视觉效果优雅
- **毛玻璃卡片** - 半透明卡片设计，现代感十足
- **悬停动效** - 鼠标悬停时的平滑动画效果
- **搜索高亮** - 实时搜索结果过滤

## 📚 书签分类

默认包含以下分类：

- 🔍 **搜索引擎** - Google、百度、Bing
- 💬 **社交媒体** - 微博、Twitter、知乎
- ⚡ **开发工具** - GitHub、Stack Overflow、MDN、Vue.js
- 🎬 **娱乐视频** - YouTube、B站、爱奇艺
- 📰 **新闻资讯** - 新浪新闻、36氪、BBC News
- 🛠️ **在线工具** - CodePen、Can I Use、JSON格式化

## 🔧 自定义配置

你可以在 `src/App.vue` 文件中修改书签数据：

```javascript
const categories = ref([
  {
    id: 1,
    name: '分类名称',
    icon: '🔍',
    bookmarks: [
      {
        id: 1,
        title: '网站标题',
        url: 'https://example.com',
        description: '网站描述',
        icon: 'E'
      }
    ]
  }
])
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 快速的前端构建工具
- **CSS3** - 现代 CSS 特性（Grid、Flexbox、渐变、动画）
- **ES6+** - 现代 JavaScript 语法

## 📱 响应式设计

- 桌面端：多列网格布局
- 平板端：自适应列数
- 移动端：单列布局

## 🎯 使用建议

1. **个性化定制** - 根据个人需求修改书签分类和网站
2. **图标优化** - 可以使用 Emoji 或字母作为网站图标
3. **颜色主题** - 可以在 CSS 中调整渐变色彩搭配
4. **功能扩展** - 可以添加书签导入/导出功能

## 📄 许可证

MIT License

---

**享受你的个人书签导航体验！** 🚀 