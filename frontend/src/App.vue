<!-- 
수정일: 2026-01-20
수정내용: 'Coding Gym' 테마 적용 및 인덱스 페이지(index copy.html) 디자인 포팅
-->
<template>
  <div id="app" v-cloak>
    <!-- [라우터 뷰 - Practice 페이지 (메인 레이아웃 없이 단독 표시)] -->
    <router-view v-if="isPracticePage"></router-view>

    <!-- [메인 페이지] -->
    <template v-else>
      <LandingView 
        :isLoggedIn="auth.isLoggedIn"
        :userProteinShakes="auth.userProteinShakes"
        :chapters="game.chapters"
        :leaderboard="leaderboard"
        @go-to-playground="handleGoToPlayground"
        @open-unit="openUnitPopup"
      >
        <template #auth-buttons>
          <template v-if="!auth.isLoggedIn">
            <button class="btn-login-ref" @click="ui.openLogin">Login</button>
            <button class="btn-signup-ref" @click="ui.openSignUp">Sign Up</button>
          </template>
          <div v-else class="user-profile-v2">
            <div class="user-info-v2">
              <span class="user-name-v2">{{ auth.sessionNickname }}</span>
              <span class="user-rank-v2">ENGINEER</span>
            </div>
            <button class="btn-logout-v2" @click="auth.logout">Logout</button>
          </div>
        </template>
      </LandingView>

      <!-- [유닛 상세 팝업 모달] - [2026-01-24] 상태값만 스토어 연결 및 유지 -->
      <transition name="fade">
        <div v-if="ui.isUnitModalOpen" class="modal-overlay" @click.self="ui.isUnitModalOpen = false">
          <div class="unit-detail-modal">
            <header class="unit-modal-header-v3">
              <div class="title-section-v3">
                <div class="unit-label-v3">
                  {{ game.activeUnit?.name === 'Debug Practice' ? 'DEBUG GYM' : 'UNIT ' + (game.chapters.indexOf(game.activeUnit) + 1) }}
                </div>
                <h2 class="unit-name-v3">
                  <template v-if="game.activeUnit?.name === 'Debug Practice'">
                    {{ game.currentDebugMode === 'bug-hunt' ? '🐞 Bug Hunt' : '✨ Vibe Code Clean Up' }}
                  </template>
                  <template v-else>
                    {{ game.activeUnit?.unitTitle || game.activeUnit?.problems?.[0]?.title || game.activeUnit?.name }}
                  </template>
                </h2>
              </div>
              <div style="display: flex; align-items: center;">
                <!-- [2026-01-24] 버튼은 모든 유닛에서 노출, 클릭 로직에서 유닛별 분기 처리 -->
                <button class="guidebook-btn-v3" @click="handleGuidebookClick">
                  <span class="btn-icon-wrapper"><i data-lucide="book-open"></i></span>
                  GUIDEBOOK
                </button>
                <button class="close-btn-v3" @click="ui.isUnitModalOpen = false">&times;</button>
              </div>
            </header>

            <div class="unit-modal-body-v3">
              <div class="path-container-v3">
                <svg class="path-svg-v3" viewBox="0 0 800 1500">
                  <path class="path-line-v3" d="M400,100 L560,250 L280,400 L520,550 L360,700 L400,850 L480,1000 L320,1150 L560,1300 L400,1450" fill="none" stroke="rgba(148, 163, 184, 0.2)" stroke-width="3" stroke-dasharray="10,5" />
                </svg>

                <div v-for="(problem, pIdx) in displayProblems" :key="problem.id" class="node-platform-v3"
                  :class="['node-' + pIdx, { active: pIdx === currentMaxIdx, unlocked: currentUnitProgress.includes(pIdx) }]"
                  @click="isUnlocked(pIdx) && (selectProblem(problem, game.activeUnit), ui.isUnitModalOpen = false)">
                  <div class="platform-glow-v3" v-if="pIdx === currentMaxIdx"></div>
                  <div class="platform-circle-v3">
                    <template v-if="currentUnitProgress.includes(pIdx)">
                      <img v-if="pIdx === currentMaxIdx" src="/image/unit_duck.png" class="duck-on-node-v3">
                      <div style="width: 20px; height: 20px; background: #b6ff40; border-radius: 50%; box-shadow: 0 0 10px #b6ff40;"></div>
                    </template>
                    <template v-else>
                      <i data-lucide="lock" class="lock-icon-v3"></i>
                    </template>
                  </div>
                  <div class="node-label-premium">{{ problem.displayNum || problem.title }} - {{ problem.title }}</div>
                </div>
              </div>
            </div>

            <footer class="unit-stats-bar-v3">
              <template v-if="game.activeUnit?.name === 'Debug Practice'">
                <button class="game-mode-btn bug-hunt" :class="{ 'active': game.currentDebugMode === 'bug-hunt' }" @click="selectGameMode('bug-hunt')">🐞 Bug Hunt</button>
                <button class="game-mode-btn vibe-cleanup" :class="{ 'active': game.currentDebugMode === 'vibe-cleanup' }" @click="selectGameMode('vibe-cleanup')">✨ Vibe Code Clean Up</button>
              </template>
              <template v-else>
                <div class="stat-pill-v3 active"><i data-lucide="check-circle" style="width: 16px;"></i>{{ currentUnitProgress.length }}개 활성화</div>
                <div class="stat-pill-v3 locked"><i data-lucide="lock" style="width: 16px;"></i>{{ displayProblems.length - currentUnitProgress.length }}개 잠금</div>
              </template>
            </footer>
          </div>
        </div>
      </transition>
    </template>

    <!-- [전역 모달 통합 컨테이너] - [2026-01-24] 리팩토링 적용 -->
    <GlobalModals />
  </div>
