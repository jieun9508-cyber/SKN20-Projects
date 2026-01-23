<template>
  <div class="simulation-panel">
    <h3 class="panel-title">📊 시뮬레이션 결과</h3>

    <div class="log-container" v-if="logs.length > 0">
      <div 
        v-for="(log, index) in logs" 
        :key="index"
        class="log-entry"
        :class="`log-${log.type}`"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="log-icon">{{ log.icon }}</div>
        <div class="log-content">
          <div class="log-text">{{ log.message }}</div>
          <div v-if="log.detail" class="log-detail">{{ log.detail }}</div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">🎯</div>
      <p class="empty-text">사고를 구성하고 실행 버튼을 눌러보세요</p>
    </div>

    <!-- Interviewer Section -->
    <div class="interviewer-section" v-if="interviewerMessage">
      <InterviewerAvatar 
        :message="interviewerMessage"
        :isTyping="isInterviewerTyping"
      />
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons" v-if="showActions">
      <button @click="$emit('retry')" class="action-btn secondary">
        <span>🔄</span>
        <span>다시 구성하기</span>
      </button>
      <button @click="$emit('next-round')" class="action-btn primary">
        <span>✨</span>
        <span>다음 라운드</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import InterviewerAvatar from './InterviewerAvatar.vue';

defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  interviewerMessage: String,
  isInterviewerTyping: Boolean,
  showActions: Boolean
});

defineEmits(['retry', 'next-round']);
</script>

<style scoped>
.simulation-panel {
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0;
}

.log-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.log-entry {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  animation: fadeInUp 0.5s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.log-entry.log-success {
  border-left: 4px solid #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.log-entry.log-error {
  border-left: 4px solid #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.log-entry.log-warning {
  border-left: 4px solid #fb923c;
  background: rgba(251, 146, 60, 0.1);
}

.log-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.log-text {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.log-detail {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.empty-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
  text-align: center;
}

.interviewer-section {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  border: none;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}
</style>
