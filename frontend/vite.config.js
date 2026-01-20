// 수정일: 2026-01-20
// 수정내용: Vite 설정 파일 구성 (Vue 플러그인 적용, 개발 서버 호스트 설정, index.html -> main.html 변경 빌드 설정)

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Docker 환경 접속 허용
    port: 5173,
    // [수정일: 2026-01-21] 백엔드 API와의 연동을 위한 Proxy 설정 추가 (404 에러 해결)
    proxy: {
      '/api': {
        target: process.env.VITE_API_Target || 'http://backend:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'main.html'),
      },
    },
  }
})
