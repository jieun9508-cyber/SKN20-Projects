<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <!-- 로딩 화면 -->
    <div v-if="isLoading" class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      <div class="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 class="text-2xl font-bold mb-2 font-jua">데이터 로딩 중...</h2>
      <p class="text-slate-400 text-sm italic">{{ loadingStep }}</p>
    </div>

    <!-- 메인 컨테이너 -->
    <div class="max-w-6xl w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-[12px] border-slate-900 relative flex flex-col h-[750px]">
      <!-- 헤더: 여백 최적화 (라운딩 56px + 테두리 12px 고려하여 80px 설정) -->
      <div class="bg-slate-900 text-white flex justify-between items-center font-jua border-b-4 border-slate-800" 
           style="padding: 80px 80px 40px 80px;">
        <div class="flex items-center gap-6">
          <h1 class="text-4xl font-black text-yellow-400 drop-shadow-md">PseudoPractice</h1>
          <span class="bg-white/10 px-6 py-1.5 rounded-full text-lg border border-white/20">{{ currentStep }}층 진행 중</span>
        </div>
        <div class="flex items-center gap-8">
          <div class="bg-yellow-400 text-slate-900 px-8 py-2.5 rounded-2xl font-black text-xl shadow-lg">
            점수: {{ score }}
          </div>
          <!-- 닫기 버튼: 헤더 영역 내로 통합 및 위치 조정 -->
          <button @click="$emit('close')" class="text-slate-400 hover:text-yellow-500 text-5xl transition-colors font-bold leading-none">&times;</button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row flex-grow overflow-hidden min-h-0">
        <!-- 왼쪽 영역: 계단 및 오리 (비율 축소: 42%) -->
        <div class="w-full md:w-[42%] bg-sky-100 p-6 border-r-4 border-slate-900 relative overflow-hidden flex items-end h-full">
          <!-- 말풍선 -->
          <div class="absolute top-8 left-6 right-6 z-[110]">
            <div class="duck-bubble transition-opacity duration-300 min-h-[50px] flex items-center justify-center shadow-lg" :style="{ opacity: showBubble ? 1 : 0 }">
              <p class="text-slate-800 font-bold text-sm text-center leading-tight whitespace-pre-line">{{ bubbleMsg }}</p>
            </div>
          </div>

          <!-- 계단 컨테이너 -->
          <div class="relative w-full h-[550px] flex items-end">
            <!-- START 플랫폼 -->
            <div class="stair-start absolute" 
                 :style="{ 
                    width: '260px', 
                    height: '90px', 
                    left: '20px', 
                    bottom: '40px',
                    zIndex: 0
                 }">
              <div class="platform-top">START</div>
              <div class="platform-side"></div>
            </div>

            <!-- 대각선 계단 (동적 생성) -->
            <div v-for="i in currentQuest.solution.length" :key="i" 
                 class="stair-pill group transition-all duration-300" 
                 :class="{ 'active-target': (currentStep === i-1) }"
                 :style="{ 
                    width: '320px', 
                    height: '55px', 
                    left: (i * 55 + 20) + 'px', 
                    bottom: (i * 80 + 30) + 'px',
                    zIndex: i 
                 }"
                 @dragover.prevent
                 @drop="onDrop($event, i-1)">
                 
                 <!-- 배치된 블록 -->
                 <div v-if="droppedBlocks[i-1]" 
                      class="placed-block-refined"
                      :class="droppedBlocks[i-1].color">
                   <span class="text-2xl">{{ droppedBlocks[i-1].icon }}</span>
                   <span class="block-text">{{ droppedBlocks[i-1].text }}</span>
                   <button @click.stop="removeBlock(i-1)" class="remove-btn-refined">✕</button>
                 </div>

                 <!-- 현재 채워야 할 타겟 표시 (점선 알약) -->
                 <div v-else class="empty-stair-pill">
                    <div v-if="currentStep === i-1" class="text-slate-300 text-3xl animate-pulse">📥</div>
                 </div>
            </div>

            <!-- 골 지점 -->
            <div class="absolute w-[80px] h-[80px] flex items-center justify-center transition-all duration-500" 
                 :style="{ left: (currentQuest.solution.length * 55 + 60) + 'px', bottom: (currentQuest.solution.length * 80 + 30) + 'px' }">
                <div class="text-5xl animate-bounce">👑</div>
            </div>
          </div>

          <!-- 오리 캐릭터: 포지셔닝 보정 -->
          <div id="duck-actor" 
               class="absolute transition-all duration-700 z-[100]" 
               :class="{ 'animate-fall': isFalling, 'animate-pixar-fly': isFlying }" 
               :style="{ ...duckPosition, width: '110px', height: '110px' }" 
               @mouseenter="handleDuckHover(true)" 
               @mouseleave="handleDuckHover(false)">
             <div v-if="isFlying" class="fixed inset-0 bg-white/30 backdrop-blur-sm z-[200] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-1000">
               <div class="text-7xl font-black text-amber-500 animate-bounce mb-4 font-jua text-shadow-lg">AWESOME! 🐥</div>
               <div class="text-4xl text-slate-700 font-bold opacity-80">파닥파닥! 다음 단계로 날아가요! ✨</div>
             </div>

             <div class="w-full h-full relative" :style="{ transform: isHovering ? 'scale(1.15) rotate(5deg)' : 'scale(1)' }">
               <img class="duck-frame" :src="duckAssets.idle" :style="{ opacity: (currentEmotion === 'idle' && !isFlying) ? 1 : 0 }" alt="idle">
               <img class="duck-frame" :src="duckAssets.happy" :style="{ opacity: (currentEmotion === 'happy' || isFlying) ? 1 : 0 }" alt="happy">
               <img class="duck-frame" :src="duckAssets.sad" :style="{ opacity: currentEmotion === 'sad' ? 1 : 0 }" alt="sad">
               <img class="duck-frame" :src="duckAssets.hover" :style="{ opacity: currentEmotion === 'hover' ? 1 : 0 }" alt="hover">
               
               <!-- 비행 깃털/구름 효과 -->
               <div v-if="isFlying" class="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                 <div class="text-4xl animate-ping opacity-60">🪶</div>
                 <div class="text-4xl animate-ping opacity-40 delay-300">✨</div>
               </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽 영역: 문제 풀이 (비율 확대: 58%) -->
        <div class="w-full md:w-[58%] p-10 flex flex-col bg-white overflow-y-auto h-full">
          
          <!-- 1단계: 퍼즐 -->
          <div v-if="stage === 1" class="space-y-10 h-full flex flex-col">
            <div class="border-l-8 border-yellow-400 pl-6 py-2">
              <span class="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black mb-2 inline-block">QUEST {{ currentQuestIdx + 1 }}</span>
              <h2 class="text-3xl font-black text-slate-800 font-jua mb-2">{{ currentQuest.title }}</h2>
              <p class="text-slate-500 font-bold text-lg">{{ currentQuest.desc }}</p>
            </div>
            
            <div class="flex flex-col gap-6 flex-grow">
               <!-- 힌트 영역 -->
               <div v-if="showHint" class="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
                 <p class="text-rose-600 font-black flex items-center gap-2">
                   <span>💡 힌트</span>
                   <span class="text-sm font-bold text-rose-500">{{ currentQuest.hint || "블록의 순서가 중요해요!" }}</span>
                 </p>
               </div>

               <!-- 선택 가능한 블록: 콤팩트 디자인 -->
               <div class="bg-white p-6 rounded-[2.5rem] border-2 border-slate-200 shadow-sm">
                <h3 class="text-slate-400 font-black text-xs mb-3 tracking-widest uppercase flex items-center gap-2">
                   <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
                   코딩 블록 보관함
                </h3>
                <div class="flex flex-wrap gap-2">
                  <div v-for="block in availableBlocks" 
                       :key="block.id" 
                       draggable="true" 
                       @dragstart="onDragStart($event, block)" 
                       class="block-item group px-4 py-2.5 rounded-2xl text-xs font-black shadow-sm text-slate-800 transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 bg-slate-50 border-b-4 border-slate-200" 
                       :class="[block.color, { 'opacity-30 grayscale cursor-not-allowed': isBlockUsed(block.id) }]">
                    <span class="bg-white/50 w-6 h-6 rounded-lg flex items-center justify-center text-sm">{{ block.icon }}</span>
                    {{ block.text }}
                  </div>
                </div>
              </div>

              <!-- 안내 메시지 (복구) -->
              <div v-if="droppedBlocks.every(b => !b)" class="mt-4 p-8 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-3 bg-white/50 animate-pulse">
                <div class="text-4xl">🖱️</div>
                <p class="font-black text-sm text-center leading-relaxed">왼쪽의 비어있는 계단으로<br>블록을 드래그해서 올려주세요!</p>
              </div>
            </div>
          </div>

          <div v-else-if="stage === 2" class="space-y-10 h-full flex flex-col">
            <div class="space-y-2">
              <span class="px-5 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-sm font-black tracking-tighter">PHASE 02</span>
              <h2 class="text-4xl font-black text-slate-800 tracking-tight">실전 코드 구현</h2>
              <div class="mt-4 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                <p class="text-slate-600 font-bold leading-relaxed">
                  <span class="text-indigo-500">Q.</span> {{ currentQuest.title }} 로직을 파이썬으로 구현해 보세요!
                </p>
              </div>
            </div>

            <!-- 코드 에디터: 테마 보강 -->
            <div class="bg-slate-900 rounded-[2.5rem] p-10 text-emerald-400 font-mono text-xl leading-relaxed shadow-2xl relative border-t-8 border-slate-800">
              <div class="absolute top-4 right-8 bg-slate-800 px-3 py-1 rounded-full text-slate-500 text-[10px] uppercase tracking-widest font-bold border border-slate-700">Python v3.11</div>
              <div><span class="text-pink-500">def</span> <span class="text-blue-400">{{ currentQuest.id === 5 ? 'check_fee' : 'process_logic' }}</span>(input_data):</div>
              <div class="pl-8 flex items-center gap-2"><span class="text-pink-500">if</span> value == <input v-model="codeInputs.price" type="text" :placeholder="currentQuest.codeValidation.price" class="bg-slate-800 border-b-4 border-emerald-500 w-32 text-center outline-none focus:bg-slate-700 transition-colors">:</div>
              <div class="pl-16 flex items-center gap-2">result = <input v-model="codeInputs.fee1" type="text" :placeholder="currentQuest.codeValidation.fee1" class="bg-slate-800 border-b-4 border-emerald-500 w-32 text-center outline-none focus:bg-slate-700 transition-colors"></div>
              <div class="pl-8"><span class="text-pink-500">else</span>:</div>
              <div class="pl-16 flex items-center gap-2">result = <input v-model="codeInputs.fee2" type="text" :placeholder="currentQuest.codeValidation.fee2" class="bg-slate-800 border-b-4 border-emerald-500 w-32 text-center outline-none focus:bg-slate-700 transition-colors"></div>
              <div class="pl-8"><span class="text-pink-500">return</span> result</div>
            </div>
            <!-- 코드 실행 버튼: Pixar 스타일 고도화 -->
            <button @click="checkStage2" class="run-code-btn group">
              <span class="flex items-center justify-center gap-3">
                <span class="btn-icon">▶</span>
                <span class="btn-text">로직 검증 및 코드 실행</span>
              </span>
              <div class="btn-glow"></div>
            </button>
          </div>

          <div v-else-if="stage === 3" class="space-y-8 h-full">
            <h2 class="text-2xl font-black text-slate-800 font-jua mb-2">3단계: 비즈니스 설계</h2>
            <div class="bg-blue-50 p-8 rounded-[2.5rem] border-4 border-blue-200 space-y-6">
              <p class="text-slate-700 font-bold text-lg italic">"이 로직을 더 고도화하려면?"</p>
              <div class="grid grid-cols-1 gap-4">
                <button v-for="(opt, i) in currentQuest.quizOptions" :key="i" @click="verifyStage3(opt.correct)" class="p-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 font-bold text-slate-600 shadow-sm text-left">
                  {{ opt.text }}
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="stage === 4" class="h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
            <div class="relative">
              <div class="text-9xl animate-bounce">🏆</div>
              <div class="absolute -top-4 -right-4 bg-amber-400 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white">
                {{ finalGrade }}
              </div>
            </div>
            
            <div class="space-y-4">
              <h2 class="text-5xl font-black text-slate-900 font-jua tracking-tight">미션을 완료했습니다!</h2>
              <p class="text-slate-400 font-bold text-xl uppercase tracking-widest">Training Results</p>
            </div>

            <!-- 성과 보드 -->
            <div class="w-full max-w-md bg-slate-50 border-4 border-slate-100 rounded-[3rem] p-8 shadow-inner space-y-6">
              <div class="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <span class="text-slate-400 font-black">최종 점수</span>
                <span class="text-4xl font-black text-indigo-600">{{ score }}<span class="text-xl ml-1 text-slate-400">pts</span></span>
              </div>
              <div class="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <span class="text-slate-400 font-black">평가 등급</span>
                <span class="text-4xl font-black text-amber-500">{{ finalGrade }}</span>
              </div>
              <div class="pt-2 text-slate-500 font-bold leading-relaxed whitespace-pre-line">
                {{ evaluationMessage }}
              </div>
            </div>

            <div class="flex gap-4">
              <button @click="resetGame" class="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 transition-all text-xl">다시 시작하기</button>
              <button @click="$emit('close')" class="bg-slate-800 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 transition-all text-xl">나가기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * [수정일: 2026-01-27]
 * [수정내용: 워처(watcher) 실행 시 초기화 순서로 인한 오류 수정 및 로딩 상태 제어 로직 보강]
 */
