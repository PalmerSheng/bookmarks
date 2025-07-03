# 工具添加指南

本项目已经重构为支持动态添加工具页面的架构。按照以下步骤可以轻松添加新的工具。

## 🏗️ 项目结构

```
src/
├── utils/
│   ├── tools.js          # 🔧 工具配置文件（核心）
│   └── router.js         # 🛣️ 动态路由配置
├── views/                # 📄 工具页面目录
│   ├── Home.vue         # 🏠 首页（自动展示所有工具）
│   ├── Calculator.vue   # 🧮 计算器工具
│   └── RedditOverview.vue # 📱 Reddit工具
├── templates/            # 📋 工具模板
│   └── ToolTemplate.vue # 🎨 新工具页面模板
├── components/
│   └── Header.vue       # 🧭 导航栏（自动生成导航按钮）
└── locales/             # 🌐 国际化文件
    ├── en.json
    └── zh.json
```

## 🚀 添加新工具的步骤

### 1️⃣ 配置工具信息

在 `src/utils/tools.js` 中的 `tools` 数组中添加新工具配置：

```javascript
{
  id: 'your-tool-id',              // 🆔 唯一标识符（小写+连字符）
  name: 'Your Tool Name',          // 📝 工具显示名称
  route: '/your-tool',             // 🛣️ 路由路径
  routeName: 'YourTool',           // 🏷️ 路由名称（PascalCase）
  icon: {                          // 🎨 SVG图标配置
    viewBox: '0 0 16 16',         // 📐 SVG viewBox
    path: 'M8 0C3.58...'          // 📍 SVG路径数据
  },
  i18nKey: 'yourTool',            // 🌐 国际化键名（camelCase）
  description: 'Tool description'  // 📄 工具简短描述
}
```

### 2️⃣ 创建工具页面组件

#### 选项A：使用模板快速创建

1. 复制 `src/templates/ToolTemplate.vue` 到 `src/views/YourTool.vue`
2. 修改模板内容，实现你的工具功能
3. 更新国际化键名 `toolName` 为你的工具键名

#### 选项B：从零开始创建

在 `src/views/` 目录下创建新的 Vue 组件文件：

```vue
<template>
  <div class="your-tool">
    <div class="container">
      <div class="tool-wrapper">
        <h2 class="tool-title">{{ $t('yourTool.title') }}</h2>
        
        <!-- 工具功能实现区域 -->
        <div class="tool-content">
          <!-- 在这里实现你的工具功能 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 你的工具逻辑
import { ref, onMounted } from 'vue'

// 状态管理
const loading = ref(false)
const data = ref(null)

// 方法
const handleAction = () => {
  // 工具功能逻辑
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
/* 参考 ToolTemplate.vue 的样式 */
.your-tool {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tool-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tool-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-title {
    font-size: 2rem;
  }
  
  .tool-content {
    padding: 1.5rem;
  }
}
</style>
```

### 3️⃣ 注册路由组件

在 `src/utils/router.js` 的 `componentMap` 中添加你的组件映射：

```javascript
const componentMap = {
  'reddit': () => import('../views/RedditOverview.vue'),
  'calculator': () => import('../views/Calculator.vue'),
  'your-tool-id': () => import('../views/YourTool.vue'), // 👈 添加这行
}
```

### 4️⃣ 添加国际化文本

在 `src/locales/en.json` 中添加：

```json
{
  "nav": {
    "yourTool": "Your Tool"
  },
  "home": {
    "features": {
      "yourTool": {
        "title": "Your Tool",
        "description": "Description of your amazing tool",
        "action": "Use Tool"
      }
    }
  },
  "yourTool": {
    "title": "Your Tool",
    "description": "Tool description",
    "placeholder": "Enter something...",
    "button": "Execute",
    "result": "Result"
  }
}
```

在 `src/locales/zh.json` 中添加：

```json
{
  "nav": {
    "yourTool": "你的工具"
  },
  "home": {
    "features": {
      "yourTool": {
        "title": "你的工具",
        "description": "你的神奇工具描述",
        "action": "使用工具"
      }
    }
  },
  "yourTool": {
    "title": "你的工具",
    "description": "工具描述",
    "placeholder": "输入内容...",
    "button": "执行",
    "result": "结果"
  }
}
```

## 📘 完整示例：添加 Todo List 工具

### 1. 添加工具配置

