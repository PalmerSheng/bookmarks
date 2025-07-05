import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  // 根据模式加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    
    // 定义全局常量，可以在代码中使用
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
      __DEBUG_MODE__: JSON.stringify(env.VITE_DEBUG_MODE === 'true'),
      __ENABLE_ANALYTICS__: JSON.stringify(env.VITE_ENABLE_ANALYTICS === 'true'),
      __ENABLE_ERROR_REPORTING__: JSON.stringify(env.VITE_ENABLE_ERROR_REPORTING === 'true'),
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // 生产环境优化配置
      minify: mode === 'production' ? 'terser' : false,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: mode === 'production' ? {
            vendor: ['vue', 'vue-router', 'pinia'],
            clerk: ['@clerk/vue'],
            utils: ['axios', 'vue-i18n']
          } : undefined
        }
      }
    },
    
    server: {
      port: getPortByMode(mode),
      open: mode === 'development',
      proxy: {
        '/api/supabase': {
          target: env.VITE_SUPABASE_URL?.replace('/functions/v1/clever-action', '') || 'https://husdiczqouillhvovodl.supabase.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.VITE_DEBUG_MODE === 'true') {
                console.log('Sending Request to the Target:', req.method, req.url);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              if (env.VITE_DEBUG_MODE === 'true') {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              }
            });
          },
        }
      }
    }
  }
})

// 根据模式获取端口号
function getPortByMode(mode) {
  switch (mode) {
    case 'development':
      return 3000
    case 'test':
      return 3001
    case 'production':
      return 3002
    default:
      return 3000
  }
} 