<template>
  <div v-if="result" class="evaluation-result mt-6 animate-in slide-in-from-top-4 duration-500">
    <!-- 
      [수정일: 2026-01-23]
      [수정내용: AI 채점 결과를 보여주는 UI 컴포넌트 구현]
    -->
    <div class="nes-container with-title mt-6 box-jrpg" style="border-width: 4px;">
      <p class="title text-[10px] bg-white text-black px-2 uppercase font-retro">VICTORY_FANFARE</p>
      
      <div class="p-4 flex items-center justify-between mb-8 border-b-2 border-white/20">
        <div class="flex items-center gap-8">
          <div class="nes-badge is-icon">
            <i class="nes-icon star is-medium"></i>
            <span class="nes-text is-warning text-lg ml-2 font-retro">{{ result.score }}</span>
          </div>
          <div>
            <h4 class="text-xs text-white mb-1 font-retro">QUEST_RESULTS</h4>
            <div class="flex gap-2">
              <i v-for="n in 3" :key="n" :class="['nes-icon star is-small', (result.score/33.4 >= n) ? '' : 'is-transparent']"></i>
            </div>
            <p class="text-[8px] text-yellow-500 uppercase font-mono mt-2 font-retro">STATUS: {{ result.status }}</p>
          </div>
        </div>
      </div>

      <div class="px-4 py-2 space-y-10">
        <!-- 총평 (Legendary Advice) -->
        <section>
          <div class="flex items-center gap-4 mb-4">
             <i class="nes-icon is-small coin"></i>
             <span class="text-xs text-yellow-400 capitalize font-bold">Mage_Council_Feedback</span>
          </div>
          <div class="nes-container is-rounded bg-black/40 p-6">
            <p class="text-sm text-white leading-loose font-bold">
              "{{ result.feedback }}"
            </p>
          </div>
        </section>

        <!-- 개선 사항 (Critical Training) -->
        <section v-if="result.suggestions && result.suggestions.length">
          <div class="flex items-center gap-4 mb-4">
             <i class="nes-icon heart is-small"></i>
             <span class="text-xs text-error uppercase font-bold">Training_Notes</span>
          </div>
          <ul class="nes-list is-circle text-white px-4">
            <li v-for="(suggestion, i) in result.suggestions" :key="i" class="text-xs mb-3 font-bold">
              {{ suggestion }}
            </li>
          </ul>
        </section>

        <!-- 정답 확인 버튼 -->
        <div class="pt-8 flex justify-end">
          <button @click="$emit('show-diff')" class="nes-btn is-warning text-sm font-retro">
            [ VIEW_ANCIENT_SCROLL ]
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  result: {
    type: Object,
    default: null
  }
});

const scoreContainerClass = computed(() => {
  const score = props.result?.score || 0;
  if (score >= 80) return 'nes-container is-success';
  if (score >= 50) return 'nes-container is-warning';
  return 'nes-container is-error';
});

const scoreTextColor = computed(() => {
  const score = props.result?.score || 0;
  if (score >= 80) return 'nes-text is-success';
  if (score >= 50) return 'nes-text is-warning';
  return 'nes-text is-error';
});
</script>
