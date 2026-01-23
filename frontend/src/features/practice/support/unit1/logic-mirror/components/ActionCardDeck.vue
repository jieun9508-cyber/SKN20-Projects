<template>
  <div class="action-card-deck">
    <h3 class="deck-title">💭 사고 카드 선택</h3>
    <p class="deck-hint">카드를 드래그해서 아래 보드에 배치하세요</p>
    
    <div class="cards-list">
      <div 
        v-for="card in availableCards" 
        :key="card.id"
        class="action-card"
        :class="`card-${card.color}`"
        draggable="true"
        @dragstart="handleDragStart(card)"
        @dragend="handleDragEnd"
      >
        <div class="card-icon">{{ card.icon }}</div>
        <div class="card-content">
          <div class="card-action">{{ card.action }}</div>
          <div class="card-intent">{{ card.intent }}</div>
        </div>
        <div v-if="card.condition" class="card-condition">
          {{ card.condition === 'loop' ? '🔁' : '❓' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['dragstart', 'dragend']);

defineProps({
  availableCards: Array
});

const handleDragStart = (card) => {
  emit('dragstart', card);
};

const handleDragEnd = () => {
  emit('dragend');
};
</script>

<style scoped>
.action-card-deck {
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.deck-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.deck-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: grab;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.action-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.card-blue {
  border-left: 4px solid #60a5fa;
}

.card-purple {
  border-left: 4px solid #a78bfa;
}

.card-green {
  border-left: 4px solid #4ade80;
}

.card-orange {
  border-left: 4px solid #fb923c;
}

.card-pink {
  border-left: 4px solid #f472b6;
}

.card-red {
  border-left: 4px solid #f87171;
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

.card-condition {
  background: rgba(255, 255, 255, 0.1);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
</style>
