// 수정일: 2026-01-20
// 수정내용: Vue 앱 엔트리 포인트 설정 (Pinia, Router 초기화)

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
