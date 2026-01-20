<!-- 
수정일: 2026-01-20
수정내용: 파일 분리 협업을 위한 기능별 컴포넌트 예시 (SampleFeature)
-->
<template>
  <div class="sample-feature">
    <h2>Sample Feature Section</h2>
    <p>이 파일은 Feature별로 나뉘어 있어 다른 개발자와의 충돌을 방지합니다.</p>
    <button @click="count++">Count is: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.sample-feature {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
