// 工具配置文件 - 统一管理所有工具页面
export const tools = [
  {
    id: 'reddit',
    name: 'Reddit',
    route: '/reddit',
    routeName: 'Reddit',
    icon: {
      viewBox: '0 0 16 16',
      path: 'M6.167 8a.831.831 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.232.232 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.604 2.014-.496.111-.746.387-.746.734 0 .715.01.843.09.931.08.088.497.314.847.463.35.148.543.25.543.395 0 .134-.012.197-.012.197-.34.013-.668.05-.668.381 0 .132.096.267.322.267.492 0 .717-.21.717-.508 0-.315-.077-.408-.14-.438-.063-.03-.277-.13-.277-.13s.196-.05.275-.088c.793-.038 1.596-.047 2.387-.011.08.037.218.06.218.06s-.196.098-.277.13c-.08.032-.156.121-.156.438 0 .297.225.508.718.508.225 0 .322-.135.322-.267 0-.332-.328-.368-.668-.381 0 0-.012-.063-.012-.197 0-.146.193-.247.543-.395.35-.149.767-.375.847-.463.08-.088.09-.216.09-.931 0-.347-.25-.623-.746-.734-2.27-1.02-3.826-1.69-4.604-2.014-.138-.058-.21-.09-.288-.09-.077 0-.15.032-.288.09z'
    },
    i18nKey: 'reddit',
    description: 'Browse Reddit posts and communities'
  },
  {
    id: 'calculator',
    name: 'Calculator', 
    route: '/calculator',
    routeName: 'Calculator',
    icon: {
      viewBox: '0 0 16 16',
      path: 'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z'
    },
    i18nKey: 'calculator',
    description: 'Simple and powerful calculator'
  },
  // {
  //   id: 'calculator2',
  //   name: 'Calculator2', 
  //   route: '/calculator2',
  //   routeName: 'Calculator2',
  //   icon: {
  //     viewBox: '0 0 16 16',
  //     path: 'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z'
  //   },
  //   i18nKey: 'calculator',
  //   description: 'Simple and powerful calculator'
  // }
  // 在这里添加新工具，例如：
  // {
  //   id: 'todolist',
  //   name: 'Todo List',
  //   route: '/todolist', 
  //   routeName: 'TodoList',
  //   icon: {
  //     viewBox: '0 0 16 16',
  //     path: '...'
  //   },
  //   i18nKey: 'todolist',
  //   description: 'Manage your tasks'
  // }
]

// 获取所有工具
export const getAllTools = () => tools

// 根据ID获取工具
export const getToolById = (id) => tools.find(tool => tool.id === id)

// 根据路由名获取工具
export const getToolByRouteName = (routeName) => tools.find(tool => tool.routeName === routeName)

// 添加新工具的辅助函数
export const addTool = (toolConfig) => {
  // 验证必要字段
  const requiredFields = ['id', 'name', 'route', 'routeName', 'icon', 'i18nKey']
  for (const field of requiredFields) {
    if (!toolConfig[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  // 检查ID是否已存在
  if (getToolById(toolConfig.id)) {
    throw new Error(`Tool with id "${toolConfig.id}" already exists`)
  }
  
  tools.push(toolConfig)
  return toolConfig
} 