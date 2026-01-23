<template>
  <div class="stage-header">
    <div class="stage-info">
      <div class="stage-badge">
        <span class="stage-icon">🎮</span>
        <span class="stage-title">{{ stageName }}</span>
      </div>
      <div class="concept-badge">{{ concept }}</div>
    </div>
    
    <div class="round-progress">
      <span class="round-text">Round {{ currentRound }} / {{ totalRounds }}</span>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${(currentRound / totalRounds) * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stageName: String,
  concept: String,
  currentRound: Number,
  totalRounds: Number
});
</script>

<style scoped>
.stage-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stage-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
}

.stage-icon {
  font-size: 1.5rem;
}

.stage-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.concept-badge {
  background: rgba(255, 255, 255, 0.15);
  color: #ffd700;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.round-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.round-text {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 100px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 1rem;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
</style>
