<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <span class="title">Debug Gym: Login Scenario</span>
      </div>

      <div class="header-right">
        <div class="trigger-indicator" :class="{ active: hasTrigger }">
          <template v-if="hasTrigger">
            <span>Trigger: main.py:12</span>
            <button class="clear-trigger-btn" @click="hasTrigger = false">✕</button>
          </template>
          <span v-else style="color: #666;">No trigger set</span>
        </div>

        <button class="btn btn-hint" :disabled="isLoading" @click="mockHint">
          💡 힌트 받기
        </button>
        <button class="btn btn-debug" :disabled="isLoading" @click="mockDebug">
          🐞 디버깅
        </button>
        <button class="btn btn-submit" :disabled="isLoading" @click="mockSubmit">
          🚀 제출
        </button>
      </div>
    </div>

    <div class="main-layout">
      <div class="left-sidebar">
        
        <div class="problem-section">
          <div class="section-header">
            <span class="section-icon">📝</span> Scenario
          </div>
          <div class="problem-content">
            <h3 class="problem-title">로그인 로직 버그 수정</h3>
            <p class="problem-desc">
              사용자가 존재하지 않을 때(None) 시스템이 멈추는 버그가 발견되었습니다.
              모듈 간의 데이터 흐름을 파악하고 안전하게 로그인을 처리하세요.
            </p>
            
            <div class="mission-box">
              <strong>🎯 Mission:</strong>
              <ul>
                <li>`user`가 None일 때 크래시 방지</li>
                <li>올바른 에러 메시지 출력</li>
                <li>정상 유저 로그인 성공 확인</li>
              </ul>
            </div>
          </div>
        </div>

<div class="visual-section">
  <div class="section-header">
    <span class="section-icon">📂</span> Explorer
  </div>
  <div class="explorer-container">
    <div class="explorer-item folder">
      <span class="chevron">▼</span>
      <span class="file-icon">📁</span>
      <span class="file-name">debug-gym-project</span>
    </div>
    
    <div class="explorer-tree">
      <div 
        v-for="(content, filename) in files" 
        :key="filename"
        class="explorer-item file"
        :class="{ active: currentFileName === filename }"
        @click="switchFile(filename)"
      >
        <span class="indent"></span>
        <span class="file-icon">{{ filename.endsWith('.json') ? '📄' : '🐍' }}</span>
        <span class="file-name">{{ filename }}</span>
        <span v-if="isModified && currentFileName === filename" class="modified-dot"></span>
      </div>
    </div>
  </div>
</div>
      </div>

      <div class="right-content">
        <div class="editor-container">
          <div class="editor-tab">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📄 {{ currentFileName }}</span>
              <span v-if="isModified" class="unsaved-dot"></span>
            </div>
            <span v-if="hasTrigger && currentFileName === 'main.py'" style="color: #ffcc00; font-size: 11px;">
              ● Breakpoint at line 12
            </span>
          </div>
          
          <div class="editor-wrapper">
            <div class="line-numbers">
              <div v-for="n in lineCount" :key="n">{{ n }}</div>
            </div>
            <textarea 
              class="code-textarea" 
              v-model="files[currentFileName]" 
              @input="isModified = true"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div class="terminal">
          <div class="terminal-header">
            <span>Terminal</span>
            <span v-if="runStatus" class="status-badge" :class="runStatus === 'SUCCESS' ? 'badge-success' : 'badge-failure'">
              {{ runStatus }}
            </span>
          </div>

          <div class="error-lines-container" v-if="showStackTrace">
            <div class="error-line" @click="hasTrigger = true">
              <span>TypeError: 'NoneType' object is not subscriptable</span>
              <span style="color: #ccc; font-size: 11px;"> main.py:12 (click to trigger)</span>
            </div>
          </div>

          <div class="terminal-output">
            <span v-if="isLoading">Running code...</span>
            <span v-else>{{ terminalText }}</span>
          </div>

          <div v-if="showDiagnosis" class="diagnosis-panel">
            <strong>🤖 AI Diagnosis:</strong> <span>변수 `user`가 None 상태에서 속성에 접근하려 하여 오류가 발생했습니다.</span>
          </div>

          <div v-if="showHint" class="hint-panel">
            <div class="hint-header">
              <strong>💡 힌트 (Level 2)</strong>
              <button class="close-btn" @click="showHint = false">×</button>
            </div>
            <div class="hint-content">
              main.py 파일의 12번째 줄을 확인해보세요.
              `user` 변수가 None일 때 예외 처리가 되어있지 않습니다.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal show" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">채점 결과</span>
          <button class="close-button" @click="showModal = false">×</button>
        </div>

        <div v-if="isEvaluating" style="text-align: center; padding: 40px;">
          <div class="spinner"></div>
          <p style="margin-top:10px; color: #ccc;">코드를 분석하고 있습니다...</p>
        </div>

        <div v-else>
          <div class="evaluation-section">
            <div class="evaluation-label">점수</div>
            <div class="score-bar">
              <div class="score-fill" :style="{ width: score + '%', backgroundColor: score >= 80 ? '#4ec9b0' : '#ffcc00' }"></div>
            </div>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: white;">
              <span>{{ score }}</span>점
            </div>
          </div>

          <div class="evaluation-section">
            <div class="evaluation-label">피드백</div>
            <div class="evaluation-text">{{ feedbackText }}</div>
          </div>
          
           <div class="evaluation-section">
            <div class="evaluation-label">학습 포인트</div>
             <div class="learning-point">Python의 NoneType 예외 처리</div>
             <div class="learning-point">디버깅 도구(Trigger) 활용 능력</div>
          </div>
          
          <button class="btn btn-submit full-width" @click="showModal = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// --- State ---
