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
      class="nes-container is-rounded w-[98vw] max-w-[1400px] h-[95vh] flex flex-col overflow-hidden relative p-0"
      style="background: #e7e7e7; border: 4px solid #000;"
      :class="{ 'shake-active': isShaking }"
    >
      <!-- Header: Super Code Adventure (Mario Vibe) -->
      <header class="px-8 py-4 border-b-4 border-black flex items-center justify-between shrink-0" style="background: #fff;">
        <div class="flex items-center gap-6">
          <div class="flex flex-col">
            <h1 class="text-2xl nes-text is-error mb-1 tracking-tighter font-retro" style="text-shadow: 2px 2px #000;">
              CODE_ADV_LOOM <span class="nes-text is-warning text-[10px] font-retro">W 1-{{ currentQuest?.difficulty }}</span>
            </h1>
            <div class="flex items-center gap-2">
              <i class="nes-icon heart is-small"></i>
              <p class="text-[8px] text-primary font-retro uppercase">READY_GO!</p>
            </div>
          </div>

          <!-- Level Board (Square Enix Vibe) - Simplified -->
          <div class="nes-container is-dark p-2 border-2 border-black flex items-center gap-3" style="background: var(--jrpg-blue); min-width: 280px;">
            <button @click="store.getQuestsByDifficulty(currentQuest?.difficulty - 1)" class="nes-btn is-primary p-0 w-8 h-8 font-retro" :disabled="currentQuest?.difficulty <= 1">&lt;</button>
            <div class="flex-1 text-center overflow-hidden">
              <div class="text-[8px] text-yellow-500 font-retro">LOGIC_LEVEL</div>
              <div class="text-[10px] text-white truncate font-bold uppercase">{{ currentQuest?.title }}</div>
            </div>
            <button @click="store.getQuestsByDifficulty(currentQuest?.difficulty + 1)" class="nes-btn is-primary p-0 w-8 h-8 font-retro" :disabled="currentQuest?.difficulty >= 3">&gt;</button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button @click="$emit('close')" class="nes-btn is-error font-retro text-[10px] py-2 px-4">
            EXIT_MAP
          </button>
        </div>
      </header>

      <!-- Adventure Area -->
      <div class="flex-1 overflow-hidden p-6 flex gap-6">
        <!-- Status & Menu Sidebar (Square Enix Menu Style) -->
        <aside class="w-72 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar pr-2">
          <!-- NPC Interaction (Toad/Mog style) -->
          <div class="relative pt-8">
            <div class="absolute -top-4 left-2 flex items-center gap-2">
               <div class="nes-container is-rounded p-0.5 bg-white border-2 border-black">
                 <img src="/image/unit_duck.png" class="w-10 h-10 pixelated" alt="NPC">
               </div>
               <span class="nes-badge is-warning font-retro"><span class="text-[6px] px-1">GUIDE</span></span>
            </div>
            <section class="nes-balloon from-left is-primary box-jrpg !p-3">
               <div class="text-[10px] leading-relaxed text-white">
                 "오늘의 퀘스트: {{ currentQuest?.description }}"
               </div>
            </section>
          </div>
          
          <!-- Library / Spellbook -->
          <div class="nes-container with-title p-3 box-jrpg">
            <p class="title text-[8px] bg-white text-black px-1 font-retro">SPELL_BOOK</p>
            <div class="space-y-3">
               <div v-for="(ex, i) in parsedExamples" :key="i" class="border-b-2 border-white/10 pb-2 last:border-0">
                 <div class="text-[8px] text-yellow-400 mb-1 font-retro">DATA_{{ i+1 }}</div>
                 <div class="text-[10px]"><span class="text-primary font-bold">● IN:</span> {{ ex.parsed.input }}</div>
                 <div class="text-[10px]"><span class="text-success font-bold">● OUT:</span> {{ ex.parsed.output }}</div>
               </div>
            </div>
          </div>

          <!-- Hero Status Board -->
          <div class="nes-container with-title p-3 box-jrpg">
            <p class="title text-[8px] bg-white text-black px-1 font-retro">HERO_HUD</p>
            <div class="mb-3 flex items-center gap-2">
              <i class="nes-icon heart is-small"></i>
              <div class="flex-1">
                <div class="text-[8px] mb-1 flex justify-between uppercase font-retro">
                  <span>Logic</span>
                  <span>{{ syncRate }}%</span>
                </div>
                <progress class="nes-progress is-warning w-full h-3" :value="syncRate" max="100"></progress>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <i class="nes-icon coin is-small"></i>
               <span class="text-[8px] font-retro">LEVEL: 99</span>
            </div>
          </div>

          <!-- Mirror of Logic (Visualizer) -->
          <div class="mt-auto nes-container p-2 bg-white border-2 border-black">
             <div class="text-[8px] text-black mb-1 text-center font-bold font-retro">LOGIC_MIRROR</div>
             <MermaidRenderer :definition="mermaidDefinition" />
          </div>
        </aside>

        <!-- Main Quest Console -->
        <main class="flex-1 flex flex-col h-full nes-container p-0 overflow-hidden bg-[#fff] border-4 border-black relative">
          <!-- Game Menu Tabs -->
          <div class="flex border-b-4 border-black sticky top-0 z-30 bg-white">
            <button 
              @click="activeTab = 'guide'; showDiff = false"
              :class="['flex-1 p-3 text-[10px] font-bold border-r-2 border-black font-retro', activeTab === 'guide' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ TUTORIAL ]
            </button>
            <button 
              @click="activeTab = 'parsons'; showDiff = false"
              :class="['flex-1 p-3 text-[10px] font-bold border-r-2 border-black font-retro', activeTab === 'parsons' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ LOGIC_BLOCKS ]
            </button>
            <button 
              @click="activeTab = 'editor'; showDiff = false"
              :class="['flex-1 p-3 text-[10px] font-bold font-retro', activeTab === 'editor' ? 'bg-black text-white' : 'hover:bg-yellow-400 text-black']"
            >
              [ CODEWIZARD ]
            </button>
          </div>

          <!-- Quest Content Window -->
          <div class="flex-1 p-6 overflow-y-auto custom-scrollbar relative bg-[#dbdbdb]">
            <template v-if="currentQuest">
              <Guidebook v-if="activeTab === 'guide'" />

              <ParsonsPuzzle 
                v-if="activeTab === 'parsons'" 
                @impact="triggerImpact" 
              />
              
              <div v-if="activeTab === 'editor'" class="space-y-6 h-full flex flex-col">
                <template v-if="!showDiff">
                  <!-- Editor Wrapper -->
                  <div class="flex-1 flex flex-col bg-black rounded-lg border-4 border-black relative overflow-hidden min-h-[480px] z-[100] cursor-text">
                    <CodeEditor 
                      :initial-code="currentQuest?.solution_code"
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
                  :original-code="currentQuest?.solution_code"
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
      <footer class="px-8 py-3 border-t-4 border-black flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-8">
           <div class="flex items-center gap-2">
             <i class="nes-icon is-small heart"></i>
             <span class="text-[8px] font-retro">LIFE x 3</span>
           </div>
           <div class="flex items-center gap-2">
             <i class="nes-icon is-small coin"></i>
             <span class="text-[8px] font-retro">COINS 000</span>
           </div>
        </div>
        <div class="text-[8px] font-bold font-retro">QUEST_TIME: 2026.01.23</div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuestStore } from '../../stores/quest';
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

