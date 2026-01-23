<template>
  <div class="interviewer-avatar">
    <div class="avatar-container">
      <div class="avatar-image">
        <span class="avatar-emoji">👨‍💼</span>
      </div>
      <div class="avatar-indicator" :class="{ 'typing': isTyping }">
        <span v-if="isTyping">...</span>
        <span v-else>💬</span>
      </div>
    </div>

    <div class="message-bubble" v-if="message">
      <div class="message-header">
        <span class="message-label">면접관</span>
      </div>
      <div class="message-content">
        <p class="message-text">{{ displayedMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  message: String,
  isTyping: Boolean
});

const displayedMessage = ref('');

// 타이핑 애니메이션
const typeMessage = () => {
  if (!props.message) return;
  
  displayedMessage.value = '';
  let index = 0;
  
  const interval = setInterval(() => {
    if (index < props.message.length) {
      displayedMessage.value += props.message[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
};

watch(() => props.message, (newMessage) => {
  if (newMessage && !props.isTyping) {
    typeMessage();
  }
});

onMounted(() => {
  if (props.message && !props.isTyping) {
    typeMessage();
  }
});
</script>

<style scoped>
.interviewer-avatar {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.avatar-emoji {
  font-size: 2rem;
}

.avatar-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4ade80;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 2px solid #0d1117;
}

.avatar-indicator.typing {
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.message-bubble {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.message-header {
  margin-bottom: 0.5rem;
}

.message-label {
  background: rgba(102, 126, 234, 0.3);
  color: #a5b4fc;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.message-content {
  color: white;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}
</style>