const files = reactive({
  'main.py': `import json
from auth import login

def main():
    # 데이터를 불러옵니다.
    with open("users.json", "r") as f:
        users = json.load(f)

    # ID가 99인 유저를 찾습니다 (없음 -> None 반환)
    user = next((u for u in users if u["id"] == 99), None)

    # BUG: 여기서 user가 None일 수 있는데 체크하지 않음
    print(f"Logging in {user['username']}...")

    if login(user):
        print("LOGIN SUCCESS")
    else:
        print("LOGIN FAILED")

if __name__ == "__main__":
    main()`,
  'auth.py': `def login(user):
    if not user:
        return False
    if user.get('isActive'):
        return True
    return False`,
  'users.json': `[
  {"id": 1, "username": "admin", "isActive": true},
  {"id": 2, "username": "guest", "isActive": false}
]`
});

const currentFileName = ref('main.py');
const terminalText = ref('준비 완료. "디버깅" 버튼을 눌러 코드를 실행해보세요.');
const isLoading = ref(false);
const showStackTrace = ref(false);
const showDiagnosis = ref(false);
const hasTrigger = ref(false);
const runStatus = ref(null);
const isModified = ref(false);

// Hint & Evaluation State
const showHint = ref(false);
const showModal = ref(false);
const isEvaluating = ref(false);
const score = ref(0);
const feedbackText = ref('');

// Computed
const lineCount = computed(() => files[currentFileName.value].split('\n').length);

// --- Actions ---

const switchFile = (filename) => {
  currentFileName.value = filename;
};

// 1. 힌트 받기
function mockHint() {
  isLoading.value = true;
  terminalText.value = "AI가 힌트를 생성하고 있습니다...";
  
  setTimeout(() => {
    isLoading.value = false;
    showHint.value = true;
    terminalText.value += "\n\n[System] 힌트가 도착했습니다.";
  }, 600);
}

// 2. 디버깅 (단순 실행)
function mockDebug() {
  isLoading.value = true;
  terminalText.value = "Running python3 main.py...";
  showStackTrace.value = false;
  showDiagnosis.value = false;
  runStatus.value = null;

  // Simulate execution
  setTimeout(() => {
    isLoading.value = false;
    
    // Check code simply
    const code = files['main.py'];
    const isFixed = code.includes('if user') || code.includes('if not user') || code.includes('try:');

    if (isFixed) {
      terminalText.value = `User not found (Handled safely)
LOGIN FAILED

Process finished with exit code 0`;
      runStatus.value = "SUCCESS";
    } else {
      terminalText.value = `Traceback (most recent call last):
  File "main.py", line 12, in main
    print(f"Logging in {user['username']}...")
TypeError: 'NoneType' object is not subscriptable`;
      
      showStackTrace.value = true;
      showDiagnosis.value = true;
      runStatus.value = "FAILURE";
    }
  }, 800);
}

// 3. 제출 (평가)
function mockSubmit() {
  showModal.value = true;
  isEvaluating.value = true;
  
  // Simulate Backend Evaluation
  setTimeout(() => {
    isEvaluating.value = false;
    const code = files['main.py'];
    const isFixed = code.includes('if user') || code.includes('if not user') || code.includes('try:');

    if (isFixed) {
      score.value = 100;
      feedbackText.value = "완벽합니다! NoneType 예외 처리가 적절하게 적용되었으며, 프로그램이 크래시 없이 안전하게 종료됩니다.";
    } else {
      score.value = 30;
      feedbackText.value = "아직 버그가 수정되지 않았습니다. 사용자(user)가 존재하지 않을 때의 상황을 코드에서 처리해야 합니다.";
    }
  }, 1500);
}
</script>

<style scoped>
/* --- Reset & Base Layout --- */
* { box-sizing: border-box; }

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: Consolas, 'Courier New', monospace;
  overflow: hidden;
}