</template>

<script setup>
import { computed, onMounted, onUpdated, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import { useUiStore } from '@/stores/ui';

import './style.css';
import LandingView from './features/home/LandingView.vue';
import GlobalModals from './components/GlobalModals.vue';

/**
 * [수정일: 2026-01-24]
 * [수정내용: App.vue를 초경량화하고 비즈니스 로직을 Pinia Store로 이전. 
 *  팀 협업 시 App.vue 충돌을 최소화하도록 설계.]
 */

// Pinia 인증 스토어: 사용자 로그인 상태 및 로그아웃 기능 관리
const auth = useAuthStore();
// Pinia 게임 데이터 스토어: 챕터 정보 및 유닛별 진행도 기록 관리
const game = useGameStore();
// Pinia UI 상태 스토어: 로그인, 유닛 상세 등 모든 전역 모달의 열림 상태 관리
const ui = useUiStore();
// 현재 활성화된 라우트 정보를 참조하기 위한 객체
const route = useRoute();
// 다른 페이지로의 내비게이션 이동을 제어하기 위한 객체
const router = useRouter();

// 실시간 사용자 랭킹을 표시하기 위한 목업(더미) 데이터
const leaderboard = [
    { id: 1, username: 'TopEngineer', solved: 45, shakes: 2450 },
    { id: 2, username: 'DjangoMaster', solved: 42, shakes: 2100 },
    { id: 3, username: 'VueNinja', solved: 38, shakes: 1850 },
    { id: 4, username: 'AgentZero', solved: 35, shakes: 1600 },
    { id: 5, username: 'OpsWizard', solved: 30, shakes: 1400 }
];

// Computed
// 현재 보고 있는 화면이 실습(Practice) 도구 페이지인지 판단 (배경 레이아웃 제어용)
const isPracticePage = computed(() => {
    // [2026-01-24] LogicMirror는 모달로 띄우기 위해 practiceRoutes에서 제외 (배경 유지 목적)
    const practiceRoutes = ['LogicMirrorTest', 'SystemArchitecturePractice', 'BugHunt', 'VibeCodeCleanUp', 'OpsPractice'];
    return practiceRoutes.includes(route.name);
});

// 현재 활성화된 유닛의 실습 진행 상태 데이터
const currentUnitProgress = computed(() => game.currentUnitProgress);
// 유닛 내에서 현재까지 도달한 가장 높은 스테이지 인덱스 (캐릭터 위치 표시용)
const currentMaxIdx = computed(() => Math.max(...currentUnitProgress.value));

// 유닛 상세 팝업에서 실제로 렌더링할 문제 목록 데이터
const displayProblems = computed(() => {
    if (game.activeUnit?.name === 'Debug Practice') {
        const title = game.currentDebugMode === 'bug-hunt' ? 'Bug Hunt' : 'Vibe Code Clean Up';
        return [{ id: game.currentDebugMode, title }];
    }
    return game.activeUnit?.problems || [];
});

// UI 배치를 맞추기 위해 추가로 필요한 잠긴 노드(더미)의 개수 계산
const displayLabelsCount = computed(() => Math.max(0, 6 - (displayProblems.value?.length || 0)));

// Methods
// 특정 챕터(유닛)의 상세 정보 및 스테이지 선택 팝업을 여는 기능
const openUnitPopup = (unit) => {
    if (!auth.isLoggedIn) {
        ui.isAuthRequiredModalOpen = true;
        return;
    }
    game.setActiveUnit(unit);
    if (unit?.name === 'Debug Practice') game.currentDebugMode = 'bug-hunt';
    ui.openUnit();
};

// 특정 문제를 선택했을 때 해당 실습 화면으로 진입하거나 해당 모달을 활성화하는 기능
const selectProblem = (problem, chapter) => {
    if (!auth.isLoggedIn) { ui.isAuthRequiredModalOpen = true; return; }
    game.activeProblem = problem;
    game.activeChapter = chapter;

    if (chapter?.name === 'Pseudo Practice') {
        game.selectedQuestIndex = problem.questIndex || 0;
        // [2026-01-24] 직접 불리언을 바꾸지 않고 라우터를 통해 모달 진입
        router.push('/practice/logic-mirror');
    } else if (chapter?.name === 'System Practice') {
        router.push('/practice/system-architecture');
    } else if (chapter?.name === 'Debug Practice') {
        router.push(game.currentDebugMode === 'bug-hunt' ? '/practice/bug-hunt' : '/practice/vibe-cleanup');
    } else if (chapter?.name === 'Ops Practice') {
        router.push('/practice/ops-practice');
    } else if (chapter?.name === 'Agent Practice') {
        ui.isAgentModalOpen = true;
    } else {
        ui.isConstructionModalOpen = true;
    }
};

// 디버그 GYM 등에서 서로 다른 게임 모드(Bug Hunt vs Cleanup)를 전환하는 기능
const selectGameMode = (mode) => {
    game.currentDebugMode = mode;
    if (game.activeUnit?.name === 'Debug Practice') {
        const isDebugRoute = ['BugHunt', 'VibeCodeCleanUp'].includes(route.name);
        if (isDebugRoute) {
            router.push(mode === 'bug-hunt' ? '/practice/bug-hunt' : '/practice/vibe-cleanup');
        }
    }
};

// 유닛 상세 화면 내의 GUIDEBOOK 버튼 클릭 시 유닛별 가이드 또는 안내 모달을 처리하는 기능
const handleGuidebookClick = () => {
    // [2026-01-24] Unit 1(Pseudo Practice)일 때만 가이드북 오픈, 나머지는 준비중 모달 노출
    if (game.activeUnit?.name === 'Pseudo Practice') {
        ui.isGuidebookOpen = true;
    } else {
        ui.isConstructionModalOpen = true;
    }
};

// 스테이지 인덱스를 받아 해당 스테이지가 사용 가능한 상태인지 확인하는 기능
const isUnlocked = (pIdx) => currentUnitProgress.value.includes(pIdx);

// 랜딩 페이지 하단의 챕터 영역(플레이그라운드)으로 부드럽게 스크롤 이동하는 기능
const handleGoToPlayground = () => {
    if (auth.isLoggedIn) {
        document.getElementById('chapters')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        ui.isAuthRequiredModalOpen = true;
    }
};

// Lifecycle
onMounted(() => {
    auth.checkSession();
    game.initGame();
    refreshLucide();
});

// [2026-01-24] 라우트 설정을 감시하여 Unit 1 모달 강제 제어 (필요 시 URL 직접 접근 대응)
// 이 영역은 향후 Unit 2, Unit 3 등을 '라우트 기반 모달'로 전환할 때 확장 포인트가 됩니다.
import { watch } from 'vue';
watch(() => route.name, (newName) => {
    // 1. URL이 변경될 때마다 모달 상태를 동기화합니다.
    if (newName === 'LogicMirror') {
        ui.isLogicMirrorOpen = true; // /practice/logic-mirror 접속 시 모달 활성화
    } else if (!isPracticePage.value) {
        // 2. 다른 일반 페이지(Landing 등)로 이동 시 모든 실습 모달을 명시적으로 닫습니다.
        // 향후 다른 유닛 모달이 추가되면 이곳에서 ui.isOtherUnitOpen = false 형태로 초기화 로직을 보강하십시오.
        ui.isLogicMirrorOpen = false;
    }
}, { immediate: true });

onUpdated(() => refreshLucide());

// Vue 인스턴스의 DOM 업데이트 이후 Lucide 아이콘 라이브러리를 다시 초기화하는 기능
const refreshLucide = () => {
    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
    });
};
</script>