import { ref, reactive, computed, onMounted } from 'vue';
import { aiQuests } from './support/unit1/logic-mirror/data/stages.js';

const props = defineProps({
  initialQuestIndex: { type: Number, default: 0 }
});
const emit = defineEmits(['close', 'quest-complete']);

// --- State ---
const currentQuestIdx = ref(props.initialQuestIndex);
const currentQuest = computed(() => aiQuests[currentQuestIdx.value] || aiQuests[0]);
const isLoading = ref(true);
const loadingStep = ref("캐릭터 준비 중...");
const stage = ref(1);
const score = ref(0);
const currentStep = ref(0);
const duckAssets = reactive({ 
  idle: '/image/duck_idle.png', 
  happy: '/image/duck_happy.png', 
  sad: '/image/duck_sad.png', 
  hover: '/image/duck_hover.png' 
});
const currentEmotion = ref('idle');
const bubbleMsg = ref("");
const showBubble = ref(false);
const isFalling = ref(false);
const isFlying = ref(false);
const isHovering = ref(false);

// Quiz State
const availableBlocks = ref([]);
const droppedBlocks = ref([]);
const showHint = ref(false);
const hintMessage = ref("");

const isBlockUsed = (id) => droppedBlocks.value.some(b => b && b.id === id);
const codeInputs = reactive({ price: '', fee1: '', fee2: '' });
const stage3Options = computed(() => currentQuest.value.quizOptions);

