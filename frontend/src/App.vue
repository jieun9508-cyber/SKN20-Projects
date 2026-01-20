<!-- 
수정일: 2026-01-20
수정내용: 메인 App 컴포넌트 업데이트 - 6명의 담당 기능을 모두 화면에 표시
-->
<template>
  <div class="app-container">
    <h1>SKN20-FINAL-5TEAM Project</h1>
    <p>6명의 개발자가 충돌 없이 협업하기 위한 화면 구성 예시입니다.</p>
    
    <div class="grid-container">
      <!-- 담당자 A 영역 -->
      <UserLogin />
      
      <!-- 담당자 B 영역 -->
      <ProductList />
      
      <!-- 담당자 C 영역 -->
      <OrderCart />
      
      <!-- 담당자 D 영역 -->
      <NoticeBoard />
      
      <!-- 담당자 E 영역 -->
      <ReviewForm />
      
      <!-- 담당자 F 영역 -->
      <AdminStats />
    </div>
  </div>
</template>

<script setup>
// 각 담당자가 만든 컴포넌트를 import 합니다.
// 파일 경로가 다르기 때문에 서로의 코드를 건드릴 일이 없습니다.

import UserLogin from './features/user/UserLogin.vue'          // Member A
import ProductList from './features/product/ProductList.vue'    // Member B
import OrderCart from './features/order/OrderCart.vue'        // Member C
import NoticeBoard from './features/board/NoticeBoard.vue'      // Member D
import ReviewForm from './features/review/ReviewForm.vue'       // Member E
import AdminStats from './features/dashboard/AdminStats.vue'    // Member F
</script>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 2rem;
}

.feature-box {
  padding: 2rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.feature-box:hover {
  transform: translateY(-5px);
}

h3 { margin-top: 0; }
</style>
