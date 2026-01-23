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
    
    <div class="flex-1 relative flex flex-col">
      <VueMonacoEditor
        v-model:value="code"
        theme="vs-dark"
        :language="language"
        :options="editorOptions"
        @mount="handleMount"
        class="flex-1 w-full z-50"
        style="min-height: 380px;"
      />
    </div>

    <div class="editor-footer px-6 py-4 border-t-4 border-black flex justify-between items-center bg-[#fff] z-20">
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
  fixedOverflowWidgets: true,
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible'
  }
};

// 퀘스트 변경 시 코드 초기화 보장
watch(() => props.initialCode, (newVal) => {
  if (newVal) {
    code.value = newVal;
  }
}, { immediate: true });

// 부모에게 변경 사항 전달
watch(code, (newVal) => {
  emit('change', newVal);
  
  // 싱크율 실시간 계산
  const lines = newVal.split('\n').filter(l => l.trim().length > 0).length;
  const newSync = Math.min(Math.floor((newVal.length / 100) * 20 + (lines * 10)), 100);
  emit('syncUpdate', newSync);
});

const handleMount = (editor) => {
  editorRef.value = editor;
  
  // 강제 포커스 부여
  setTimeout(() => {
    editor.focus();
  }, 100);

  // 2026-01-23: 입력 시 키워드 감지 (타격감 구현)
  editor.onDidChangeModelContent((e) => {
    const changes = e.changes[0]?.text || '';
    if ([' ', '\n', '(', ':', '='].includes(changes)) {
      const val = editor.getValue();
      const words = val.trim().split(/[\s\n(:]+/);
      const lastWord = words[words.length - 1];
      if (GAME_KEYWORDS.includes(lastWord)) {
        emit('impact');
      }
    }
  });
};

const submitCode = () => {
  isSubmitting.value = true;
  emit('submit', code.value);
  setTimeout(() => { isSubmitting.value = false; }, 2000); 
};
</script>

<style scoped>
.code-editor-container {
  min-height: 400px;
}
</style>
