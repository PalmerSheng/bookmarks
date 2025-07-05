// 路由配置文件 - 支持动态路由生成
import { createRouter, createWebHistory } from 'vue-router'
import { getAllTools } from './tools.js'
import Home from '../views/Home.vue'

// 基础路由
const baseRoutes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home 
  }
]

// 动态导入工具页面组件
const importToolComponent = (toolId) => {
  // 根据工具ID动态导入对应的Vue组件
  const componentMap = {
    'reddit': () => import('../views/RedditOverview.vue'),
    'calculator': () => import('../views/Calculator.vue'),
    'translator': () => import('../views/Translator.vue'),
    // 'calculator2': () => import('../views/Calculator2.vue'),
    // 在这里添加新工具的组件映射
    // 'todolist': () => import('../views/TodoList.vue'),
  }
  
  const importFn = componentMap[toolId]
  if (!importFn) {
    console.warn(`No component found for tool: ${toolId}`)
    return null
  }
  
  return importFn
}

// 根据工具配置生成路由
const generateToolRoutes = () => {
  const tools = getAllTools()
  const toolRoutes = []
  
  for (const tool of tools) {
    const component = importToolComponent(tool.id)
    if (component) {
      toolRoutes.push({
        path: tool.route,
        name: tool.routeName,
        component
      })
    }
  }
  
  return toolRoutes
}

// 合并所有路由
const createAppRouter = () => {
  const toolRoutes = generateToolRoutes()
  const allRoutes = [...baseRoutes, ...toolRoutes]
  
  return createRouter({
    history: createWebHistory(),
    routes: allRoutes
  })
}

export default createAppRouter

// 导出辅助函数供其他地方使用
export { generateToolRoutes, importToolComponent } 