const initQuestData = () => {
    if (!currentQuest.value) return;
    
    availableBlocks.value = [...currentQuest.value.cards];
    droppedBlocks.value = new Array(currentQuest.value.cards.length).fill(null);
    hintMessage.value = currentQuest.value.hint || "블록을 순서대로 드래그하세요!";
    currentStep.value = 0;
    stage.value = 1;
    score.value = 0;
    
    // 이 시점에 codeInputs는 이미 반응형 객체로 하단에 정의되어 있어야 함
    codeInputs.price = '';
    codeInputs.fee1 = '';
    codeInputs.fee2 = '';
    
    // 로딩 완료 처리
    setTimeout(() => {
        isLoading.value = false;
    }, 800);
};

import { watch } from 'vue';
watch(currentQuest, initQuestData, { immediate: true });

onMounted(() => {
    // 필요한 초기화 작업이 있다면 여기에 추가
});

const duckPosition = computed(() => {
    // 1. START 위치 초기값 (축소된 가로 너비에 맞춰 보정)
    let x = 40;
    let y = 110;

    // 2. 현재 단계 계단 위치로 이동
    if (currentStep.value > 0) {
        const stairIndex = Math.min(currentStep.value, currentQuest.value.solution.length - 1);
        x = (stairIndex * 55 + 20) + 40; // 계단 left + 보정
        y = (stairIndex * 80 + 30) + 55; // 계단 bottom + 보정
    }
    
    return {
        bottom: y + 'px',
        left: x + 'px'
    };
});

