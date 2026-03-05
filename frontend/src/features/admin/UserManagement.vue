<template>
  <div class="user-management-container bg-slate-50 min-h-screen font-sans p-4 md:p-8 selection:bg-indigo-100 selection:text-indigo-900 leading-relaxed">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Premium Header Section -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 relative overflow-hidden">
        <div class="relative z-10 flex items-center gap-4 md:gap-5">
          <!-- Back Button -->
          <button 
            @click="$router.push('/')" 
            class="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 active:scale-95 transition-all duration-200 shadow-sm" 
            title="메인 화면으로 돌아가기"
          >
            <chevron-left class="w-5 h-5 -ml-0.5" />
          </button>
          
          <div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              유저 관리 대시보드
              <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full tracking-wide">Admin Only</span>
            </h1>
            <p class="text-slate-500 font-medium mt-1.5 text-sm md:text-base">시스템 내 모든 유저의 권한 및 계정 상태를 통제할 수 있습니다.</p>
          </div>
        </div>
        
        <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative z-10">
          <div class="relative w-full sm:w-72 md:w-80 group">
            <input 
              v-model="searchQuery" 
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="이메일 또는 닉네임으로 검색..." 
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm md:text-base outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
            />
            <search class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
            <!-- Clear button -->
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''; handleSearch()" 
              class="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <x-circle class="w-5 h-5" />
            </button>
          </div>
          <button 
            @click="handleSearch" 
            class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300 shadow-md shadow-slate-200 active:scale-95 whitespace-nowrap"
          >
            검색
          </button>
        </div>
      </header>

      <!-- Main Content Card -->
      <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-16 text-slate-400">
          <div class="relative">
            <refresh-cw class="w-12 h-12 animate-spin text-indigo-500" />
            <div class="absolute inset-0 w-12 h-12 border-4 border-indigo-100 rounded-full mix-blend-multiply"></div>
          </div>
          <p class="mt-6 text-lg font-semibold text-slate-600 animate-pulse">데이터를 안전하게 불러오는 중입니다...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="users.length === 0" class="flex-1 flex flex-col items-center justify-center p-20 text-slate-500">
          <div class="w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
            <ghost class="w-10 h-10 text-slate-300" />
          </div>
          <h3 class="text-xl font-bold text-slate-700 mb-2">검색 결과가 없습니다</h3>
          <p class="text-slate-500 text-center max-w-sm">검색어와 일치하는 유저 데이터를 찾을 수 없습니다.<br>검색어를 다시 한 번 확인해주세요.</p>
          <button @click="searchQuery = ''; handleSearch()" class="mt-6 text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 flex items-center gap-1">
            <refresh-ccw class="w-4 h-4" /> 목록 초기화
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="flex-1 overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th class="px-6 py-5 rounded-tl-3xl"><div class="flex items-center gap-2"><fingerprint class="w-4 h-4" /> 아이디 (이메일)</div></th>
                <th class="px-6 py-5"><div class="flex items-center gap-2"><user class="w-4 h-4" /> 닉네임</div></th>
                <th class="px-6 py-5"><div class="flex items-center gap-2"><calendar class="w-4 h-4" /> 가입일자</div></th>
                <th class="px-6 py-5 text-center w-32">활동 상태</th>
                <th class="px-6 py-5 text-center w-36">권한 레벨</th>
                <th class="px-6 py-5 text-center w-24 rounded-tr-3xl">위험 관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100/80">
              <tr 
                v-for="user in users" 
                :key="user.id" 
                class="hover:bg-indigo-50/40 transition-colors duration-200 group relative"
              >
                <td class="px-6 py-4 relative">
                  <!-- Highlight line on hover -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="flex items-center gap-3">
                    <div v-if="user.avatar_url && !user.avatarError" class="w-9 h-9 rounded-full border border-slate-200 shadow-sm overflow-hidden shrink-0 bg-slate-100 relative group-hover:ring-2 ring-indigo-200 transition-all">
                      <img 
                        :src="user.avatar_url" 
                        :alt="user.nickname || user.username" 
                        class="w-full h-full object-cover" 
                        loading="lazy"
                        @error="user.avatarError = true"
                      />
                    </div>
                    <!-- Default Duck Fallback for broken links or no avatar -->
                    <div v-else class="w-9 h-9 rounded-full border border-slate-200 shadow-sm overflow-hidden shrink-0 bg-[#FFF5D1] flex items-center justify-center relative group-hover:ring-2 ring-amber-200 transition-all" title="Default Duck">
                      <img src="/image/duck_idle.png" alt="Default Duck Avatar" class="w-6 h-6 object-contain opacity-80" />
                    </div>
                    
                    <span class="truncate max-w-[250px] font-semibold text-slate-700" :title="user.email || user.username">
                      {{ user.email || user.username }}
                    </span>
                  </div>
                </td>
                
                <td class="px-6 py-4">
                  <span class="text-slate-600 font-medium bg-slate-100/80 px-2.5 py-1 rounded-md text-sm border border-slate-200/50 inline-flex max-w-[250px] truncate" :title="user.nickname">
                    {{ user.nickname || '익명 유저' }}
                  </span>
                </td>
                
                <td class="px-6 py-4">
                  <span class="text-slate-500 text-sm flex items-center gap-1.5 font-medium">
                    <clock class="w-3.5 h-3.5 text-slate-400" />
                    {{ formatDate(user.date_joined) }}
                  </span>
                </td>
                
                <!-- Status Toggle -->
                <td class="px-6 py-4 text-center">
                  <button 
                    @click="toggleActive(user)" 
                    class="relative inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 w-[72px] shadow-sm transform hover:scale-105 active:scale-95"
                    :class="user.is_active 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' 
                      : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'"
                    :title="user.is_active ? '클릭 시 계정을 휴면(정지) 상태로 변경합니다.' : '클릭 시 계정을 다시 활성화합니다.'"
                  >
                    <!-- Dot indicator -->
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
                    {{ user.is_active ? '활성' : '휴면' }}
                  </button>
                </td>
                
                <!-- Role Toggle -->
                <td class="px-6 py-4 text-center">
                  <button 
                    @click="toggleStaff(user)" 
                    class="relative inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 shadow-sm w-[88px] transform hover:scale-105 active:scale-95"
                    :class="user.is_staff 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-slate-50 border-slate-200 hover:text-slate-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'"
                    :title="user.is_staff ? '관리자 권한을 회수하여 일반 유저로 강등합니다.' : '모든 접근 권한을 가진 관리자(Staff)로 승격합니다.'"
                  >
                    <shield-check v-if="user.is_staff" class="w-3.5 h-3.5 mr-1" />
                    <shield v-else class="w-3.5 h-3.5 mr-1 opacity-60" />
                    {{ user.is_staff ? 'Admin' : 'User' }}
                  </button>
                </td>
                
                <!-- Danger Action -->
                <td class="px-6 py-4 text-center relative">
                  <button 
                    @click="confirmDelete(user)" 
                    class="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:rotate-12 hover:shadow-sm"
                    title="유저 영구 삭제"
                  >
                    <trash-2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Premium Pagination Footer -->
        <div v-if="totalPages > 0" class="bg-gray-50/80 px-6 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            전체 사용자 데이터: <span class="font-bold text-slate-800 ml-1.5">{{ totalRecords }}</span>명
          </div>
          
          <div class="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1"
              :class="currentPage === 1 ? 'text-slate-300 cursor-not-allowed bg-transparent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'"
            >
              <chevron-left class="w-4 h-4" />
              이전
            </button>
            
            <div class="px-4 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-inner flex items-center justify-center min-w-[3rem]">
              {{ currentPage }} <span class="text-slate-400 font-normal mx-1">/</span> {{ totalPages }}
            </div>
            
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1"
              :class="currentPage === totalPages ? 'text-slate-300 cursor-not-allowed bg-transparent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'"
            >
              다음
              <chevron-right class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Smooth Alert Modal for Deletion -->
    <!-- Transition classes added manually for Vue -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="!isDeleting && (showDeleteModal = false)"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative z-10 overflow-hidden border border-slate-100">
          <!-- Top decorative red gradient -->
          <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-red-600"></div>
          
          <div class="flex flex-col items-center text-center space-y-5">
            <div class="w-16 h-16 bg-rose-50 border-4 border-white shadow-md rounded-full flex items-center justify-center text-rose-500 mb-2 relative">
              <div class="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
              <alert-triangle class="w-8 h-8 relative z-10" />
            </div>
            
            <h3 class="text-2xl font-extrabold text-slate-800 tracking-tight">유저 영구 삭제 경고</h3>
            
            <p class="text-slate-500 leading-relaxed text-sm bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
              <strong class="text-slate-800 font-bold block mb-1 text-base">{{ userToDelete?.email || userToDelete?.username }}</strong>
              해당 계정을 정말 삭제하시겠습니까?<br/>
              연관된 모든 데이터(진행도, 로그, 대화 내역 등)가 <br/>
              <span class="text-rose-600 font-bold underline decoration-rose-300 underline-offset-4">영구적으로 소멸</span>되며 <b>절대 복구할 수 없습니다.</b>
            </p>
          </div>
          
          <div class="flex gap-3 justify-center mt-8 w-full">
            <button 
              @click="showDeleteModal = false" 
              class="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-all duration-200"
              :disabled="isDeleting"
            >
              돌아가기
            </button>
            <button 
              @click="deleteUser" 
              class="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 border-2 border-rose-500 hover:bg-rose-600 hover:border-rose-600 active:bg-rose-700 active:scale-[0.98] shadow-md shadow-rose-200 transition-all duration-200 flex items-center justify-center gap-2"
              :disabled="isDeleting"
            >
              <refresh-cw v-if="isDeleting" class="w-5 h-5 animate-spin" />
              <trash-2 v-else class="w-5 h-5" />
              <span>진행 확인</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
  RefreshCcw,
  XCircle,
  Clock,
  Fingerprint,
  User,
  Calendar,
  Ghost,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const users = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeSearch = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageSize = 20