<style scoped>
/* 게임 모드 선택 버튼 스타일 */
.game-mode-btn {
  flex: 1;
  padding: 18px 30px;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  font-size: 1.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.game-mode-btn.bug-hunt {
  background: linear-gradient(135deg, #ff00ff, #ff4db8);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 0, 255, 0.3);
}

.game-mode-btn.bug-hunt:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 0, 255, 0.5);
}

.game-mode-btn.vibe-cleanup {
  background: linear-gradient(135deg, #ffff00, #ffd700);
  color: #1a1f2e;
  box-shadow: 0 4px 15px rgba(255, 255, 0, 0.3);
}

.game-mode-btn.vibe-cleanup:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 255, 0, 0.5);
}

/* Auth Buttons for LandingView Slot */
.btn-login-ref, .btn-signup-ref {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-login-ref {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-signup-ref {
  background: #6366f1;
  color: #fff;
  margin-left: 0.5rem;
}

.btn-login-ref:hover, .btn-signup-ref:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.user-profile-v2 {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info-v2 {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name-v2 {
  font-weight: 800;
  color: #fff;
  font-size: 0.9rem;
}

.user-rank-v2 {
  font-size: 0.7rem;
  color: #b6ff40;
  font-weight: 900;
}

.btn-logout-v2 {
  background: rgba(255, 75, 75, 0.1);
  color: #ff4b4b;
  border: 1px solid rgba(255, 75, 75, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
