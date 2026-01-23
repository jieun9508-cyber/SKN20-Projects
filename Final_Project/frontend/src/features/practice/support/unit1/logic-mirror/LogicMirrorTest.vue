<template>
  <div class="test-container">
    <h1>🎮 Logic Mirror Test</h1>
    <p>라우터 연결 테스트 중...</p>
    <button @click="testClick">버튼 클릭 테스트</button>
    <div v-if="clicked" class="success">✅ 컴포넌트가 정상 작동합니다!</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const clicked = ref(false);

const testClick = () => {
  clicked.value = true;
  console.log('Logic Mirror 컴포넌트 정상 작동!');
};
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  color: white;
}

h1 {
  font-size: 3rem;
  margin: 0;
}

p {
  font-size: 1.5rem;
  margin: 0;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.success {
  background: rgba(74, 222, 128, 0.2);
  border: 2px solid #4ade80;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
}
</style>
