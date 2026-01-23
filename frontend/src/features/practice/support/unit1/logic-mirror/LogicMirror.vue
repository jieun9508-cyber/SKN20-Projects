<template>
  <!-- Loading State -->
  <div v-if="!currentQuest" class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner">🎮</div>
      <p class="loading-text">게임을 준비하고 있습니다...</p>
    </div>
  </div>

  <!-- Game Content -->
  <div class="logic-mirror-pipeline" v-else>
    <!-- Pipeline Progress Bar -->
    <div class="pipeline-progress">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in pipelineSteps" 
          :key="index"
          class="progress-step"
          :class="{ 
            'active': currentStepIndex === index,
            'completed': currentStepIndex > index
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>
    </div>

    <!-- Step 1: Problem & Interviewer Q&A -->
    <div v-if="currentStepIndex === 0" class="pipeline-step problem-step">
      <div class="step-container">
        <div class="problem-header">
          <div class="problem-emoji">{{ currentQuest.emoji }}</div>
          <div class="problem-info">
            <h1 class="problem-title">{{ currentQuest.title }}</h1>
            <p class="problem-description">{{ currentQuest.description }}</p>
            <div class="problem-meta">
              <span class="logic-type">{{ currentQuest.logic_type }}</span>
              <span class="level-badge">LV {{ currentQuest.level }}</span>
            </div>
          </div>
        </div>

        <div class="examples-box">
          <h3>📝 예제 입출력</h3>
          <pre>{{ currentQuest.examples }}</pre>
        </div>

        <div class="interviewer-intro">
          <div class="interviewer-avatar">👨‍💼</div>
          <div class="interviewer-bubble">
            <div class="interviewer-label">면접관</div>
            <p>"이 문제를 어떻게 해결하시겠어요? 단계별로 나눠서 생각해보세요."</p>
          </div>
        </div>

        <button @click="goToNextStep" class="next-step-btn">
          <span>수도코드 작성하기 →</span>
        </button>
      </div>
    </div>

    <!-- Step 2: Pseudo Code Interface -->
    <div v-if="currentStepIndex === 1" class="pipeline-step pseudocode-step">
      <div class="step-container">
        <h2 class="step-title">📝 수도코드로 풀이 과정 표현하기</h2>
        <p class="step-subtitle">카드를 드래그해서 올바른 순서로 배치하세요</p>

        <div class="pseudocode-layout">
          <!-- Card Deck -->
          <div class="card-deck-section">
            <h3 class="section-title">🎴 사용 가능한 블록</h3>
            <div class="cards-list">
              <div 
                v-for="card in currentQuest.cards" 
                :key="card.id"
                class="action-card"
                :class="`card-${card.color}`"
                draggable="true"
                @dragstart="handleDragStart(card)"
                @dragend="handleDragEnd"
              >
                <div class="card-icon">{{ card.icon }}</div>
                <div class="card-content">
                  <div class="card-text">{{ card.text_ko }}</div>
                  <div class="card-code">{{ card.text_py }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Drop Zone -->
          <div class="drop-zone-section">
            <div class="section-header">
              <h3 class="section-title">🧠 내가 구성한 순서</h3>
              <button v-if="userSequence.length > 0" @click="clearSequence" class="clear-btn">
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
              <div v-if="userSequence.length === 0" class="empty-state">
                <div class="empty-icon">✨</div>
                <p>왼쪽에서 카드를 드래그해서 순서를 만드세요</p>
              </div>

              <div v-else class="sequence-list">
                <div 
                  v-for="(card, index) in userSequence" 
                  :key="`${card.id}-${index}`"
                  class="sequence-card"
                  :class="`card-${card.color}`"
                  :style="{ marginLeft: (card.indent || 0) * 30 + 'px' }"
                >
                  <div class="seq-number">{{ index + 1 }}</div>
                  <div class="card-icon">{{ card.icon }}</div>
                  <div class="card-text">{{ card.text_ko }}</div>
                  <button @click="removeCard(index)" class="remove-btn">✕</button>
                </div>
              </div>
            </div>

            <button 
              v-if="userSequence.length > 0"
              @click="goToNextStep" 
              class="submit-btn"
            >
              제출하기 →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Pre-submission Query -->
    <div v-if="currentStepIndex === 2" class="pipeline-step query-step">
      <div class="step-container">
        <h2 class="step-title">🤔 제출 전 확인</h2>
        
        <div class="submitted-code-box">
          <h3>제출한 수도코드</h3>
          <div class="code-preview">
            <div 
              v-for="(card, index) in userSequence" 
              :key="index"
              class="code-line"
              :style="{ paddingLeft: (card.indent || 0) * 20 + 'px' }"
            >
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-code">{{ card.text_py }}</span>
            </div>
          </div>
        </div>

        <div class="interviewer-questions">
          <div class="interviewer-avatar">👨‍💼</div>
          <div class="question-bubble">
            <div class="interviewer-label">면접관</div>
            <p class="question-text">{{ preSubmissionQuestion }}</p>
            
            <div class="answer-options">
              <button 
                v-for="(option, index) in answerOptions" 
                :key="index"
                @click="selectAnswer(index)"
                class="option-btn"
                :class="{ 'selected': selectedAnswer === index }"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="goToPreviousStep" class="back-btn">← 수정하기</button>
          <button 
            @click="submitAndCheck" 
            class="confirm-btn"
            :disabled="selectedAnswer === null"
          >
            최종 제출
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Real Implementation (Optional) -->
    <div v-if="currentStepIndex === 3" class="pipeline-step implementation-step">
      <div class="step-container">
        <div class="result-header" :class="isCorrect ? 'success' : 'failure'">
          <div class="result-icon">{{ isCorrect ? '🎉' : '🤔' }}</div>
          <div class="result-content">
            <h2>{{ feedbackMessage }}</h2>
            <p class="hint-text" v-if="hintMessage">💡 {{ hintMessage }}</p>
          </div>
        </div>

        <div v-if="isCorrect" class="implementation-section">
          <h3>💻 실제 코드로 구현해볼까요? (선택)</h3>
          <p class="section-desc">수도코드를 실제 파이썬 코드로 작성해보세요</p>
          
          <div class="code-editor">
            <div class="editor-header">
              <span>Python 3</span>
            </div>
            <textarea 
              v-model="userCode" 
              class="code-textarea"
              placeholder="# 여기에 파이썬 코드를 작성하세요..."
              spellcheck="false"
            ></textarea>
          </div>

          <div class="implementation-actions">
            <button @click="skipImplementation" class="skip-btn">건너뛰기</button>
            <button @click="runCode" class="run-btn">▶ 실행하기</button>
          </div>
        </div>

        <div v-else class="retry-section">
          <button @click="retry" class="retry-btn">다시 시도하기</button>
        </div>
      </div>
    </div>

    <!-- Step 5: Follow-up Questioning -->
    <div v-if="currentStepIndex === 4" class="pipeline-step followup-step">
      <div class="step-container">
        <div class="completion-header">
          <div class="completion-icon">🎉</div>
          <h1 class="completion-title">문제 완료!</h1>
        </div>

        <div class="interviewer-followup">
          <div class="interviewer-avatar">👨‍💼</div>
          <div class="followup-bubble">
            <div class="interviewer-label">면접관</div>
            <p class="followup-question">{{ followupQuestion }}</p>
          </div>
        </div>

        <div class="learning-summary">
          <h3>📚 이번 문제에서 배운 점</h3>
          <ul class="learning-points">
            <li v-for="(point, index) in learningPoints" :key="index">
              {{ point }}
            </li>
          </ul>
        </div>

        <div class="navigation-buttons">
          <button v-if="!isLastQuest" @click="goToNextQuest" class="next-quest-btn">
            다음 문제 →
          </button>
          <button v-else @click="completeAll" class="complete-btn">
            전체 완료! 🏆
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { gameData } from './data/stages.js';

// Pipeline Steps
const pipelineSteps = [
  'Problem & Q&A',
  'Pseudo Code',
  'Pre-submission',
  'Implementation',
  'Follow-up'
];

// Game State
const currentStepIndex = ref(0);
const currentQuestIndex = ref(0);
const currentQuest = ref(null);
const userSequence = ref([]);
const selectedAnswer = ref(null);
const userCode = ref('');
const isCorrect = ref(false);
const feedbackMessage = ref('');
const hintMessage = ref('');
const isDragOver = ref(false);
const draggedCard = ref(null);

// Computed
const isLastQuest = computed(() => currentQuestIndex.value === gameData.quests.length - 1);

const preSubmissionQuestion = computed(() => {
  return "이 순서를 선택한 이유를 설명해주세요.";
});

const answerOptions = computed(() => {
  return [
    "순서대로 실행되어야 하기 때문입니다",
    "조건에 맞을 때만 실행되어야 합니다",
    "반복해서 실행되어야 합니다",
    "확실하지 않습니다"
  ];
});

const followupQuestion = computed(() => {
  const question = currentQuest.value?.interviewQuestions?.[0];
  return question?.question || "잘하셨습니다! 다음 문제로 넘어가볼까요?";
});

const learningPoints = computed(() => {
  return [
    currentQuest.value?.feedback?.hint || "문제 해결 과정을 단계별로 나눠서 생각하기",
    "수도코드로 로직을 먼저 설계하기",
    "각 단계의 순서와 의미 이해하기"
  ];
});

// Initialize
const initGame = () => {
  console.log('[DEBUG] initGame called');
  console.log('[DEBUG] gameData:', gameData);
  console.log('[DEBUG] gameData.quests:', gameData.quests);
  console.log('[DEBUG] gameData.quests.length:', gameData.quests?.length);
  
  try {
    if (!gameData || !gameData.quests || gameData.quests.length === 0) {
      console.error('[ERROR] gameData is invalid:', gameData);
      alert('게임 데이터를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }
    loadQuest(0);
  } catch (error) {
    console.error('[ERROR] initGame failed:', error);
    alert('게임 초기화 실패: ' + error.message);
  }
};

const loadQuest = (index) => {
  console.log('[DEBUG] loadQuest called with index:', index);
  try {
    if (!gameData.quests[index]) {
      console.error('[ERROR] Quest not found at index:', index);
      return;
    }
    currentQuestIndex.value = index;
    currentQuest.value = gameData.quests[index];
    console.log('[DEBUG] currentQuest loaded:', currentQuest.value);
    resetState();
  } catch (error) {
    console.error('[ERROR] loadQuest failed:', error);
  }
};

const resetState = () => {
  currentStepIndex.value = 0;
  userSequence.value = [];
  selectedAnswer.value = null;
  userCode.value = '';
  isCorrect.value = false;
  feedbackMessage.value = '';
  hintMessage.value = '';
};

// Navigation
const goToNextStep = () => {
  if (currentStepIndex.value < pipelineSteps.length - 1) {
    currentStepIndex.value++;
  }
};

const goToPreviousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const goToNextQuest = () => {
  if (!isLastQuest.value) {
    loadQuest(currentQuestIndex.value + 1);
  }
};

const completeAll = () => {
  alert('🎉 모든 문제를 완료했습니다! Logic Mirror 마스터!');
};

// Drag & Drop
const handleDragStart = (card) => {
  draggedCard.value = card;
};

const handleDragEnd = () => {
  draggedCard.value = null;
  isDragOver.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragOver.value = false;
  
  if (draggedCard.value) {
    userSequence.value.push({ ...draggedCard.value });
    draggedCard.value = null;
  }
};

const removeCard = (index) => {
  userSequence.value.splice(index, 1);
};

const clearSequence = () => {
  userSequence.value = [];
};

// Answer Selection
const selectAnswer = (index) => {
  selectedAnswer.value = index;
};

// Submission
const submitAndCheck = () => {
  const userOrder = userSequence.value.map(card => card.id);
  const correctOrder = currentQuest.value.correctSequence;
  
  isCorrect.value = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
  
  if (isCorrect.value) {
    feedbackMessage.value = currentQuest.value.feedback?.success || '정답입니다!';
    hintMessage.value = '';
  } else {
    feedbackMessage.value = currentQuest.value.feedback?.failure || '다시 생각해보세요';
    hintMessage.value = currentQuest.value.feedback?.hint || '';
  }
  
  goToNextStep();
};

const skipImplementation = () => {
  goToNextStep();
};

const runCode = () => {
  // TODO: Code execution logic
  alert('코드 실행 기능은 준비 중입니다!');
  goToNextStep();
};

const retry = () => {
  currentStepIndex.value = 1; // Go back to pseudo code step
};

onMounted(() => {
  initGame();
});
</script>

<style scoped>
.loading-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  font-size: 5rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 1.2rem;
  margin-top: 1rem;
  opacity: 0.8;
}

.logic-mirror-pipeline {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%);
  padding: 2rem;
}

.pipeline-progress {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.progress-step.completed .step-number {
  background: #4ade80;
  border-color: #4ade80;
  color: white;
}

.step-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  font-weight: 600;
}

.progress-step.active .step-label {
  color: white;
}

.pipeline-step {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Problem Step */
.problem-header {
  display: flex;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.problem-emoji {
  font-size: 5rem;
}

.problem-info {
  flex: 1;
}

.problem-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
}

.problem-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.problem-meta {
  display: flex;
  gap: 1rem;
}

.logic-type,
.level-badge {
  background: rgba(102, 126, 234, 0.3);
  color: #a5b4fc;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 700;
}

.level-badge {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

.examples-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.examples-box h3 {
  color: white;
  margin: 0 0 1rem 0;
}

.examples-box pre {
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  margin: 0;
}

.interviewer-intro {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.interviewer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  flex-shrink: 0;
}

.interviewer-bubble {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
}

.interviewer-label {
  background: rgba(102, 126, 234, 0.3);
  color: #a5b4fc;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 0.75rem;
}

.interviewer-bubble p {
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.next-step-btn,
.submit-btn,
.confirm-btn,
.next-quest-btn,
.complete-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  width: 100%;
}

.next-step-btn:hover,
.submit-btn:hover,
.confirm-btn:hover,
.next-quest-btn:hover,
.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

/* Pseudo Code Step */
.step-title {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.pseudocode-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.card-deck-section,
.drop-zone-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 600px;
  overflow-y: auto;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  cursor: grab;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.action-card:active {
  cursor: grabbing;
}

.card-blue { border-left: 4px solid #60a5fa; }
.card-purple { border-left: 4px solid #a78bfa; }
.card-green { border-left: 4px solid #4ade80; }
.card-orange { border-left: 4px solid #fb923c; }
.card-red { border-left: 4px solid #f87171; }
.card-pink { border-left: 4px solid #f472b6; }

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-text {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.card-code {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
}

.drop-zone {
  min-height: 400px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
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
  height: 400px;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
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
  gap: 0.75rem;
  align-items: center;
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

.seq-number {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.remove-btn,
.clear-btn {
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover,
.clear-btn:hover {
  background: rgba(248, 113, 113, 0.3);
}

.remove-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  flex-shrink: 0;
}

/* Pre-submission Query */
.submitted-code-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.submitted-code-box h3 {
  color: white;
  margin: 0 0 1rem 0;
}

.code-preview {
  background: #0d1117;
  border-radius: 0.5rem;
  padding: 1.5rem;
  font-family: 'Courier New', monospace;
}

.code-line {
  display: flex;
  gap: 1rem;
  color: white;
  font-size: 0.95rem;
  line-height: 1.8;
}

.line-number {
  color: rgba(255, 255, 255, 0.3);
  min-width: 30px;
  text-align: right;
}

.line-code {
  flex: 1;
}

.interviewer-questions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.question-bubble {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
}

.question-text {
  color: white;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.option-btn.selected {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.back-btn,
.skip-btn,
.retry-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.back-btn:hover,
.skip-btn:hover,
.retry-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-btn {
  flex: 2;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Implementation Step */
.result-header {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.result-header.success {
  background: rgba(74, 222, 128, 0.1);
  border: 2px solid #4ade80;
}

.result-header.failure {
  background: rgba(251, 146, 60, 0.1);
  border: 2px solid #fb923c;
}

.result-icon {
  font-size: 4rem;
}

.result-content h2 {
  color: white;
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
}

.hint-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
}

.implementation-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
}

.implementation-section h3 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
}

.code-editor {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.editor-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.code-textarea {
  width: 100%;
  min-height: 300px;
  background: transparent;
  border: none;
  color: white;
  padding: 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
}

.code-textarea:focus {
  outline: none;
}

.implementation-actions {
  display: flex;
  gap: 1rem;
}

.run-btn {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.run-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
}

/* Follow-up Step */
.completion-header {
  text-align: center;
  margin-bottom: 3rem;
}

.completion-icon {
  font-size: 6rem;
  margin-bottom: 1rem;
}

.completion-title {
  color: white;
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}

.interviewer-followup {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.followup-bubble {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
}

.followup-question {
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0;
}

.learning-summary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.learning-summary h3 {
  color: white;
  margin: 0 0 1rem 0;
}

.learning-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.learning-points li {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  padding: 0.75rem 0;
  padding-left: 2rem;
  position: relative;
}

.learning-points li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4ade80;
  font-weight: 700;
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
}

@media (max-width: 1024px) {
  .pseudocode-layout {
    grid-template-columns: 1fr;
  }
}
</style>