const finalGrade = computed(() => {
    if (score.value >= 250) return 'S';
    if (score.value >= 200) return 'A';
    if (score.value >= 150) return 'B';
    return 'C';
});

const evaluationMessage = computed(() => {
    if (finalGrade.value === 'S') return "완벽한 설계와 구현 능력입니다!\n라이언님은 이미 훌륭한 엔지니어예요!";
    if (finalGrade.value === 'A') return "매우 훌륭합니다!\n조금만 더 연습하면 마스터가 될 수 있어요.";
    if (finalGrade.value === 'B') return "고생하셨습니다!\n프로그래밍의 기초를 착실히 다졌네요.";
    return "수고하셨습니다!\n한 번 더 도전하여 높은 등급을 받아보세요!";
});

// --- Methods ---
const displayMessage = (msg) => {
    bubbleMsg.value = msg;
    showBubble.value = true;
    // 이전 타이머 제거 로직이 필요할 수 있으나 여기선 단순화
    setTimeout(() => {
      if (bubbleMsg.value === msg) showBubble.value = false;
    }, 3000);
};

const onDragStart = (e, block) => {
    e.dataTransfer.setData("blockId", block.id);
};

const onDrop = (e, stairIdx) => {
    if (stairIdx !== currentStep.value) {
        displayMessage("순서대로 계단을 올라가야 해요!");
        return;
    }

    const id = e.dataTransfer.getData("blockId");
    const block = availableBlocks.value.find(b => b.id === id);
    const correctId = currentQuest.value.solution[stairIdx];
    
    if (id === correctId) {
        droppedBlocks.value[stairIdx] = block;
        currentStep.value++;
        score.value += 20;
        currentEmotion.value = 'happy';
        showHint.value = false;
        displayMessage("정답이에요! 껑충!");
        
        if (currentStep.value === currentQuest.value.solution.length) {
            isFlying.value = true;
            displayMessage("파닥파닥! 날아올라요! 🐥");
            setTimeout(() => { 
                stage.value = 2; 
                isFlying.value = false;
                currentEmotion.value = 'idle'; 
            }, 2500);
        } else {
            setTimeout(() => currentEmotion.value = 'idle', 1000);
        }
    } else {
        handleFailure();
    }
};

