import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 默认 base 为 '/'（本地开发 / 自定义域名）
// GitHub Pages 项目站点部署时，在构建环境设置 VITE_GH_PAGES=1，base 自动取仓库名
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const base = env.VITE_GH_PAGES === '1' ? '/bitcoin-academy/' : '/'
  return {
    base,
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 700,
      // 课程内容体积较大，拆成独立 chunk：框架代码缓存稳定，
      // 课程更新时用户只需重新下载数据块；多文件并行下载也利于手机端首屏。
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/src/data/')) return 'course-data'
              return
            }
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
            return
          },
        },
      },
    },
  }
})