```javascript
// src/utils/tools.js
{
  id: 'todolist',
  name: 'Todo List',
  route: '/todolist',
  routeName: 'TodoList',
  icon: {
    viewBox: '0 0 16 16',
    path: 'M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z'
  },
  i18nKey: 'todolist',
  description: 'Manage your tasks efficiently'
}
```

### 2. 创建页面组件

```vue
<!-- src/views/TodoList.vue -->
<template>
  <div class="todolist">
    <div class="container">
      <div class="tool-wrapper">
        <h2 class="tool-title">{{ $t('todolist.title') }}</h2>
        
        <div class="tool-content">
          <div class="add-todo">
            <input 
              v-model="newTodo"
              @keyup.enter="addTodo"
              :placeholder="$t('todolist.placeholder')"
              class="todo-input"
            >
            <button @click="addTodo" class="add-btn">
              {{ $t('todolist.add') }}
            </button>
          </div>
          
          <div class="todo-list">
            <div 
              v-for="todo in todos" 
              :key="todo.id"
              class="todo-item"
              :class="{ completed: todo.completed }"
            >
              <input 
                type="checkbox" 
                v-model="todo.completed"
                class="todo-checkbox"
              >
              <span class="todo-text">{{ todo.text }}</span>
              <button @click="removeTodo(todo.id)" class="remove-btn">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([])
let nextId = 1

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: nextId++,
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}
</script>

<style scoped>
/* 使用标准工具样式 */
.todolist {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tool-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tool-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.add-todo {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.todo-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
}

.todo-text {
  flex: 1;
  color: white;
  font-size: 1rem;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(231, 76, 60, 1);
}
</style>
```

### 3. 注册路由

```javascript
// src/utils/router.js
const componentMap = {
  'reddit': () => import('../views/RedditOverview.vue'),
  'calculator': () => import('../views/Calculator.vue'),
  'todolist': () => import('../views/TodoList.vue'), // 👈 添加这行
}
```

### 4. 添加国际化

```json
// src/locales/en.json
{
  "nav": {
    "todolist": "Todo List"
  },
  "home": {
    "features": {
      "todolist": {
        "title": "Todo List",
        "description": "Manage your tasks efficiently",
        "action": "Manage Tasks"
      }
    }
  },
  "todolist": {
    "title": "Todo List",
    "placeholder": "Enter a new task...",
    "add": "Add Task"
  }
}
```

```json
// src/locales/zh.json
{
  "nav": {
    "todolist": "待办清单"
  },
  "home": {
    "features": {
      "todolist": {
        "title": "待办清单",
        "description": "高效管理你的任务",
        "action": "管理任务"
      }
    }
  },
  "todolist": {
    "title": "待办清单",
    "placeholder": "输入新任务...",
    "add": "添加任务"
  }
}
```

## 🎨 获取 SVG 图标

推荐的图标资源网站：

- [Bootstrap Icons](https://icons.getbootstrap.com/) - 免费的高质量图标
- [Heroicons](https://heroicons.com/) - 精美的 SVG 图标
- [Feather Icons](https://feathericons.com/) - 简洁的线条图标
- [Tabler Icons](https://tabler-icons.io/) - 丰富的免费图标库

**使用方法：**
1. 选择喜欢的图标
2. 复制 SVG 代码
3. 提取 `viewBox` 和 `<path>` 元素的 `d` 属性
4. 添加到工具配置中

## ⚠️ 注意事项

1. **唯一性**: 确保 `id`、`route`、`routeName` 都是唯一的
2. **命名规范**: 
   - `id`: 小写+连字符 (例: `todo-list`)
   - `routeName`: PascalCase (例: `TodoList`)
   - `i18nKey`: camelCase (例: `todoList`)
3. **响应式设计**: 确保新工具在移动设备上也能正常使用
4. **国际化**: 为所有文本添加国际化支持
5. **样式一致性**: 保持与现有工具相同的设计风格
6. **路由注册**: 不要忘记在 `router.js` 中注册组件映射

## 🔄 自动化特性

完成以上步骤后，新工具将自动：

- ✅ 出现在导航栏中
- ✅ 显示在首页的功能卡片中
- ✅ 支持路由导航
- ✅ 支持多语言
- ✅ 适配移动端

## 🐛 调试技巧

1. **检查控制台**: 查看是否有路由或组件加载错误
2. **验证配置**: 确保工具配置对象格式正确
3. **测试路由**: 直接访问工具路由 URL 测试
4. **检查国际化**: 确保所有 i18n 键都已定义

完成这些步骤后，你的新工具就能无缝集成到项目中了！🎉 