const removeBlock = (idx) => {
    if (idx < currentStep.value) {
        // 이미 맞춘 블록을 지울 때의 로직 (현재는 순차적이므로 마지막 블록만 지우는 것이 안전할 수 있음)
        if (idx === currentStep.value - 1) {
            droppedBlocks.value[idx] = null;
            currentStep.value--;
            score.value -= 20;
        }
    }
};

const handleFailure = () => {
    currentEmotion.value = 'sad';
    displayMessage("으아앙! 틀렸어요!");
    showHint.value = true;
    
    // 오리가 계단에서 미끄러지는 연출
    isFalling.value = true;
    setTimeout(() => {
        isFalling.value = false;
        currentEmotion.value = 'idle';
    }, 1000);
};

const checkStage2 = () => {
    const val = currentQuest.value.codeValidation;
    if (codeInputs.price === val.price && codeInputs.fee1 === val.fee1 && codeInputs.fee2 === val.fee2) {
        score.value += 50;
        currentEmotion.value = 'happy';
        displayMessage("코드 구현 성공!");
        setTimeout(() => { stage.value = 3; currentEmotion.value = 'idle'; }, 1500);
    } else {
        handleFailure();
    }
};

const verifyStage3 = (correct) => {
    if (correct) {
        score.value += 100;
        currentEmotion.value = 'happy';
        displayMessage("설계 천재 라이언님!");
        setTimeout(() => stage.value = 4, 1500);
        emit('quest-complete', currentQuestIdx.value);
    } else {
        handleFailure();
    }
};

const handleDuckHover = (state) => {
    if (isFalling.value) return;
    isHovering.value = state;
    if (state) {
        currentEmotion.value = 'hover';
        displayMessage("헤헤, 간지러워요!");
    } else {
        currentEmotion.value = 'idle';
    }
};

const resetGame = () => {
    stage.value = 1;
    score.value = 0;
    currentStep.value = 0;
    droppedBlocks.value = new Array(5).fill(null);
    showHint.value = false;
    codeInputs.price = '';
    codeInputs.fee1 = '';
    codeInputs.fee2 = '';
    currentEmotion.value = 'idle';
};

