<template>
  <div class="history-container">
    <header class="history-header">
      <button class="back-btn" @click="$emit('close')">&times;</button>
      <div class="badge">MY RECORDS</div>
      <h1 class="title">Personal Training Logs</h1>
      <p class="subtitle">{{ authStore.user?.user_nickname }} 엔지니어님의 훈련 기록입니다.</p>
    </header>

    <div class="practice-selector">
      <button 
        v-for="unit in units" 
        :key="unit.id" 
        class="unit-chip"
        :class="{ active: selectedUnitId === unit.id }"
        @click="selectUnit(unit)"
      >
        UNIT {{ padNumber(unit.unit_number) }}
      </button>
    </div>

    <div class="content-area">
      <div v-if="loading" class="loading">Fetching logs...</div>
      <div v-else-if="answers.length === 0" class="no-data">
        <div class="empty-state">
          <span>📭</span>
          <p>해당 유닛의 완료 기록이 없습니다.<br>훈련을 시작해 보세요!</p>
        </div>
      </div>
      <div v-else class="log-timeline">
        <div v-for="ans in answers" :key="ans.detail_id" class="log-entry">
          <div class="log-marker" :class="{ perfect: ans.is_perfect }"></div>
          <div class="log-content">
            <div class="log-header">
              <span class="log-title">{{ ans.title }}</span>
              <span class="log-score">{{ ans.score }}pts</span>
            </div>
            <pre class="log-code">{{ formatAnswer(ans.submitted_data) }}</pre>
            <div class="log-date">{{ formatDate(ans.solved_date) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const units = ref([]);
const selectedUnitId = ref('');
const answers = ref([]);
const loading = ref(false);

const padNumber = (num) => {
  return String(num).padStart(2, '0');
};

const fetchUnits = async () => {
  try {
    const res = await axios.get('/api/core/practices/');
    units.value = res.data;
    if (units.value.length > 0) {
      selectUnit(units.value[0]);
    }
  } catch (err) {
    console.error('Failed to fetch units:', err);
  }
};

const selectUnit = async (unit) => {
  selectedUnitId.value = unit.id;
  loading.value = true;
  try {
    const res = await axios.get(`/api/core/management/user-answers/${unit.id}/`);
    answers.value = res.data.answers;
  } catch (err) {
    console.error('Failed to fetch user records:', err);
  } finally {
    loading.value = false;
  }
};

const formatAnswer = (data) => {
  if (!data) return 'N/A';
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

onMounted(fetchUnits);
</script>

<style scoped src="./MyHistoryView.css"></style>
