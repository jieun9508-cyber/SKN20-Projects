<template>
  <!-- 
    [수정일: 2026-01-23]
    [수정내용: LogicTrainer를 고성능 모달 레이아웃으로 변환]
  -->
  <div 
    class="fixed inset-0 flex items-center justify-center p-4 mario-bg z-[9999] overflow-y-auto"
  >
    <!-- JRPG / Mario Style Main Container -->
    <div 
      class="nes-container is-rounded w-full max-w-[1400px] min-h-[650px] h-[95vh] flex flex-col overflow-hidden relative"
      style="background: #e7e7e7; border-width: 6px;"
      :class="{ 'shake-active': isShaking }"
    >
      <!-- Header: Super Code Adventure (Mario Vibe) -->
      <header class="p-8 border-b-8 border-black flex items-center justify-between" style="background: #fff;">
        <div class="flex items-center gap-8">
          <div class="flex flex-col">
            <h1 class="text-3xl nes-text is-error mb-2 tracking-tighter font-retro" style="text-shadow: 4px 4px #000;">
              CODE_ADV_LOOM <span class="nes-text is-warning text-xs font-retro">WORLD 1-1</span>
            </h1>
            <div class="flex items-center gap-4">
              <i class="nes-icon heart is-medium"></i>
              <p class="text-[10px] text-primary font-retro">PLAYER_READY_GO!</p>
            </div>
          </div>

          <!-- Level Board (Square Enix Vibe) -->
          <div class="nes-container is-dark p-2 border-4 border-black" style="background: var(--jrpg-blue);">
            <div class="flex items-center gap-4">
              <button @click="store.prevProblem" class="nes-btn is-primary p-1 font-retro">&lt;</button>
              <div class="px-4 text-center min-w-[200px]">
                <div class="text-[8px] text-yellow-500 mb-1 font-retro">CURRENT_QUEST</div>
                <div class="text-sm text-white truncate max-w-[180px] font-bold">{{ currentProblem?.title_ko }}</div>
              </div>
              <button @click="store.nextProblem" class="nes-btn is-primary p-1 font-retro">&gt;</button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-8">
          <button @click="$emit('close')" class="nes-btn is-error font-retro">
            EXIT_MAP
          </button>
        </div>
      </header>

      <!-- Adventure Area -->
      <div class="flex-1 overflow-hidden p-8 flex gap-8">
        <!-- Status & Menu Sidebar (Square Enix Menu Style) -->
        <aside class="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
          <!-- NPC Interaction (Toad/Mog style) -->
          <div class="relative pt-12">
            <div class="absolute -top-4 left-4 flex items-center gap-4">
               <div class="nes-container is-rounded p-1 bg-white">
                 <img src="/image/unit_duck.png" class="w-14 h-14 pixelated" alt="NPC">
               </div>
               <span class="nes-badge is-warning font-retro"><span class="text-[8px]">GUIDE</span></span>
            </div>
            <section class="nes-balloon from-left is-primary box-jrpg">
               <div class="text-sm leading-relaxed text-white">
                 "안녕하세요! 오늘의 퀘스트: {{ currentProblem?.description_ko }}"
               </div>
            </section>
          </div>
          
          <!-- Library / Spellbook -->
          <div class="nes-container with-title p-4 box-jrpg">
            <p class="title text-[10px] bg-white text-black px-2 font-retro">SPELL_BOOK</p>
            <div class="space-y-4">
               <div v-for="(ex, i) in parsedExamples" :key="i" class="border-b-2 border-white/20 pb-4 last:border-0">
                 <div class="text-[8px] text-yellow-400 mb-2 font-retro">SCROLL_DATA_{{ i+1 }}</div>
                 <div class="text-xs"><span class="text-primary font-bold">● IN:</span> {{ ex.parsed.input }}</div>
                 <div class="text-xs"><span class="text-success font-bold">● OUT:</span> {{ ex.parsed.output }}</div>
               </div>
            </div>
          </div>

          <!-- Hero Status Board -->
          <div class="nes-container with-title p-4 box-jrpg">
            <p class="title text-[10px] bg-white text-black px-2 font-retro">HERO_HUD</p>
            <div class="mb-4 flex items-center gap-4">
              <i class="nes-icon heart is-small"></i>
              <div class="flex-1">
                <div class="text-[8px] mb-2 flex justify-between uppercase font-retro">
                  <span>Logic_Power</span>
                  <span>{{ syncRate }}%</span>
                </div>
                <progress class="nes-progress is-warning w-full h-4" :value="syncRate" max="100"></progress>
              </div>
            </div>
            <div class="flex items-center gap-4">
               <i class="nes-icon coin is-small"></i>
               <span class="text-[8px] font-retro">XP: 9,999</span>
            </div>
          </div>

          <!-- Mirror of Logic (Visualizer) -->
          <div class="mt-auto nes-container p-2 bg-white">
             <div class="text-[8px] text-black mb-1 text-center font-bold font-retro">MAGIC_REFLECTIONS</div>
             <MermaidRenderer :definition="mermaidDefinition" />
          </div>
        </aside>

        <!-- Main Quest Console -->
        <main class="flex-1 flex flex-col h-full nes-container p-0 overflow-hidden bg-[#fff] border-8 border-black">
          <!-- Game Menu Tabs -->
          <div class="flex border-b-8 border-black sticky top-0 z-30 bg-white">
            <button 
              @click="activeTab = 'guide'; showDiff = false"
              :class="['flex-1 p-4 text-[11px] font-bold border-r-4 border-black font-retro', activeTab === 'guide' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ TUTORIAL ]
            </button>
            <button 
              @click="activeTab = 'parsons'; showDiff = false"
              :class="['flex-1 p-4 text-[11px] font-bold border-r-4 border-black font-retro', activeTab === 'parsons' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ LOGIC_BLOCKS ]
            </button>
            <button 
              @click="activeTab = 'editor'; showDiff = false"
              :class="['flex-1 p-4 text-[11px] font-bold font-retro', activeTab === 'editor' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ CODEWIZARD ]
            </button>
          </div>

          <!-- Quest Content Window -->
          <div class="flex-1 p-6 overflow-y-auto custom-scrollbar relative bg-[#dbdbdb]">
            <template v-if="currentProblem">
              <Guidebook v-if="activeTab === 'guide'" />

              <ParsonsPuzzle 
                v-if="activeTab === 'parsons'" 
                @impact="triggerImpact" 
              />
              
              <div v-if="activeTab === 'editor'" class="space-y-6 h-full flex flex-col">
                <template v-if="!showDiff">
                  <div class="nes-container is-dark is-rounded p-1 bg-black flex-1 flex flex-col">
                    <CodeEditor 
                      @submit="handleEvaluation" 
                      @impact="triggerImpact"
                      @syncUpdate="val => syncRate = val"
                      @change="handleCodeChange"
                    />
                  </div>
                  <div v-if="evaluationResult" class="mt-4">
                     <CodeEvaluationResult 
                      :result="evaluationResult" 
                      @show-diff="showDiff = true"
                    />
                  </div>
                </template>
                
                <CodeDiffViewer 
                  v-else
                  :original-code="currentProblem?.solution_code"
                  :modified-code="userSubmittedCode"
                  @close="showDiff = false"
                />
              </div>
            </template>
            
            <!-- Adventure Loading -->
            <div v-else class="h-full flex flex-col items-center justify-center gap-6">
              <i class="nes-mario scale-[3]"></i>
              <p class="text-[10px] animate-bounce">LOADING_LEVEL...</p>
            </div>
          </div>
        </main>
      </div>

      <!-- Footer Stats -->
      <footer class="p-6 border-t-8 border-black flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-12">
           <div class="flex items-center gap-4">
             <i class="nes-icon is-small heart"></i>
             <span class="text-[10px]">LIFE x 3</span>
           </div>
           <div class="flex items-center gap-4">
             <i class="nes-icon is-small coin"></i>
             <span class="text-[10px]">COINS 000</span>
           </div>
        </div>
        <div class="text-[10px] font-bold">QUEST_TIME: 2026-01-23</div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProblemStore } from '../../stores/useProblemStore';
