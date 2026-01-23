<template>
  <div class="situation-world">
    <div class="world-header">
      <h2 class="world-title">{{ situation.title }}</h2>
      <p class="world-desc">{{ situation.description }}</p>
    </div>

    <div class="world-visual">
      <div class="milks-container">
        <div 
          v-for="milk in worldState.milks" 
          :key="milk.id"
          class="milk-item"
          :class="{ 
            'current': milk.position === worldState.currentIndex,
            'checked': worldState.checked.includes(milk.id),
            'best': worldState.bestChoice === milk.id
          }"
        >
          <div class="milk-icon">🥛</div>
          <div class="milk-name">{{ milk.name }}</div>
          <div class="milk-expiry">D-{{ milk.expiry }}</div>
          <div v-if="worldState.bestChoice === milk.id" class="best-badge">최선</div>
        </div>
      </div>
    </div>

    <div class="world-goal">
      <span class="goal-icon">🎯</span>
      <span class="goal-text">{{ situation.goal }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  situation: Object,
  worldState: Object
});
</script>

<style scoped>
.situation-world {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(30, 60, 114, 0.3);
  margin-bottom: 1.5rem;
}

.world-header {
  text-align: center;
  margin-bottom: 2rem;
}

.world-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.world-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.6;
}

.world-visual {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.milks-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.milk-item {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.milk-item.current {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  transform: scale(1.05);
}

.milk-item.checked {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
}

.milk-item.best {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.3));
  border-color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
}

.milk-icon {
  font-size: 3rem;
}

.milk-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.milk-expiry {
  background: rgba(255, 82, 82, 0.8);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.best-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #1e3c72;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.world-goal {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.goal-icon {
  font-size: 1.5rem;
}

.goal-text {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}
</style>