const store = useQuestStore();
const { currentQuest } = storeToRefs(store);

const activeTab = ref('guide');
const evaluationResult = ref(null);
const userSubmittedCode = ref('');
const showDiff = ref(false);
const syncRate = ref(0); // 실시간 싱크율
const isShaking = ref(false); // 타격감 트리거
const mermaidDefinition = ref(''); // Mermaid 도표 정의

const parsedExamples = computed(() => {
  if (!currentQuest.value || !currentQuest.value.examples) return [];
  return parseAllExamples(currentQuest.value.examples);
});

const handleEvaluation = async (userCode) => {
  userSubmittedCode.value = userCode;
  triggerImpact(); 
  
  // 2026-01-23: 데이터 기반 동적 채점 로직 (하드코딩 제거)
  setTimeout(() => {
    const isExactMatch = userCode.trim() === currentQuest.value?.solution_code?.trim();
    const questFeedback = currentQuest.value?.feedback || {};
    
    evaluationResult.value = {
      score: isExactMatch ? 100 : 70,
      status: isExactMatch ? 'SUCCESS' : 'DIVERGENCE',
      feedback: isExactMatch 
        ? (questFeedback.success || '미션 성공! 완벽한 논리입니다.') 
        : (questFeedback.failure || '로직이 조금 다릅니다. 다시 시도해 보세요.'),
      suggestions: isExactMatch 
        ? ['다음 월드로 넘어갈 준비가 되었습니다.'] 
        : (questFeedback.suggestions || ['코드를 다시 한번 검토해 보세요.'])
    };
  }, 1000);
};

/**
 * [수정일: 2026-01-23]
 * [수정내용: 퍼즐 상태나 에디터 코드 변경 시 Mermaid 정의 갱신]
 */
const handlePuzzleChange = (blocks) => {
  if (!blocks || blocks.length === 0) return;
  // puzzle stage: 퀘스트 블록의 mermaid_def를 순차적으로 연결
  let def = 'graph TD\n';
  def += '  Start([Puzzle_Logic])\n';
  blocks.forEach((b, i) => {
    def += `  Node${i}${b.mermaid_def.includes('{') ? '{' : b.mermaid_def.includes('(') ? '((' : '['}"${b.text_ko}"]\n`;
    if (i === 0) {
      def += `  Start --> Node${i}\n`;
    } else {
      def += `  Node${i-1} --> Node${i}\n`;
    }
  });
  mermaidDefinition.value = def;
};

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
  if (!currentQuest.value) {
    // 기본 난이도 1의 퀘스트 로드
    store.getQuestsByDifficulty(1);
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