import { parseAllExamples } from '../../utils/parser';
import { convertToMermaid } from '../../utils/logicToMermaid';
import { X, ChevronLeft, ChevronRight, ShieldAlert, Zap } from 'lucide-vue-next';

// 2026-01-23: 컴포넌트 구조화(unit별 분리)에 따른 unit1 경로 적용
import ParsonsPuzzle from './support/unit1/ParsonsPuzzle.vue';
import CodeEditor from './support/unit1/CodeEditor.vue';
import CodeEvaluationResult from './support/unit1/CodeEvaluationResult.vue';
import CodeDiffViewer from './support/unit1/CodeDiffViewer.vue';
import MermaidRenderer from './support/MermaidRenderer.vue';
import Guidebook from './support/Guidebook.vue';

const emit = defineEmits(['close']);

const store = useProblemStore();
const { currentProblem } = storeToRefs(store);

const activeTab = ref('guide');
const evaluationResult = ref(null);
const userSubmittedCode = ref('');
const showDiff = ref(false);
const syncRate = ref(0); // 실시간 싱크율
const isShaking = ref(false); // 타격감 트리거
const mermaidDefinition = ref(''); // Mermaid 도표 정의

const parsedExamples = computed(() => {
  if (!currentProblem.value || !currentProblem.value.examples) return [];
  return parseAllExamples(currentProblem.value.examples);
});

