<template>
  <div class="parsons-puzzle h-full flex flex-col relative">
    <!-- 
      [수정일: 2026-01-23]
      [수정내용: 디자인 고도화 및 데이터 바인딩 버그 수정 (가독성 개선)]
    -->
    <div class="mb-6">
      <h3 class="text-xs nes-text is-primary flex items-center gap-3 font-retro">
        <i class="nes-icon star is-small"></i>
        LOGIC_WORLD_PUZZLE
      </h3>
      <p class="text-sm text-slate-600 mt-2 font-bold">아이템 조각을 맞춰 길을 만드세요!</p>
    </div>

    <!-- 퍼즐 컨테이너 -->
    <div class="puzzle-container flex-1 space-y-4 custom-scrollbar overflow-y-auto pr-2 pb-20">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover.prevent
        @drop="onDrop($event, index)"
        class="nes-container is-rounded p-4 cursor-move hover:bg-yellow-200 transition-all active:scale-[0.95]"
        style="background: #fff; border-width: 4px;"
        :class="{ 'is-success': block.originalIndex === index && resultMessage }"
      >
        <div class="flex items-center gap-4">
          <i class="nes-icon is-small coin"></i>
          <span class="text-sm text-black font-bold">
            {{ block.text }}
          </span>
        </div>
      </div>

      <!-- 데이터 없을 때 표시 -->
      <div v-if="blocks.length === 0" class="h-full flex items-center justify-center text-slate-700 font-mono text-[10px] uppercase tracking-widest font-retro">
        Waiting_For_Neural_Data...
      </div>
    </div>

    <!-- 푸팅 액션 -->
    <div class="absolute bottom-0 right-0 left-0 p-6 flex justify-end">
      <button 
        @click="checkAnswer"
        class="nes-btn is-success font-retro"
        style="padding: 1rem 2rem;"
      >
        [ CHECK_PUZZLE ]
      </button>
    </div>

    <!-- 결과 알림 (Floating 모드로 변경) -->
    <Transition name="slide-up">
      <div v-if="resultMessage" class="absolute top-4 right-4 z-50">
        <section :class="['nes-balloon from-right is-primary text-sm box-jrpg']" style="border-width: 4px;">
          <div class="flex items-center gap-2 font-retro text-[10px]">
            <i :class="['nes-icon is-small', isCorrect ? 'star' : 'close']"></i>
            <span>{{ isCorrect ? 'FANFARE!' : 'GAME_OVER' }}</span>
          </div>
          <p class="mt-4 font-bold">{{ resultMessage }}</p>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
// 2026-01-23: support/unit1 폴더 구조에 맞춘 상대 경로 수정
import { useProblemStore } from '../../../../stores/useProblemStore';
import { CheckCircle2, TriangleAlert } from 'lucide-vue-next';

const store = useProblemStore();
const { currentProblem } = storeToRefs(store);

const emit = defineEmits(['impact']); // 타격감 이벤트

const blocks = ref([]);
const resultMessage = ref('');
const isCorrect = ref(false);

const onDragStart = (event, index) => {
  event.dataTransfer.setData('sourceIndex', index);
  event.dataTransfer.effectAllowed = 'move';
};

const onDrop = (event, targetIndex) => {
  const sourceIndex = event.dataTransfer.getData('sourceIndex');
  if (sourceIndex === '') return;
  
  const moveIndex = parseInt(sourceIndex);
  if (moveIndex === targetIndex) return;
  
  const items = [...blocks.value];
  const [removed] = items.splice(moveIndex, 1);
  items.splice(targetIndex, 0, removed);
  blocks.value = items;
  resultMessage.value = '';
  
  // 2026-01-23: 드롭 시 타격감 이벤트 발생
  emit('impact');
};

const checkAnswer = () => {
  isCorrect.value = store.validatePuzzle(blocks.value);
  resultMessage.value = isCorrect.value 
    ? '정답입니다! 다음 미션 준비가 완료되었습니다.' 
    : '논리 구조가 일치하지 않습니다. 다시 시도해 주세요.';
  
  setTimeout(() => { resultMessage.value = ''; }, 4000);
};

// 데이터 로드 보장 로직
const initPuzzle = () => {
  if (currentProblem.value) {
    blocks.value = store.shufflePseudocode();
  }
};

onMounted(initPuzzle);
watch(currentProblem, initPuzzle, { deep: true, immediate: true });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }

.puzzle-block:hover {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
  transform: translateY(-2px);
}

/* 퍼즐 맞춤 힌트 효과 */
.match-hint {
  border-color: rgba(16, 185, 129, 0.4) !important;
  background-color: rgba(16, 185, 129, 0.05) !important;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
}

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(-20px) scale(0.9); }
.slide-up-leave-to { opacity: 0; transform: translateY(-20px) scale(0.9); }
</style>
