<template>
  <div class="guidebook-container flex flex-col gap-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- 
      [작성일: 2026-01-23]
      [작성내용: Unit 1 가이드북 (게임 매뉴얼) 컴포넌트 구현]
    -->
    
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-[1.5rem] bg-slate-950 border-4 border-black p-8 group shadow-[4px_4px_0_0_#000]">
      <div class="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <BookOpen class="w-40 h-40 text-indigo-400" />
      </div>
      <div class="relative z-10">
        <h2 class="text-[10px] text-yellow-400 font-black tracking-[0.5em] uppercase mb-4 orbitron">ADVENTURE_GUIDE</h2>
        <h1 class="text-3xl font-black text-white mb-4 rajdhani italic uppercase leading-none">
          SUPER_CODE_<span class="text-cyan-400">ADVENTURE</span>
        </h1>
        <p class="text-slate-300 text-sm max-w-2xl leading-relaxed font-bold">
          분해된 로직 파츠를 장착하고, 강력한 파이썬 주문을 영창하여 월드를 정화하십시오. 
          아래는 당신의 성공적인 모험을 위한 가이드입니다.
        </p>
      </div>
    </div>

    <!-- Guide Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Logic Puzzle -->
      <div class="guide-card p-6 bg-slate-900 border-4 border-black rounded-[1.5rem] shadow-[4px_4px_0_0_#000] hover:translate-y-[-4px] transition-all">
        <div class="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 border-2 border-cyan-400">
          <Puzzle class="w-6 h-6 text-cyan-400" />
        </div>
        <h3 class="text-lg font-black text-white mb-2 orbitron uppercase tracking-wider">STAGE 01: LOGIC_BLOCKS</h3>
        <p class="text-slate-300 text-xs leading-relaxed font-bold">
          분해된 알고리즘 조각을 올바른 순서로 배치하십시오. 들여쓰기(Indentation)가 정확해야 동기화율이 상승합니다.
        </p>
      </div>

      <!-- Code Editor -->
      <div class="guide-card p-6 bg-slate-900 border-4 border-black rounded-[1.5rem] shadow-[4px_4px_0_0_#000] hover:translate-y-[-4px] transition-all">
        <div class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 border-2 border-indigo-400">
          <Zap class="w-6 h-6 text-indigo-400" />
        </div>
        <h3 class="text-lg font-black text-white mb-2 orbitron uppercase tracking-wider">STAGE 02: CODEWIZARD</h3>
        <p class="text-slate-300 text-xs leading-relaxed font-bold">
          직접 파이썬 마법을 영창하십시오. <span class="text-indigo-400 font-bold">if, for, while</span> 등 강력한 구문 사용 시 엔진이 즉각적으로 반응합니다.
        </p>
      </div>

      <!-- Sync Telemetry -->
      <div class="guide-card p-6 bg-slate-900 border-4 border-black rounded-[1.5rem] shadow-[4px_4px_0_0_#000] hover:translate-y-[-4px] transition-all">
        <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 border-2 border-emerald-400">
          <Activity class="w-6 h-6 text-emerald-400" />
        </div>
        <h3 class="text-lg font-black text-white mb-2 orbitron uppercase tracking-wider">HERO_HUD & SYNC</h3>
        <p class="text-slate-300 text-xs leading-relaxed font-bold">
          작성 중인 코드의 논리적 충실도를 실시간으로 측정합니다. 100%에 가까워질수록 미션 성공 확률(Victory)이 높아집니다.
        </p>
      </div>

      <!-- Impact Engine -->
      <div class="guide-card p-6 bg-slate-900 border-4 border-black rounded-[1.5rem] shadow-[4px_4px_0_0_#000] hover:translate-y-[-4px] transition-all">
        <div class="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4 border-2 border-rose-400">
          <Flame class="w-6 h-6 text-rose-400" />
        </div>
        <h3 class="text-lg font-black text-white mb-2 orbitron uppercase tracking-wider">BATTLE_IMPACT</h3>
        <p class="text-slate-300 text-xs leading-relaxed font-bold">
          강력한 코드를 주입하거나 제출할 때 화면이 진동합니다. 이는 당신의 논리가 가상 월드에 물리적인 영향을 주고 있음을 의미합니다.
        </p>
      </div>
    </div>

    <!-- Live Flow Tooltip -->
    <div class="bg-indigo-950 border-4 border-black p-6 rounded-[1.5rem] flex items-center gap-6 shadow-[4px_4px_0_0_#000]">
      <div class="shrink-0 w-16 h-16 bg-indigo-500/20 rounded-xl flex items-center justify-center border-2 border-indigo-400">
        <Share2 class="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
      <div>
        <h4 class="text-sm font-black text-white mb-1 orbitron tracking-tighter uppercase">LOGIC_MIRROR_MAGIC</h4>
        <p class="text-slate-400 text-[10px] font-bold leading-snug">
          영창 중인 주문은 실시간으로 시각적 순서도(Flowchart)로 변환됩니다. 사이드바 하단의 디스플레이를 통해 로직의 흐름을 상시 모니터링하십시오.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, Puzzle, Zap, Activity, Flame, Share2 } from 'lucide-vue-next';
</script>

<style scoped>
.guide-card:hover {
  transform: translateY(-5px);
  background: rgba(15, 23, 42, 0.4);
}
</style>
