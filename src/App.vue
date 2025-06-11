<template>
  <div id="app">
    <div class="container">
      <!-- 头部 -->
      <header class="header">
        <h1>🔖 我的书签</h1>
        <p>个人导航网站 - 快速访问你的收藏</p>
      </header>

      <!-- 搜索框 -->
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索书签..." 
          v-model="searchQuery"
          @input="filterBookmarks"
        >
        <span class="search-icon">🔍</span>
      </div>

      <!-- 书签分类 -->
      <div class="categories">
        <div 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="category"
        >
          <div class="category-title">
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </div>
          <div class="bookmarks">
            <a 
              v-for="bookmark in category.bookmarks" 
              :key="bookmark.id"
              :href="bookmark.url"
              target="_blank"
              class="bookmark"
            >
              <div class="bookmark-icon">
                {{ bookmark.icon }}
              </div>
              <div class="bookmark-info">
                <div class="bookmark-title">{{ bookmark.title }}</div>
                <div class="bookmark-url">{{ bookmark.description }}</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <footer class="footer">
        <p>© 2024 我的书签网站 | 让网络导航更简单</p>
      </footer>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const searchQuery = ref('')
    
    // 书签数据
    const categories = ref([
      {
        id: 1,
        name: '搜索引擎',
        icon: '🔍',
        bookmarks: [
          {
            id: 1,
            title: 'Google',
            url: 'https://www.google.com',
            description: '全球最大的搜索引擎',
            icon: 'G'
          },
          {
            id: 2,
            title: '百度',
            url: 'https://www.baidu.com',
            description: '中国最大的搜索引擎',
            icon: '百'
          },
          {
            id: 3,
            title: 'Bing',
            url: 'https://www.bing.com',
            description: '微软搜索引擎',
            icon: 'B'
          }
        ]
      },
      {
        id: 2,
        name: '社交媒体',
        icon: '💬',
        bookmarks: [
          {
            id: 4,
            title: '微博',
            url: 'https://weibo.com',
            description: '中国社交媒体平台',
            icon: '微'
          },
          {
            id: 5,
            title: 'Twitter',
            url: 'https://twitter.com',
            description: '全球社交媒体平台',
            icon: 'T'
          },
          {
            id: 6,
            title: '知乎',
            url: 'https://www.zhihu.com',
            description: '中文问答社区',
            icon: '知'
          }
        ]
      },
      {
        id: 3,
        name: '开发工具',
        icon: '⚡',
        bookmarks: [
          {
            id: 7,
            title: 'GitHub',
            url: 'https://github.com',
            description: '代码托管平台',
            icon: 'G'
          },
          {
            id: 8,
            title: 'Stack Overflow',
            url: 'https://stackoverflow.com',
            description: '程序员问答社区',
            icon: 'S'
          },
          {
            id: 9,
            title: 'MDN',
            url: 'https://developer.mozilla.org',
            description: 'Web开发文档',
            icon: 'M'
          },
          {
            id: 10,
            title: 'Vue.js',
            url: 'https://vuejs.org',
            description: 'Vue.js官方文档',
            icon: 'V'
          }
        ]
      },
      {
        id: 4,
        name: '娱乐视频',
        icon: '🎬',
        bookmarks: [
          {
            id: 11,
            title: 'YouTube',
            url: 'https://www.youtube.com',
            description: '全球视频分享平台',
            icon: 'Y'
          },
          {
            id: 12,
            title: 'B站',
            url: 'https://www.bilibili.com',
            description: '中国弹幕视频网站',
            icon: 'B'
          },
          {
            id: 13,
            title: '爱奇艺',
            url: 'https://www.iqiyi.com',
            description: '在线视频平台',
            icon: '爱'
          }
        ]
      },
      {
        id: 5,
        name: '新闻资讯',
        icon: '📰',
        bookmarks: [
          {
            id: 14,
            title: '新浪新闻',
            url: 'https://news.sina.com.cn',
            description: '综合新闻资讯',
            icon: '新'
          },
          {
            id: 15,
            title: '36氪',
            url: 'https://36kr.com',
            description: '科技创业媒体',
            icon: '36'
          },
          {
            id: 16,
            title: 'BBC News',
            url: 'https://www.bbc.com/news',
            description: '英国广播公司新闻',
            icon: 'B'
          }
        ]
      },
      {
        id: 6,
        name: '在线工具',
        icon: '🛠️',
        bookmarks: [
          {
            id: 17,
            title: 'CodePen',
            url: 'https://codepen.io',
            description: '在线代码编辑器',
            icon: 'C'
          },
          {
            id: 18,
            title: 'Can I Use',
            url: 'https://caniuse.com',
            description: '浏览器兼容性查询',
            icon: '?'
          },
          {
            id: 19,
            title: 'JSON格式化',
            url: 'https://jsonformatter.org',
            description: 'JSON在线格式化工具',
            icon: 'J'
          }
        ]
      }
    ])

    // 过滤后的分类
    const filteredCategories = computed(() => {
      if (!searchQuery.value.trim()) {
        return categories.value
      }
      
      const query = searchQuery.value.toLowerCase()
      return categories.value.map(category => ({
        ...category,
        bookmarks: category.bookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(query) ||
          bookmark.description.toLowerCase().includes(query)
        )
      })).filter(category => category.bookmarks.length > 0)
    })

    // 搜索功能
    const filterBookmarks = () => {
      // 搜索逻辑已在computed中实现
    }

    onMounted(() => {
      console.log('书签网站已加载完成')
    })

    return {
      searchQuery,
      categories,
      filteredCategories,
      filterBookmarks
    }
  }
}
</script> 