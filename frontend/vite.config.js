// 수정일: 2026-01-20
// 수정내용: Vite 설정 파일 구성 (Vue 플러그인 적용 및 개발 서버 호스트 설정)

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
  }
})
