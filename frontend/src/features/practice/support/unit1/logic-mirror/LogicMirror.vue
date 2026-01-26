<template>
  <div :class="['logic-mirror-modal-overlay', { 'animate-shake': triggerShake }]" @click.self="$emit('close')">
    <div class="logic-mirror-container">
      <!-- Header with Close Button -->
      <button class="modal-close-btn" @click="$emit('close')" title="닫기 (ESC)">
        <X class="w-6 h-6" />
      </button>

      <!-- Sidebar Navigation -->
      <aside class="sidebar w-[400px] border-r border-slate-800/50 flex flex-col items-center md:items-stretch bg-[#0f172a]/80 backdrop-blur-xl shrink-0">
        <div class="sidebar-header p-8 flex flex-col gap-6">
          <div class="flex items-center gap-4">
            <div class="header-logo-icon bg-indigo-600 p-2 rounded-2xl shadow-xl shadow-indigo-600/30">
              <BrainCircuit class="text-white w-7 h-7" />
            </div>
            <div class="hidden md:block">
              <h1 class="text-xl font-black text-white tracking-tighter uppercase">PseudoGym</h1>
              <p class="text-[9px] text-indigo-400 font-bold tracking-[0.3em] uppercase opacity-80">Logic Forge</p>
            </div>
          </div>

          <!-- Engineer Dashboard -->
          <div class="bg-slate-900/60 rounded-3xl p-5 border border-white/5 space-y-4 shadow-inner">
            <div class="flex items-center gap-4">
              <div class="relative">
                <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                  <img :src="mentorImage" alt="Mentor Duck" class="w-12 h-12 object-contain transition-all duration-700" :class="{ 'grayscale contrast-125': userStability === 1 }" />
                </div>
                <div class="absolute -top-1 -right-1 flex h-4 w-4">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ currentClass }}</p>
                <h3 class="text-sm font-black text-white">Level {{ userLevel }}</h3>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <div class="flex justify-between items-center text-[10px] font-bold">
                <span class="text-slate-400 uppercase tracking-tighter">Stability</span>
                <div class="flex gap-1">
                  <span v-for="i in 3" :key="i" :class="['text-xs transition-opacity duration-300', i <= userStability ? 'opacity-100' : 'opacity-20 grayscale']">❤️</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-[9px] font-black text-indigo-400/80 uppercase">
                  <span>Knowledge (XP)</span>
                  <span>{{ userXP }} / {{ nextLevelXP }}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 transition-all duration-1000 shadow-lg shadow-indigo-500/30" :style="{ width: xpProgress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <nav class="mt-8 px-4 space-y-2 shrink-0">
          <button 
              @click="activeTab = 'analyze'"
              :class="['w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden', activeTab === 'analyze' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-1' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300']"
          >
            <Layers :class="['w-5 h-5 transition-transform duration-500', activeTab === 'analyze' ? 'scale-110' : 'group-hover:scale-110']" />
            <span class="hidden md:block text-sm font-bold tracking-tight">코드 분석 (AI)</span>
          </button>
          
          <button 
              @click="activeTab = 'practice'"
              :class="['w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden', activeTab === 'practice' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-1' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300']"
          >
            <BookOpen :class="['w-5 h-5 transition-transform duration-500', activeTab === 'practice' ? 'scale-110' : 'group-hover:scale-110']" />
            <span class="hidden md:block text-sm font-bold tracking-tight">설계 훈련소</span>
          </button>
        </nav>

        <!-- Chatbot Area -->
        <div class="flex-1 min-h-0 px-4 mt-8 mb-4 flex flex-col overflow-hidden">
          <div class="px-4 py-2 flex items-center gap-2 border-b border-white/5 mb-3 shrink-0">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[14px] font-black text-indigo-300 uppercase tracking-widest">Mentor 'DUCK'</span>
          </div>

          <div id="chat-scroll" class="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar-thin">
            <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed relative group shadow-sm', 
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5']">
                {{ msg.text }}
                <div v-if="msg.role === 'assistant'" class="absolute -left-2 top-0 text-[15px]">🦆</div>
              </div>
            </div>
            <div v-if="isChatLoading" class="flex justify-start">
              <div class="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none animate-pulse flex gap-1">
                <span class="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></span>
                <span class="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>

          <div class="mt-4 relative shrink-0">
            <input 
              v-model="chatInput" 
              @keyup.enter="sendChatMessage"
              placeholder="멘토에게 물어보기..."
              class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all pr-10"
            />
            <button @click="sendChatMessage" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors">
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="sidebar-footer p-6 border-t border-slate-800/50 shrink-0">
          <button 
            @click="$emit('close')"
            class="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 active:scale-95"
          >
            <LogOut class="w-5 h-5" />
            <span class="hidden md:block text-sm font-bold tracking-tight">세션 종료</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content flex-1 flex flex-col bg-[#020617] overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

        <!-- Analyze Tab (Vertical Split) -->
        <div v-if="activeTab === 'analyze'" class="flex-1 flex flex-col overflow-hidden relative z-10">
          
          <!-- TOP: Editor/Puzzle Workspace Area -->
          <section class="editor-section h-[55%] flex flex-col border-b border-slate-800/50 bg-[#0f172a]/20">
            <div class="h-14 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 shrink-0">
               <p class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal class="w-3 h-3" />
                Puzzle Workspace
              </p>
              <div class="flex items-center gap-4">
                <button 
                  @click="initQuestBlocks"
                  class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5"
                >
                  <History class="w-3 h-3" />
                  <span>새로고침</span>
                </button>
                <button 
                    @click="analyzeCode"
                    :disabled="loading || userPuzzleSolution.length === 0"
                    class="flex items-center gap-3 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50 shadow-2xl shadow-indigo-600/30 active:scale-95"
                >
                  <template v-if="loading">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>진단 중...</span>
                  </template>
                  <template v-else>
                    <Sparkles class="w-4 h-4" />
                    <span>설계 분석 가동</span>
                  </template>
                </button>
              </div>
            </div>

            <div class="flex-1 flex overflow-hidden">
                <!-- Left: Mission & Palette -->
                <div class="w-[380px] border-r border-slate-800/50 bg-[#0f172a]/60 flex flex-col overflow-hidden shrink-0">
                  <!-- Mission Objective Section -->
                  <div class="p-6 border-b border-white/5 space-y-4 shrink-0 bg-indigo-500/5">
                    <div class="flex items-center gap-4">
                      <span class="text-3xl">{{ currentQuest.emoji }}</span>
                      <div>
                        <h4 class="text-lg font-black text-white tracking-tight uppercase">{{ currentQuest.title }}</h4>
                        <p class="text-xs text-indigo-400 font-bold tracking-widest uppercase opacity-80">{{ currentQuest.logic_type }}</p>
                      </div>
                    </div>
                    <div class="p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 shadow-huge">
                      <p class="text-[16px] text-slate-300 leading-relaxed font-medium">
                        {{ currentQuest.description }}
                      </p>
                    </div>
                    <div v-if="currentQuest.examples" class="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <p class="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles class="w-3.5 h-3.5" /> Example Case
                      </p>
                      <pre class="text-[12px] text-emerald-100/70 font-mono leading-tight whitespace-pre-wrap">{{ currentQuest.examples }}</pre>
                    </div>
                  </div>

                  <!-- Palette Header -->
                  <div class="px-6 py-3.5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Logic Palette</p>
                    <span class="text-[10px] font-bold text-slate-600 tracking-tighter">{{ shuffledPalette.length }} Blocks Available</span>
                  </div>

                  <!-- Palette Body -->
                  <div class="flex-1 p-6 overflow-y-auto custom-scrollbar-thin bg-slate-900/20">
                    <div class="space-y-3">
                      <div 
                        v-for="(block, index) in shuffledPalette" 
                        :key="'palette-' + index"
                        @click="useCard(index)"
                        :class="['puzzle-block palette group cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-300', block.color]"
                      >
                        <div class="puzzle-block-handle opacity-50"></div>
                        <div class="flex items-center gap-4 px-5 py-3 relative z-10">
                          <span class="text-lg">{{ block.icon }}</span>
                          <span class="text-xs font-black text-white drop-shadow-md leading-none">{{ block.text_ko }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Workspace -->
                <div class="flex-1 flex flex-col bg-[#020617]/40 relative">
                  <div class="flex-1 p-10 overflow-y-auto custom-scrollbar-thin relative">
                    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#6366f1 1px, transparent 1px); background-size: 24px 24px;"></div>
                    
                    <div v-if="userPuzzleSolution.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-slate-700 pointer-events-none">
                      <Layers class="w-12 h-12 opacity-10 mb-4" />
                      <p class="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Place logic blocks here</p>
                    </div>

                    <div class="puzzle-stack space-y-0.5 relative z-10">
                      <div 
                        v-for="(block, index) in userPuzzleSolution" 
                        :key="'solution-' + index"
                        @click="unuseCard(index)"
                        :class="['puzzle-block active group cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all duration-300', block.color]"
                        :style="{ marginLeft: (block.indent || 0) * 32 + 'px' }"
                      >
                        <div class="puzzle-block-handle"></div>
                        <div class="puzzle-block-socket"></div>
                        <div class="flex items-center gap-5 px-6 py-4 relative z-10">
                          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-lg">{{ block.icon }}</div>
                          <div class="flex-1">
                            <p class="text-[14px] font-black text-white drop-shadow-md">{{ block.text_ko }}</p>
                            <p class="text-[13px] font-mono font-black text-white mt-1 uppercase tracking-wider drop-shadow-md">{{ block.text_py }}</p>
                          </div>
                          <X class="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </section>

          <!-- BOTTOM: Specification Results Area -->
          <section class="spec-section flex-1 min-h-0 flex flex-col bg-[#020617]/60">
            <div class="h-14 flex items-center px-8 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md shrink-0">
              <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <Layout class="text-purple-500 w-3 h-3" />
                <span>Extracted Architecture Map</span>
              </div>
            </div>

            <!-- Empty State / Analysis Result -->
            <div v-if="!generatedResults && !loading" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div class="p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800/50 mb-6 group hover:border-indigo-500/30 transition-all duration-700 shadow-2xl">
                <BrainCircuit class="text-slate-700 w-10 h-10 group-hover:text-indigo-500 transition-colors duration-500" />
              </div>
              <h3 class="text-lg font-black text-white tracking-tight">분석 결과가 여기에 표시됩니다</h3>
              <p class="text-slate-600 mt-2 text-[11px] font-medium font-mono uppercase tracking-widest">Complete the logic puzzle above to trigger AI analysis</p>
            </div>

            <div v-else-if="loading" class="flex-1 p-10 flex gap-8 items-start justify-center">
              <div v-for="i in 3" :key="i" class="w-72 h-40 bg-white/5 rounded-3xl border border-white/5 animate-pulse relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            </div>

            <div v-else class="flex-1 flex flex-col overflow-hidden">
              <!-- Result Tabs -->
              <div class="px-8 pt-6 pb-2 flex gap-3 overflow-x-auto custom-scrollbar-none shrink-0">
                <button
                    v-for="level in levels"
                    :key="level.id"
                    @click="activeLevel = level.id"
                    :class="['px-6 py-4 rounded-2xl border-2 transition-all duration-500 text-left min-w-[240px] relative overflow-hidden group', activeLevel === level.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-800/50 bg-slate-900/40 hover:border-slate-700']"
                >
                  <p :class="['text-[8px] font-black uppercase mb-1 tracking-[0.2em]', activeLevel === level.id ? 'text-indigo-400' : 'text-slate-600']">Level 0{{ level.id }}</p>
                  <h4 :class="['text-xs font-black tracking-tight', activeLevel === level.id ? 'text-white' : 'text-slate-400']">{{ level.subtitle }}</h4>
                </button>
              </div>

              <!-- content -->
              <div class="flex-1 overflow-y-scroll p-10 pt-4 custom-scrollbar-premium relative">
                <div class="max-w-6xl mx-auto space-y-8 pr-12">
                  <div class="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden shadow-huge">
                    <div class="flex items-start gap-8 mb-10">
                      <div :class="['p-5 rounded-2xl border border-white/10', levels[activeLevel-1].bgColor]">
                        <Lightbulb :class="['w-8 h-8', levels[activeLevel-1].color]" />
                      </div>
                      <div>
                        <h2 class="text-2xl font-black text-white tracking-tighter">{{ levels[activeLevel-1].title }}</h2>
                        <p class="text-sm text-slate-500 mt-2 leading-relaxed font-medium">{{ levels[activeLevel-1].desc }}</p>
                      </div>
                    </div>

                    <div class="relative group/view">
                       <div v-if="activeLevel === 3" class="relative bg-[#020617]/95 rounded-[2.5rem] border-2 border-indigo-500/20 h-[500px] overflow-y-scroll overflow-x-hidden custom-scrollbar-premium group/scroll">
                        <div class="absolute top-4 right-8 z-20 pointer-events-none opacity-40 group-hover/scroll:opacity-100 transition-opacity">
                          <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-slate-950/80 px-3 py-1 rounded-full border border-indigo-500/30">Scroll Down to Explore ↓</span>
                        </div>
                        <div class="p-16 flex justify-center">
                          <div id="mermaid-renderer" class="mermaid flex justify-center text-white scale-125 origin-top mb-12"></div>
                        </div>
                      </div>
                      <pre v-else class="relative p-10 bg-[#020617]/90 rounded-3xl border border-slate-800/50 font-mono text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">{{ generatedResults['level' + activeLevel] }}</pre>
                    </div>

                    <div class="mt-8 p-8 bg-indigo-600/5 rounded-3xl border border-indigo-500/10 flex gap-6">
                      <div class="bg-indigo-600 p-3 h-fit rounded-2xl shadow-xl shadow-indigo-600/30">
                        <MessageSquare class="text-white w-5 h-5" />
                      </div>
                      <p class="text-sm text-indigo-100/90 leading-relaxed italic font-bold">"{{ generatedResults.mentorTip }}"</p>
                    </div>

                    <div v-if="practiceMode !== 'none'" class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                      <button 
                        @click="handleNextQuest" 
                        class="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-3xl shadow-indigo-600/20 active:scale-95 flex items-center gap-4 group"
                      >
                        <span>다음 스테이지로</span>
                        <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        @click="activeTab = 'practice'; practiceSubTab = 'stages';" 
                        class="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-all active:scale-95 flex items-center gap-4"
                      >
                        <Layers class="w-5 h-5" />
                        <span>스테이지 목록으로</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Practice Tab -->
        <div v-else class="practice-tab flex-1 p-16 overflow-y-auto relative z-10 custom-scrollbar">
          <div class="max-w-5xl mx-auto space-y-20">
            <div class="text-center space-y-6">
              <div class="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                훈련 캠프 가동 중
              </div>
              <h2 class="text-6xl font-black text-white tracking-tighter">Logic Design Practice</h2>
              <p class="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">코드 한 줄을 적기 전, 당신의 설계를 비춰보세요. <br/>추상화 능력이 엔지니어의 몸집을 결정합니다.</p>
            </div>

            <!-- Category Selection -->
            <div v-if="practiceSubTab === 'categories'" class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div 
                v-for="practice in practices" 
                :key="practice.id" 
                @click="selectCategory(practice.id)"
                class="practice-card-premium bg-slate-900/40 border border-white/5 p-12 rounded-[3.5rem] hover:border-indigo-500/30 transition-all duration-700 cursor-pointer group flex flex-col justify-between h-[420px] relative overflow-hidden active:scale-[0.99] shadow-2xl"
              >
                <div class="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000">
                  <ArrowRight class="-rotate-45 w-40 h-40" />
                </div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-10">
                    <span :class="['px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20 shadow-sm', practice.badgeColor]">
                      {{ practice.badge }}
                    </span>
                    <div class="bg-slate-800 p-4 rounded-2xl text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-500">
                      <ArrowRight class="group-hover:translate-x-1 transition-transform w-6 h-6" />
                    </div>
                  </div>
                  <h3 class="text-3xl font-black text-white mb-3">{{ practice.title }}</h3>
                  <p class="text-indigo-400 font-bold text-sm tracking-tighter uppercase">{{ practice.subtitle }}</p>
                  <p class="text-slate-500 text-sm mt-8 leading-[1.7] line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {{ practice.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stage Selection Map -->
            <div v-else-if="practiceSubTab === 'stages'" class="space-y-12">
              <div class="flex items-center justify-between">
                <button @click="practiceSubTab = 'categories'" class="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                  <X class="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span class="text-sm font-bold uppercase tracking-widest">카테고리 목록으로</span>
                </button>
                <div class="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span class="text-xs font-black text-indigo-400 uppercase tracking-widest">{{ selectedCategory === 'forward' ? 'Puzzle Solve' : 'Logic Analysis' }} Stage Map</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  v-for="(quest, index) in filteredStages" 
                  :key="quest.id"
                  @click="startStage(quest)"
                  class="group relative bg-slate-900/60 border border-white/5 p-8 rounded-3xl hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden shadow-xl"
                >
                  <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span class="text-6xl font-black italic">{{ index + 1 }}</span>
                  </div>
                  <div class="relative z-10 space-y-4">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">{{ quest.emoji }}</span>
                      <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Stage {{ index + 1 }}</span>
                    </div>
                    <h3 class="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">{{ quest.title }}</h3>
                    <p class="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">{{ quest.description }}</p>
                    <div class="pt-4 flex items-center justify-between">
                      <span class="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{{ quest.logic_type }}</span>
                      <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                        <ArrowRight class="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-indigo-900/40 via-slate-950 to-slate-900/60 border border-indigo-500/20 rounded-[4rem] p-16 relative overflow-hidden group shadow-huge">
               <div class="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                <div class="flex-1 space-y-10 text-center lg:text-left">
                  <div class="space-y-5">
                    <div class="inline-block px-4 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Special Event</div>
                    <h3 class="text-4xl font-black text-white tracking-tighter">Daily Design Challenge</h3>
                    <p class="text-slate-400 text-xl leading-relaxed max-w-xl font-medium">
                      오픈소스 프로젝트의 고수준 비즈니스 고리를 <br/> <span class="text-indigo-400 font-black">Level 02 논리 명세</span>로 정제하고 보상을 획득하세요.
                    </p>
                  </div>
                  <div class="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                    <button @click="startChallenge" class="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black transition-all shadow-3xl shadow-indigo-600/40 active:scale-95 text-sm uppercase tracking-widest">도전 시작하기</button>
                    <button @click="activeTab = 'analyze'" class="px-12 py-5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-[1.5rem] font-black transition-all text-sm uppercase tracking-widest border border-white/5">가이드 열람</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Red Glitch Overlay (VFX) -->
    <div v-if="triggerGlitch" class="fixed inset-0 pointer-events-none z-[30000] bg-red-600/20 mix-blend-overlay animate-glitch overflow-hidden">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
    </div>

    <!-- Validation Feedback Modal -->
    <transition name="scale">
      <div v-if="showValidationModal" class="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
        <div class="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-huge animate-in fade-in zoom-in duration-300">
          <div :class="['h-2', validationResult === 'success' ? 'bg-emerald-500' : 'bg-red-500']"></div>
          <div class="p-10 text-center space-y-6">
            <div class="flex justify-center">
              <div :class="['w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl', 
                            validationResult === 'success' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20' : 'bg-red-500/10 text-red-500 shadow-red-500/20']">
                {{ validationResult === 'success' ? '✨' : '🐣' }}
              </div>
            </div>
            
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-white tracking-tight">
                {{ validationResult === 'success' ? '완벽한 설계입니다!' : '조금 더 고민해보꽥!' }}
              </h3>
              <p class="text-slate-400 text-sm font-medium leading-relaxed">
                {{ validationMessage }}
              </p>
            </div>

            <button 
              @click="closeValidationModal"
              :class="['w-full py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg', 
                       validationResult === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300']"
            >
              {{ validationResult === 'success' ? '분석 결과 확인하기' : '다시 조립하기' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Level Up Splash UI -->
    <transition name="splash">
      <div v-if="showLevelUpSplash" class="fixed inset-0 z-[40000] flex items-center justify-center bg-indigo-950/80 backdrop-blur-3xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent"></div>
        <div class="relative text-center space-y-12 animate-in zoom-in-50 duration-700">
          <div class="relative inline-block">
            <div class="absolute inset-0 bg-indigo-500 blur-[120px] opacity-50 animate-pulse"></div>
            <img src="/image/mentor/duck.png" alt="Level Up" class="w-56 h-56 relative z-10 animate-bounce" />
          </div>
          <div class="space-y-4">
             <p class="text-indigo-400 font-black text-xl tracking-[0.4em] uppercase">Class Upgrade</p>
             <h2 class="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">{{ currentClass }}</h2>
             <div class="h-1 w-64 bg-indigo-500 mx-auto rounded-full mt-6 shadow-[0_0_30px_rgba(99,102,241,0.8)]"></div>
          </div>
          <button @click="showLevelUpSplash = false" class="px-16 py-6 bg-white text-indigo-950 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-huge active:scale-95">NEXT STEP</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import mermaid from 'mermaid';
import { 
  BrainCircuit, Layers, BookOpen, LogOut, Terminal, Sparkles, Layout, Lightbulb, MessageSquare, ArrowRight, X, History, Send
} from 'lucide-vue-next';
import { aiQuests } from './data/stages.js';

/* 
  [수정일: 2026-01-26]
  [수정내용: 상/하 수직 분할 레이아웃으로 변경]
  - TOP: Puzzle Palette & Workspace (문제 풀이)
  - BOTTOM: AI Analysis Result (분석 결과)
  - Vertical split with borders and independent scrolling
*/

// --- 1. Constants ---
const LEVELS = [
  { id: 1, title: 'Level 1: 절차적 수도 코드', subtitle: 'Procedural Logic', desc: '구문 중심의 직역. 루프와 조건문을 명시하여 로직의 흐름을 따라갑니다.', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 2, title: 'Level 2: 논리적 명세', subtitle: 'Logical Specification', desc: '비즈니스 규칙 중심. 처리 목적(무엇을)에 집중합니다.', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  { id: 3, title: 'Level 3: 아키텍처 모델', subtitle: 'Architecture Diagram', desc: '시스템 관계 중심. Mermaid.js를 활용한 시각적 아키텍처 다이어그램입니다.', color: 'text-purple-400', bgColor: 'bg-purple-500/10' }
];

const MOCK_ANALYSIS_DB = {
  'quest_ai_01': {
    level1: "1. 입력 x와 가중치 w를 곱하여 가중 합산 시작\n2. 결과에 편향 b를 더함\n3. 최종 y를 반환",
    level2: "입력 데이터에 비중을 적용하고 모델의 오프셋(Bias)을 조절하여 뉴런의 활성화 값을 계산합니다.",
    level3: "graph TD\n  X[Input x] --> MUL[Multiply w]\n  W[Weight w] --> MUL\n  MUL --> ADD[Add Bias b]\n  B[Bias b] --> ADD\n  ADD --> Y[Output y]",
    complexity: 5,
    mentorTip: "첫 번째 인공 뉴런 구현을 축하합니다! y = wx + b는 딥러닝의 가장 기초적인 선형 결합 구조입니다."
  },
  'quest_ai_02': {
    level1: "1. 입력을 받아 0과 비교함\n2. 양수면 그대로 반환, 음수면 0으로 처리\n3. 결과값 출력",
    level2: "활성화 함수 ReLU를 통해 음수 신호를 차단하고 신경망에 비선형적 특성을 부여합니다.",
    level3: "graph TD\n  IN[Input x] --> IF{x > 0?}\n  IF -->|Yes| RET_X[Return x]\n  IF -->|No| RET_0[Return 0]",
    complexity: 8,
    mentorTip: "ReLU는 현대 딥러닝에서 가장 많이 쓰이는 활성화 함수입니다. 단순한 if문 하나가 AI의 성능을 결정하죠!"
  },
  'quest_ai_03': {
    level1: "1. 예측과 정답의 차이를 구함(diff)\n2. 차이를 스스로 곱함(Square)\n3. 최종 Loss 반환",
    level2: "평균 제곱 오차(MSE)의 핵심인 '차이의 제곱'을 통해 오차의 크기를 양수화하여 측정합니다.",
    level3: "graph TD\n  P[Predict] --> SUB[Difference]\n  T[Target] --> SUB\n  SUB --> SQ[Square diff*diff]\n  SQ --> L[Loss Value]",
    complexity: 6,
    mentorTip: "제곱을 하는 이유는 음수를 없애기 위해서이기도 하지만, 큰 오차에 더 큰 벌점을 주기 위해서이기도 합니다."
  },
  'quest_ai_04': {
    level1: "1. 기울기에 학습률을 곱해 이동량 계산\n2. 가중치에서 이동량을 빼서 갱신\n3. 업데이트된 값 저장",
    level2: "경사하강법(GD) 원리에 따라 오차가 줄어드는 방향으로 파라미터를 미세하게 조정합니다.",
    level3: "graph TD\n  G[Gradient] --> MUL[Multiply LR]\n  LR[Learning Rate] --> MUL\n  W[Weight] --> SUB[W - Step]\n  MUL --> SUB\n  SUB --> NEW[Updated W]",
    complexity: 10,
    mentorTip: "학습률(LR)은 AI의 보폭입니다. 너무 크면 길을 잃고, 너무 작으면 거북이처럼 느려지니 주의하세요!"
  }
};

// --- 2. Props & Emits ---
const props = defineProps({
  initialQuestIndex: { type: Number, default: 0 }
});
const emit = defineEmits(['close', 'quest-complete']);

// --- 3. Reactive State ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const activeQuestIndex = ref(0);
const currentQuest = computed(() => aiQuests[activeQuestIndex.value] || aiQuests[0]);
const hasNextQuest = computed(() => activeQuestIndex.value < aiQuests.length - 1);
const activeLevel = ref(1);
const generatedResults = ref(null);
const loading = ref(false);
const activeTab = ref('analyze');
const practiceSubTab = ref('categories'); // 'categories', 'stages'
const selectedCategory = ref('forward');
const practiceMode = ref('none');
const levels = ref(LEVELS);

// Chatbot State
const chatMessages = ref([
  { role: 'assistant', text: '안녕하세요! 설계 멘토 오리입니다. 현재 스테이지에 대해 궁금한 점이 있다면 무엇이든 물어보세요! 꽥!' }
]);
const chatInput = ref('');
const isChatLoading = ref(false);

// Validation State
const showValidationModal = ref(false);
const validationResult = ref(null); // 'success', 'error'
const validationMessage = ref('');

// Gamification State
const userStability = ref(3); // HP
const userXP = ref(0);
const comboStreak = ref(0);
const showLevelUpSplash = ref(false);
const triggerShake = ref(false);
const triggerGlitch = ref(false);

const mentorImage = computed(() => {
  return userStability.value <= 1 ? "/image/mentor/duck_sad.png" : "/image/mentor/duck.png";
});

const userLevel = computed(() => {
  return Math.floor(userXP.value / 1000) + 1;
});

const nextLevelXP = computed(() => {
  return userLevel.value * 1000;
});

const xpProgress = computed(() => {
  const currentLevelBaseXP = (userLevel.value - 1) * 1000;
  const relativeXP = userXP.value - currentLevelBaseXP;
  return (relativeXP / 1000) * 100;
});

const currentClass = computed(() => {
  if (userLevel.value >= 10) return "Master Architect";
  if (userLevel.value >= 7) return "Lead Architect";
  if (userLevel.value >= 5) return "Senior Engineer";
  if (userLevel.value >= 3) return "Junior Engineer";
  return "Engineering Intern";
});

// Chatbot State
const userPuzzleSolution = ref([]);
const shuffledPalette = ref([]);

// --- 4. Helper Functions ---
const initQuestBlocks = () => {
  if (!currentQuest.value || !currentQuest.value.cards) {
    shuffledPalette.value = [];
    userPuzzleSolution.value = [];
    return;
  }
  shuffledPalette.value = [...currentQuest.value.cards]
    .sort(() => Math.random() - 0.5)
    .map(card => ({ ...card }));
  userPuzzleSolution.value = [];
  generatedResults.value = null;
};

const getInjectedCode = () => {
  if (userPuzzleSolution.value.length === 0) return "";
  const functionName = currentQuest.value?.validation?.execution?.function_name || "process_logic";
  let code = `def ${functionName}():\n`;
  userPuzzleSolution.value.forEach(block => {
    const indentLevel = block.indent || 0;
    const line = "    " + "    ".repeat(indentLevel) + (block.text_py || "# code block");
    code += line + "\n";
  });
  return code;
};

// --- 5. Logic & Methods ---
const useCard = (index) => {
  const card = shuffledPalette.value.splice(index, 1)[0];
  userPuzzleSolution.value.push(card);
};

const unuseCard = (index) => {
  const card = userPuzzleSolution.value.splice(index, 1)[0];
  shuffledPalette.value.push(card);
};

const sourceCode = computed(() => getInjectedCode());

const renderMermaid = async () => {
  if (activeLevel.value === 3 && generatedResults.value?.level3) {
    await nextTick();
    const container = document.getElementById('mermaid-renderer');
    if (container) {
      try {
        container.removeAttribute('data-processed');
        container.innerHTML = generatedResults.value.level3;
        await mermaid.run({ nodes: [container] });
      } catch (e) {
        container.innerHTML = `<div class="text-red-400 p-4 text-[10px]">Diagram Error</div>`;
      }
    }
  }
};

const analyzeCode = async () => {
  const codeToAnalyze = sourceCode.value;
  if (!codeToAnalyze.trim() || !apiKey) return;
  
  // 1. Validation Step
  const userOrder = userPuzzleSolution.value.map(b => b.id);
  const correctOrder = currentQuest.value.correctSequence;
  const isCorrect = userOrder.length === correctOrder.length && userOrder.every((id, idx) => id === correctOrder[idx]);

  if (isCorrect) {
    validationResult.value = 'success';
    validationMessage.value = currentQuest.value.validation?.feedback?.success || "알고리즘 설계가 정확합니다! 멘토 오리의 심층 분석을 확인해보세요.";
    
    // Grant Reward
    const oldLevel = userLevel.value;
    const reward = currentQuest.value.rewardXP || 100;
    const bonus = Math.floor(comboStreak.value * 10);
    userXP.value += (reward + bonus);
    comboStreak.value++;
    
    // Level Up Check & Chat
    if (userLevel.value > oldLevel) {
      showLevelUpSplash.value = true;
      chatMessages.value.push({ role: 'assistant', text: `축하하꽥! 레벨업이다꽥! 이제 당신은 당당한 ${currentClass.value}가 되었다꽥! 🎉` });
    }
    
    showValidationModal.value = true;
    startAianalysis(codeToAnalyze);
  } else {
    validationResult.value = 'error';
    userStability.value = Math.max(0, userStability.value - 1);
    comboStreak.value = 0;

    // Trigger VFX
    triggerShake.value = true;
    triggerGlitch.value = true;
    setTimeout(() => { triggerShake.value = false; triggerGlitch.value = false; }, 500);
    
    if (userStability.value === 0) {
      validationMessage.value = "시스템 과부하 발생! 설계 안정성이 바닥났다꽥. 잠시 시스템을 재부팅(세션 종료)하고 다시 훈련에 임해보는건 어떻겠냐꽥? 🐥🚨";
      showValidationModal.value = true;
      return;
    }
    
    loading.value = true;
    try {
      // Analyze WRONG order using AI for personalized hint
      const wrongSteps = userPuzzleSolution.value.map(b => b.text_ko).join(' -> ');
      const hintPrompt = `퀘스트: ${currentQuest.value.title}. 의도: ${currentQuest.value.description}. 학습자가 조립한 오답 순서: [${wrongSteps}]. 
      왜 틀렸는지 분석하고, 정답을 바로 알려주지는 말고 하나만 고치도록 유도하는 짧고 친절한 힌트를 1문장으로 주세요. 말 끝에 '꽥'을 붙여주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: hintPrompt }] }], generation_config: { temperature: 0.5, max_output_tokens: 200 } })
      });
      const data = await response.json();
      validationMessage.value = data.candidates?.[0]?.content?.parts?.[0]?.text || currentQuest.value.validation?.feedback?.failure || "순서가 조금 틀린 것 같다꽥! 다시 한 번 생각해보꽥.";
    } catch (e) {
      validationMessage.value = currentQuest.value.validation?.feedback?.failure || "로직 흐름이 어색하다꽥! 순서를 다시 조정해보꽥.";
    } finally {
      loading.value = false;
      showValidationModal.value = true;
    }
    return;
  }
};

const startAianalysis = async (codeToAnalyze) => {
  loading.value = true;
  const systemPrompt = `당신은 주니어 개발자를 위한 설계 멘토입니다. [Logic Type: ${currentQuest.value.logic_type}]
  조립된 로직을 분석하여 다음 JSON 형식으로 응답하세요.
  { "level1": "절차적 설명", "level2": "논리적 명세", "level3": "mermaid graph TD 코드", "complexity": 10, "mentorTip": "한국어 조언" }`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `분석할 코드:\n${codeToAnalyze}` }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generation_config: { response_mime_type: "application/json", temperature: 0.2 }
      })
    });
    const data = await response.json();
    if (data.error) {
       console.error("Gemini API Error Detail:", data.error);
       // 할당량 초과(429)이거나 리소스 고갈 시 목 데이터로 자동 전환
       if ((data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') && MOCK_ANALYSIS_DB[currentQuest.value?.id]) {
         generatedResults.value = { ...MOCK_ANALYSIS_DB[currentQuest.value.id] };
         console.warn("API quota exceeded, falling back to mock data for:", currentQuest.value.id);
       } else { 
         alert(`API 오류 (${data.error.code}): ${data.error.message}`); 
       }
       loading.value = false; return;
    }
    
    let rawText = data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      generatedResults.value = JSON.parse(jsonMatch[0].trim());
    } else {
      throw new Error("Invalid JSON format from AI");
    }
  } catch (error) { 
    console.error("Analysis failed", error);
    alert("분석 결과 처리 중 오류가 발생했습니다. (잠시 후 다시 시도해주세요)"); 
  } finally { loading.value = false; }
};

const closeValidationModal = () => {
  showValidationModal.value = false;
};

const selectCategory = (id) => {
  selectedCategory.value = id;
  practiceSubTab.value = 'stages';
};

const startStage = (quest) => {
  const globalIndex = aiQuests.findIndex(q => q.id === quest.id);
  activeQuestIndex.value = globalIndex !== -1 ? globalIndex : 0;
  activeTab.value = 'analyze';
  practiceMode.value = selectedCategory.value;
  generatedResults.value = null;
  initQuestBlocks();
};

const startPractice = (type) => {
  selectedCategory.value = type;
  practiceSubTab.value = 'stages';
};

const startChallenge = () => {
  selectedCategory.value = 'reverse';
  practiceSubTab.value = 'stages';
};

const sendChatMessage = async () => {
  if (!chatInput.value.trim() || isChatLoading.value) return;

  const userText = chatInput.value;
  chatMessages.value.push({ role: 'user', text: userText });
  chatInput.value = '';
  isChatLoading.value = true;

  try {
    const contextStr = `현재 스테이지: ${currentQuest.value.title}. 로직 유형: ${currentQuest.value.logic_type}. 설명: ${currentQuest.value.description}. 힌트: ${currentQuest.value.validation?.execution?.implementation_hint?.main || ""}`;
    const systemPrompt = `당신은 주니어 개발자를 위한 설계 멘토 '오리'입니다. ${contextStr}. 사용자의 설계 질문에 친절하고 짧게 답해주세요. 말 끝마다 '꽥'을 붙여주세요.`;

    const contents = chatMessages.value.map(m => ({ 
      role: m.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: m.text }] 
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents, 
        system_instruction: { parts: [{ text: systemPrompt }] },
        generation_config: { temperature: 0.7, max_output_tokens: 300 } 
      })
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("Chat API Error:", data.error);
       // 할당량 초과 시 로컬 지능형 폴백
       if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
         let fallbackText = `미안하꽥! 지금 질문이 너무 많아서 잠시 쉬어야겠다꽥. 하지만 이 문제의 핵심은 [${currentQuest.value.logic_type}]이라꽥! ${currentQuest.value.validation?.execution?.implementation_hint?.main || "블록 순서를 잘 고민해보꽥!"} 화이팅하꽥!`;
         
         if (userText.includes('의도') || userText.includes('이유')) {
           fallbackText = `이 문제의 의도는 [${currentQuest.value.title}]을(를) 통해 시스템의 논리 구조를 이해하는 거다꽥! ${currentQuest.value.description} 이 부분을 집중해서 조립해보꽥!`;
         } else if (userText.includes('도움') || userText.includes('힌트') || userText.includes('모르')) {
           fallbackText = `힌트를 주겠다꽥! ${currentQuest.value.validation?.execution?.implementation_hint?.sub || "블록의 색상과 아이콘을 힌트로 삼아서 순차적으로 배치해보꽥."} 포기하지 마라꽥!`;
         }
         
         chatMessages.value.push({ role: 'assistant', text: fallbackText });
         return;
       }
       throw new Error(data.error.message);
    }

    const botText = data.candidates[0].content.parts[0].text;
    chatMessages.value.push({ role: 'assistant', text: botText });
  } catch (e) {
    console.error("Chat Error:", e);
    chatMessages.value.push({ role: 'assistant', text: "미안하꽥! 일시적인 통신 오류가 발생했다꽥. 다시 말해달라꽥!" });
  } finally {
    isChatLoading.value = false;
    nextTick(() => {
      const el = document.getElementById('chat-scroll');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
};

const handleNextQuest = () => {
  if (hasNextQuest.value) {
    activeQuestIndex.value++;
    activeLevel.value = 1;
    generatedResults.value = null;
    initQuestBlocks();
  } else {
    handleCompleteQuest();
  }
};

const handleCompleteQuest = () => {
  emit('quest-complete', activeQuestIndex.value);
  emit('close');
};

// --- 6. Lifecycle & Watches ---
onMounted(() => {
  initQuestBlocks();
  mermaid.initialize({
    startOnLoad: false, theme: 'dark', securityLevel: 'loose', fontFamily: 'JetBrains Mono',
    themeVariables: { primaryColor: '#6366f1', primaryTextColor: '#fff', primaryBorderColor: '#6366f1', lineColor: '#818cf8', secondaryColor: '#1e293b', tertiaryColor: '#0f172a' }
  });
});
watch([activeLevel, generatedResults], () => { renderMermaid(); }, { immediate: false });
watch(() => currentQuest.value, initQuestBlocks);

const practices = ref([
  { id: "forward", title: "Puzzle Solve", subtitle: "로직 퍼즐 훈련", description: "블록 조립을 통해 알고리즘 설계 능력을 키웁니다.", badge: "Puzzle", badgeColor: "bg-emerald-500/10 text-emerald-400" },
  { id: "reverse", title: "Logic Analysis", subtitle: "시스템 분석", description: "설계도를 추출하여 고수준 의도를 파악합니다.", badge: "Analysis", badgeColor: "bg-blue-500/10 text-blue-400" }
]);
</script>

<style scoped>
.logic-mirror-modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(32px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: fadeIn 0.4s ease-out; }
.logic-mirror-container { position: relative; width: 98%; max-width: 1800px; height: 94vh; background: #0f172a; border-radius: 3rem; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; overflow: hidden; box-shadow: 0 100px 200px -50px rgba(0, 0, 0, 0.9); font-family: 'Inter', system-ui, sans-serif; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-close-btn { position: absolute; top: 2rem; right: 2rem; width: 44px; height: 44px; background: rgba(255, 255, 255, 0.05); border-radius: 1rem; color: #64748b; display: flex; align-items: center; justify-content: center; z-index: 1000; transition: all 0.3s; }
.modal-close-btn:hover { background: #ef4444; color: white; transform: rotate(90deg); }

/* Puzzle Blocks */
.puzzle-block { position: relative; border-radius: 12px; box-shadow: 0 4px 0 rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.2); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); user-select: none; }
.puzzle-block.palette { max-height: 44px; margin-bottom: 8px; }
.puzzle-block.palette:hover { scale: 1.05; box-shadow: 0 8px 16px rgba(0,0,0,0.4); }
.puzzle-block.active { width: 100%; max-width: 600px; border-bottom: 4px solid rgba(0,0,0,0.3); }

.puzzle-block-handle { position: absolute; left: 24px; top: -8px; width: 32px; height: 16px; background: inherit; border-radius: 8px 8px 0 0; z-index: 2; border-top: 1px solid rgba(255,255,255,0.2); }
.puzzle-block-socket { position: absolute; left: 24px; bottom: -8px; width: 32px; height: 16px; background: #020617; border-radius: 0 0 8px 8px; z-index: 1; box-shadow: inset 0 4px 8px rgba(0,0,0,0.5); }

.puzzle-block.blue { background: linear-gradient(to bottom, #3b82f6, #1d4ed8); }
.puzzle-block.green { background: linear-gradient(to bottom, #059669, #047857); }
.puzzle-block.purple { background: linear-gradient(to bottom, #8b5cf6, #6d28d9); }
.puzzle-block.orange { background: linear-gradient(to bottom, #d97706, #b45309); }
.puzzle-block.red { background: linear-gradient(to bottom, #dc2626, #991b1b); }

.custom-scrollbar-premium {
  scrollbar-width: auto;
  scrollbar-color: #f472b6 #020617;
}
.custom-scrollbar-premium::-webkit-scrollbar { 
  width: 14px !important; 
  height: 14px !important; 
}
.custom-scrollbar-premium::-webkit-scrollbar-track { 
  background: #020617 !important; 
  border-radius: 10px;
}
.custom-scrollbar-premium::-webkit-scrollbar-thumb { 
  background: linear-gradient(180deg, #f472b6 0%, #db2777 100%) !important; 
  border-radius: 10px; 
  border: 3px solid #020617 !important;
}
.custom-scrollbar-premium::-webkit-scrollbar-thumb:hover { 
  background: #ec4899 !important; 
}

/* Animations */
.heart-beat { animation: heart-beat 0.3s ease-in-out; }
@keyframes heart-beat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-glitch { animation: glitch 0.2s linear infinite; }
@keyframes glitch {
  0% { opacity: 0.5; transform: scale(1) translate(0); }
  20% { opacity: 0.8; transform: scale(1.02) translate(-5px, 5px); }
  40% { opacity: 0.5; transform: scale(0.98) translate(5px, -5px); }
  60% { opacity: 0.8; transform: scale(1.01) translate(-5px, -5px); }
  80% { opacity: 0.5; transform: scale(0.99) translate(5px, 5px); }
  100% { opacity: 0.5; transform: scale(1) translate(0); }
}

.splash-enter-active, .splash-leave-active { transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.splash-enter-from, .splash-leave-to { opacity: 0; backdrop-filter: blur(0px); }
.splash-enter-from .animate-in { transform: scale(0.8); opacity: 0; }

.custom-scrollbar-thin::-webkit-scrollbar { width: 6px; }
.custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar-none::-webkit-scrollbar { display: none; }

@keyframes shimmer { 100% { transform: translateX(100%); } }
.animate-shimmer { animation: shimmer 2s infinite; }
</style>
```