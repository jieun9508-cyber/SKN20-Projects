<template>
  <div class="code-editor-container h-full flex flex-col bg-[#1e1e1e] rounded-lg overflow-hidden border border-slate-700">
    <!-- 
      [수정일: 2026-01-23]
      [수정내용: Monaco Editor를 활용한 코드 에디터 컴포넌트 구현]
    -->
    <div class="editor-header px-4 py-3 border-b-4 border-black flex justify-between items-center bg-[#fff]">
      <span class="font-bold font-retro text-[10px]">SPELL_CONCENTRATION.EXE</span>
      <div class="flex gap-4">
        <i class="nes-icon star is-small"></i>
        <i class="nes-icon coin is-small"></i>
      </div>
    </div>
    
    <div class="flex-1 relative">
      <VueMonacoEditor
        v-model:value="code"
        theme="vs-dark"
        :language="language"
        :options="editorOptions"
        @mount="handleMount"
        class="h-full"
      />
    </div>

    <div class="editor-footer px-6 py-4 border-t-4 border-black flex justify-between items-center bg-[#fff]">
      <div class="text-[10px] text-black font-bold font-retro">
        HP: 100/100 | MP: 50/50
      </div>
      <button 
        @click="submitCode"
        :disabled="isSubmitting"
        :class="['nes-btn px-8 text-xs font-retro', isSubmitting ? 'is-disabled' : 'is-primary']"
      >
        <span v-if="!isSubmitting">CAST!</span>
        <span v-else>CASTING...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted } from 'vue';
import VueMonacoEditor from '@guolao/vue-monaco-editor';

const props = defineProps({
  initialCode: { type: String, default: '# 코딩을 시작하여 코어 싱크를 높이십시오...\n' },
  language: { type: String, default: 'python' }
});

const emit = defineEmits(['submit', 'impact', 'syncUpdate', 'change']);

const code = ref(props.initialCode);
const editorRef = shallowRef(null);
const isSubmitting = ref(false);
const cursorLine = ref(1);
const cursorCol = ref(1);

// 게임 느낌용 키워드
const GAME_KEYWORDS = ['def', 'if', 'for', 'while', 'return', 'import', 'class', 'else', 'elif'];

const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: false },
  lineNumbers: 'on',
  roundedSelection: true,
  scrollBeyondLastLine: false,
  readOnly: false,
  formatOnPaste: true,
  formatOnType: true,
  padding: { top: 20, bottom: 20 },
  fixedOverflowWidgets: true, // 위젯이 잘리지 않도록 설정
  scrollbar: {
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    vertical: 'visible',
    horizontal: 'visible'
  }
};

const handleMount = (editor) => {
  editorRef.value = editor;
  
  // 커서 위치 업데이트 감시
  editor.onDidChangeCursorPosition((e) => {
    cursorLine.value = e.position.lineNumber;
    cursorCol.value = e.position.column;
  });

  // 2026-01-23: 입력 시 키워드 감지 및 싱크율 업데이트 (타격감 구현)
  editor.onDidChangeModelContent((e) => {
    const value = editor.getValue();
    // v-model:value가 code를 자동으로 업데이트하므로 여기서는 다른 부가 기능만 수행
    
    // 키워드 타격감 트리거
    const lastChanges = e.changes[0]?.text || '';
    if ([' ', '\n', '(', ':', '='].includes(lastChanges)) {
      const words = value.trim().split(/[\s\n(:]+/);
      const lastWord = words[words.length - 1];
      if (GAME_KEYWORDS.includes(lastWord)) {
        emit('impact');
      }
    }

    // 싱크율 실시간 계산 (단순화: 라인 수 + 길이 기반)
    const lines = value.split('\n').filter(l => l.trim().length > 0).length;
    const newSync = Math.min(Math.floor((value.length / 100) * 20 + (lines * 10)), 100);
    emit('syncUpdate', newSync);
    
    // 2026-01-23: 실시간 시각화를 위한 변경 이벤트 전송
    emit('change', value);
  });
};

const submitCode = () => {
  isSubmitting.value = true;
  emit('submit', code.value);
  // 부모 컴포넌트에서 채점 완료 후 다시 false로 돌려야 함 (또는 여기서 타이아웃 처리)
  setTimeout(() => { isSubmitting.value = false; }, 3000); 
};
</script>

<style scoped>
.code-editor-container {
  min-height: 400px;
}
</style>