const showDeleteModal = ref(false)
const userToDelete = ref(null)
const isDeleting = ref(false)

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await axios.get('/api/core/admin/users/', {
      params: {
        page: currentPage.value,
        query: activeSearch.value
      }
    })
    
    users.value = res.data.results || []
    totalRecords.value = res.data.count || 0
    totalPages.value = Math.ceil(totalRecords.value / pageSize) || 1
  } catch (err) {
    if (err.response?.status === 403) {
      alert("관리자 권한이 없습니다.")
    } else {
      alert(`목록 조회 실패: ${err.response?.data?.error || err.message}`)
    }
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  activeSearch.value = searchQuery.value
  currentPage.value = 1
  fetchUsers()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

const toggleActive = async (user) => {
  const originalState = user.is_active;
  
  // 낙관적 UI 업데이트
  user.is_active = !originalState;
  
  try {
    const res = await axios.patch(`/api/core/admin/users/${user.username}/`, {
      action: 'toggle_active'
    })
    // 서버 응답으로 확정
    user.is_active = res.data.is_active
  } catch (err) {
    // 실패 시 롤백
    user.is_active = originalState;
    alert(err.response?.data?.error || "상태 변경 통신 중 오류가 발생했습니다.")
  }
}

const toggleStaff = async (user) => {
  const originalState = user.is_staff;
  
  // 낙관적 UI 업데이트
  user.is_staff = !originalState;
  
  try {
    const res = await axios.patch(`/api/core/admin/users/${user.username}/`, {
      action: 'toggle_staff'
    })
    user.is_staff = res.data.is_staff
  } catch (err) {
    user.is_staff = originalState;
    alert(err.response?.data?.error || "권한 변경 통신 중 오류가 발생했습니다.")
  }
}

const confirmDelete = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  isDeleting.value = true
  
  try {
    await axios.delete(`/api/core/admin/users/${userToDelete.value.username}/`)
    showDeleteModal.value = false
    userToDelete.value = null
    // 현재 페이지가 비게 되면 이전 페이지로
    if (users.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    fetchUsers()
  } catch (err) {
    alert(err.response?.data?.error || "삭제에 실패하였습니다.")
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Scoped styles are not strictly needed as Tailwind controls everything, 
 * but added here explicitly for Vue CSS isolation patterns 
 */

/* Ensure empty backgrounds are styled correctly */
</style>