const handleEvaluation = async (userCode) => {
  userSubmittedCode.value = userCode;
  triggerImpact(); // 제출 시 강한 임팩트
  
  // 시뮬레이션
  setTimeout(() => {
    evaluationResult.value = {
      score: 85,
      status: 'SUCCESS',
      feedback: '전반적인 로직 구조가 파이썬스럽게(Pythonic) 잘 작성되었습니다. 특히 첫 번째 일치 항목 제거 후 루프를 중단하는 방식이 효율적입니다.',
      suggestions: [
        '변수명을 조금 더 직관적으로 지으면 읽기 좋습니다.',
        '스트링 인덱싱 대신 find/rfind 메서드를 활용해 보세요.'
      ]
    };
  }, 1500);
};

/**
 * [수정일: 2026-01-23]
 * [수정내용: 에디터 코드 변경 시 Mermaid 정의 갱신]
 */
const handleCodeChange = (newCode) => {
  mermaidDefinition.value = convertToMermaid(newCode);
};

/**
 * [수정일: 2026-01-23]
 * [수정내용: 게임 타격감을 위한 셰이크 효과]
 */
const triggerImpact = () => {
  isShaking.value = true;
  setTimeout(() => { isShaking.value = false; }, 150);
};

const syncStatusClass = computed(() => {
  if (syncRate.value >= 90) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
  if (syncRate.value >= 50) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]';
  return 'text-slate-400';
});

onMounted(() => {
  if (!currentProblem.value) {
    store.setProblemById(11);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;900&display=swap');

.orbitron { font-family: 'Orbitron', sans-serif; }
.rajdhani { font-family: 'Rajdhani', sans-serif; }

.interactive-border {
  position: relative;
}
.interactive-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 3rem;
  padding: 1px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.4), transparent 40%, transparent 60%, rgba(99, 102, 241, 0.4));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* 스캔라인 효과 */
.interactive-border::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 4px, 3px 100%;
  pointer-events: none;
  z-index: 30;
  opacity: 0.1;
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border: 2px solid #fff; }
.custom-scrollbar::-webkit-scrollbar-track { background: #eee; }

/* 타격감 효과 (Shake) */
.shake-active {
  animation: shake-anim 0.2s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake-anim {
  10%, 90% { transform: translate3d(-4px, 0, 0); }
  20%, 80% { transform: translate3d(6px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
  40%, 60% { transform: translate3d(8px, 0, 0); }
}

header h1 {
  animation: title-flash 2s infinite;
}

@keyframes title-flash {
  0%, 100% { filter: brightness(100%); }
  50% { filter: brightness(120%) drop-shadow(0 0 10px var(--mario-yellow)); }
}
</style>