/* --- Header --- */
.header {
  height: 50px;
  background-color: #252526;
  border-bottom: 1px solid #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.title {
  font-weight: bold;
  color: #fff;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* --- Buttons --- */
.btn {
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  color: #fff;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:hover { opacity: 0.9; }

.btn-hint { background-color: #8b7b00; }
.btn-debug { background-color: #0e639c; }
.btn-submit { background-color: #2da042; }

/* --- Trigger Indicator --- */
.trigger-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
  font-family: sans-serif;
}
.trigger-indicator.active {
  border: 1px solid #cca700;
  background: #423e24;
  color: #fff;
}
.clear-trigger-btn {
  background: none;
  border: none;
  color: #f14c4c;
  padding: 0;
  cursor: pointer;
  font-weight: bold;
}

/* --- Main Layout --- */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* --- Left Sidebar (Fixed Width) --- */
.left-sidebar {
  width: 350px;
  background-color: #252526;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
}

/* Sidebar Common Styles */
.section-header {
  padding: 10px 15px;
  background-color: #333;
  font-size: 12px;
  font-weight: bold;
  color: #ccc;
  text-transform: uppercase;
  font-family: sans-serif;
  border-bottom: 1px solid #111;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-icon { font-size: 14px; }

/* 1. Problem Section */
.problem-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-bottom: 1px solid #333;
}
.problem-content {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.problem-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #fff;
}
.problem-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 20px;
}
.mission-box {
  background-color: #2d2d2d;
  border-left: 3px solid #0e639c;
  padding: 15px;
  font-size: 13px;
  color: #ddd;
  line-height: 1.6;
}
.mission-box ul { margin: 5px 0 0 0; padding-left: 20px; }

/* 2. Visual Section */
.visual-section {
  height: 45%;
  min-height: 250px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
}
.visual-container {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  overflow-y: auto;
}

/* Module Nodes */
.module-node {
  width: 220px;
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}
.module-node:hover {
  border-color: #0e639c;
  transform: translateY(-2px);
  background-color: #353535;
}
.module-node.active {
  border-color: #cca700;
  background-color: #3c3c3c;
  box-shadow: 0 0 0 1px #cca700 inset;
}
.module-icon { font-size: 24px; }
.module-info { text-align: left; }
.module-name { font-weight: bold; font-size: 14px; color: #fff; font-family: sans-serif; }
.module-desc { font-size: 11px; color: #888; margin-top: 2px; font-family: sans-serif; }

.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #666;
}

/* --- Right Content --- */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
}

/* Editor */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.editor-tab {
  height: 35px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-size: 13px;
  font-family: sans-serif;
  border-top: 2px solid #0e639c;
}
.unsaved-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; }

.editor-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}
.line-numbers {
  width: 45px;
  background-color: #1e1e1e;
  color: #6e7681;
  text-align: right;
  padding: 10px 10px 10px 0;
  font-size: 14px;
  line-height: 1.5;
  border-right: 1px solid #333;
  user-select: none;
}
.code-textarea {
  flex: 1;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: none;
  resize: none;
  padding: 10px;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  white-space: pre;
}

/* Terminal */
.terminal {
  height: 250px;
  background-color: #1e1e1e;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
}
.terminal-header {
  height: 35px;
  background-color: #252526;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #ccc;
  font-family: sans-serif;
}
.terminal-output {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  overflow-y: auto;
  color: #ccc;
  white-space: pre-wrap;
}

/* Badges & Errors */
.status-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; }
.badge-success { background: #4ec9b0; color: #000; }
.badge-failure { background: #f14c4c; color: #fff; }

.error-lines-container { padding: 5px; background-color: #2d2d2d; }
.error-line {
  background-color: #5a1d1d;
  color: #ffcccc;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}
.error-line:hover { background-color: #7a2d2d; }

/* Overlays (Diagnosis & Hint) */
.diagnosis-panel {
  padding: 10px;
  background-color: #252526;
  color: #9cdcfe;
  font-size: 12px;
  border-top: 1px solid #333;
}
.hint-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background-color: #2d2d2d;
  border: 1px solid #8b7b00;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  z-index: 10;
  overflow: hidden;
}
.hint-header {
  background-color: #3d3d00;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #fff;
}
.hint-content { padding: 15px; font-size: 13px; line-height: 1.5; color: #ddd; white-space: pre-wrap; }
.close-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }

/* Modal */
.modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #252526;
  width: 450px;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #444;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #444; }
.modal-title { font-size: 18px; font-weight: bold; color: white; }
.close-button { background: none; border: none; font-size: 24px; color: #888; cursor: pointer; }

.evaluation-section { margin-bottom: 20px; }
.evaluation-label { color: #888; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; font-family: sans-serif; }
.score-bar { background: #333; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.score-fill { height: 100%; transition: width 0.8s ease; }
.evaluation-text { font-size: 14px; line-height: 1.5; color: #ddd; }
.learning-point { background: #1a2e1a; color: #4ec9b0; padding: 8px; margin-bottom: 5px; border-left: 3px solid #4ec9b0; font-size: 13px; }
.full-width { width: 100%; margin-top: 10px; }

/* Spinner */
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #333;
  border-top: 3px solid #0e639c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>