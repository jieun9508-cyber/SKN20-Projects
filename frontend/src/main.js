// 수정일: 2026-01-21
// 수정내용: Vue 앱 엔트리 포인트 설정 (Pinia, Router 초기화, Logic Mirror 추가)

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import CodePracticeLogicMirror from './features/practice/CodePracticeLogicMirror.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/practice/logic-mirror',
    name: 'CodePracticeLogicMirror',
    component: CodePracticeLogicMirror
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
