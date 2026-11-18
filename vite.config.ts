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
    },
  }
})