onMounted(() => {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic:wght@400;700;800&display=swap');

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
}

.font-jua { font-family: 'Jua', sans-serif; }

.block-item { 
    cursor: grab; 
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 6px 0 rgba(0,0,0,0.1), inset 0 -2px 5px rgba(255,255,255,0.3);
}
.block-item:active { cursor: grabbing; transform: translateY(2px); }

/* --- START 플랫폼 (3D 회색 디자인) --- */
.stair-start {
    position: absolute;
}
.platform-top {
    height: 70px;
    background: #cccccc;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: #444;
    position: relative;
    z-index: 2;
}
.platform-side {
    height: 30px;
    background: #999999;
    border-radius: 0 0 20px 20px;
    margin-top: -10px;
    position: relative;
    z-index: 1;
}

/* --- 알약 형태 계단 타겟 --- */
.stair-pill {
    position: absolute;
    background: transparent;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.empty-stair-pill {
    width: 100%;
    height: 100%;
    background: white;
    border: 3px dashed #cbd5e1;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.active-target .empty-stair-pill {
    border-color: #fbbf24;
    background: rgba(255, 251, 235, 0.5);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
}

/* --- 배치된 블록 (이미지 참고 고도화) --- */
.placed-block-refined {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 100px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 15px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    border-bottom: 6px solid transparent; /* 동적 색상 적용을 위해 */
    animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 하단 테두리 색상 클래스 */
.placed-block-refined.border-indigo-500 { border-color: #6366f1; }
.placed-block-refined.border-emerald-500 { border-color: #22c55e; }
.placed-block-refined.border-amber-500 { border-color: #f59e0b; }

.block-text {
    font-size: 0.9rem;
    font-weight: 800;
    color: #1e293b;
    flex-grow: 1;
    white-space: nowrap;
}

.remove-btn-refined {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.2s;
}

.remove-btn-refined:hover {
    background: #fb7185;
    color: white;
}

@keyframes bounceIn {
    0% { transform: scale(0.8) translateY(10px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* --- 디즈니 픽사 스타일 비행 애니메이션 --- */
@keyframes pixarFly {
    0% { transform: translateY(0) scale(1) rotate(0deg); }
    15% { transform: translateY(20px) scale(1.3, 0.7) rotate(-5deg); filter: brightness(1.2); } /* 웅크리기(Anticipation) */
    40% { transform: translateY(-300px) scale(0.8, 1.4) rotate(15deg); filter: contrast(1.2); } /* 급상승 */
    55% { transform: translateY(-350px) scale(1.1) rotate(-10deg); }
    70% { transform: translateY(-500px) scale(0.9) rotate(20deg); opacity: 0.8; }
    100% { transform: translateY(-1000px) rotate(360deg); opacity: 0; } /* 화면 밖으로 슝! */
}
.animate-pixar-fly { 
    animation: pixarFly 2.2s forwards cubic-bezier(0.45, 0.05, 0.55, 0.95); 
    z-index: 999;
}

.duck-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.3s;
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
}

@keyframes fall {
    0% { transform: translateY(0) rotate(0deg); }
    20% { transform: translateY(-30px) rotate(15deg); }
    100% { transform: translateY(600px) rotate(1080deg); opacity: 0; }
}
.animate-fall { animation: fall 1s forwards cubic-bezier(0.55, 0.055, 0.675, 0.19); }

.duck-bubble {
    position: relative;
    background: white;
    border: 3px solid #fbbf24;
    border-radius: 20px;
    padding: 12px;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}
.duck-bubble::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 20px;
    border-width: 15px 15px 0 0;
    border-style: solid;
    border-color: #fbbf24 transparent transparent transparent;
}

/* --- 코드 실행 버튼 고도화 디자인 --- */
.run-code-btn {
    display: block;
    width: 100%;
    margin-top: 2rem;
    background-color: #1e293b !important;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    color: #ffffff !important;
    font-weight: 900;
    padding: 1.5rem !important;
    border-radius: 2rem !important;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: none !important;
    border-bottom: 6px solid #000000 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
    cursor: pointer;
    z-index: 10;
}

.run-code-btn:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
    background: linear-gradient(135deg, #334155 0%, #1e293b 100%) !important;
}

.run-code-btn:active {
    transform: translateY(2px);
    border-bottom-width: 2px;
}

.btn-icon {
    background-color: #22c55e !important;
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
    font-size: 1.2rem !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5) !important;
}

.btn-text {
    font-size: 1.25rem;
    letter-spacing: -0.025em;
    font-family: 'Jua', sans-serif;
}

.btn-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}

.run-code-btn:hover .btn-glow {
    opacity: 1;
}
</style>