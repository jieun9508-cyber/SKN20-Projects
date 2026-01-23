<template>
  <div class="thinking-board">
    <div class="board-header">
      <h3 class="board-title">🧠 내 사고 순서</h3>
      <button @click="$emit('clear')" class="clear-btn" v-if="sequence.length > 0">
        🗑️ 초기화
      </button>
    </div>

    <div 
      class="drop-zone"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      :class="{ 'drag-over': isDragOver }"
    >
      <div v-if="sequence.length === 0" class="empty-state">
        <div class="empty-icon">✨</div>
        <p class="empty-text">여기에 카드를 드래그하세요</p>
      </div>

      <div v-else class="sequence-list">
        <div 
          v-for="(card, index) in sequence" 
          :key="`${card.id}-${index}`"
          class="sequence-card"
          :class="`card-${card.color}`"
        >
          <div class="sequence-number">{{ index + 1 }}</div>
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-content">
            <div class="card-action">{{ card.action }}</div>
            <div class="card-intent">{{ card.intent }}</div>
          </div>
          <button @click="removeCard(index)" class="remove-btn">✕</button>
        </div>
      </div>
    </div>

    <button 
      @click="$emit('execute')" 
      class="execute-btn"
      :disabled="sequence.length === 0"
      v-if="sequence.length > 0"
    >
      <span class="btn-icon">▶️</span>
      <span class="btn-text">사고 시뮬레이션 실행</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  sequence: Array
});

const emit = defineEmits(['add-card', 'remove-card', 'clear', 'execute']);

const isDragOver = ref(false);

const handleDrop = (e) => {
  isDragOver.value = false;
  e.preventDefault();
};

const removeCard = (index) => {
  emit('remove-card', index);
};

// 외부에서 카드 추가를 처리하도록 이벤트만 발생
defineExpose({
  addCard: (card) => emit('add-card', card)
});
</script>

<style scoped>
.thinking-board {
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.board-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
}

.clear-btn {
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(248, 113, 113, 0.3);
}

.drop-zone {
  flex: 1;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  min-height: 300px;
  transition: all 0.3s ease;
  overflow-y: auto;
}

.drop-zone.drag-over {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.empty-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

.sequence-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sequence-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sequence-card.card-blue { border-left: 4px solid #60a5fa; }
.sequence-card.card-purple { border-left: 4px solid #a78bfa; }
.sequence-card.card-green { border-left: 4px solid #4ade80; }
.sequence-card.card-orange { border-left: 4px solid #fb923c; }
.sequence-card.card-pink { border-left: 4px solid #f472b6; }
.sequence-card.card-red { border-left: 4px solid #f87171; }

.sequence-number {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-action {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.card-intent {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.remove-btn {
  background: rgba(248, 113, 113, 0.2);
  border: none;
  color: #f87171;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(248, 113, 113, 0.4);
  transform: scale(1.1);
}

.execute-btn {
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.execute-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.execute-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-text {
  font-size: 1rem;
}
</style>
