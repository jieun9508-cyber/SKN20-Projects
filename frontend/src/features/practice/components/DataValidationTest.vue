<template>
  <div class="data-validation-test">
    <div class="test-container">
      <h2>📊 Phase 0: 면접 데이터 품질 검증</h2>

      <div class="actions">
        <button @click="runValidation" :disabled="loading" class="btn-primary">
          {{ loading ? '검증 중...' : '🔍 데이터 검증 실행' }}
        </button>
        <button @click="clearResults" :disabled="!report" class="btn-secondary">
          🗑️ 결과 초기화
        </button>
      </div>

      <div v-if="error" class="error-message">
        ❌ 오류: {{ error }}
      </div>

      <div v-if="report" class="report">
        <h3>✅ 검증 리포트</h3>

        <div class="summary-cards">
          <div class="card">
            <div class="card-title">총 데이터</div>
            <div class="card-value">{{ report.total }}개</div>
          </div>
          <div class="card success">
            <div class="card-title">통과</div>
            <div class="card-value">{{ report.passed }}개</div>
          </div>
          <div class="card warning">
            <div class="card-title">실패</div>
            <div class="card-value">{{ report.failed }}개</div>
          </div>
          <div class="card info">
            <div class="card-title">통과율</div>
            <div class="card-value">{{ report.passRate }}</div>
          </div>
        </div>

        <div class="section">
          <h4>📊 품질 분포</h4>
          <div class="distribution">
            <div class="dist-item excellent">
              <span class="label">⭐ Excellent (80+)</span>
              <span class="value">{{ report.qualityDistribution.excellent }}개</span>
            </div>
            <div class="dist-item good">
              <span class="label">✅ Good (60-79)</span>
              <span class="value">{{ report.qualityDistribution.good }}개</span>
            </div>
            <div class="dist-item fair">
              <span class="label">⚠️ Fair (40-59)</span>
              <span class="value">{{ report.qualityDistribution.fair }}개</span>
            </div>
            <div class="dist-item poor">
              <span class="label">❌ Poor (0-39)</span>
              <span class="value">{{ report.qualityDistribution.poor }}개</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>📈 통계</h4>
          <div class="stats">
            <div>평균 품질 점수: <strong>{{ report.avgQuality }}점</strong></div>
            <div>평균 가중치: <strong>{{ report.avgWeight }}</strong></div>
            <div>최소 품질 기준: <strong>{{ report.minQualityScore }}점</strong></div>
          </div>
        </div>

        <div v-if="report.biasReport" class="section">
          <h4>⚠️ 편향 감지</h4>
          <div class="bias-status" :class="report.biasReport.warning.toLowerCase()">
            상태: <strong>{{ report.biasReport.warning }}</strong>
          </div>
          <div v-if="report.biasReport.biasedKeywords.length > 0" class="bias-keywords">
            <p>과다 출현 키워드 (80% 이상):</p>
            <ul>
              <li v-for="kw in report.biasReport.biasedKeywords" :key="kw.keyword">
                {{ kw.keyword }} - {{ kw.percentage }}% ({{ kw.frequency }}회)
              </li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h4>✅ 사용 가능 데이터 ({{ report.validInterviews.length }}개)</h4>
          <div class="interview-list">
            <div
              v-for="(interview, idx) in report.validInterviews.slice(0, 10)"
              :key="idx"
              class="interview-item"
            >
              <span class="rank">{{ idx + 1 }}</span>
              <span class="title">{{ interview.title }}</span>
              <span class="score">{{ interview._qualityScore }}점</span>
              <span class="weight">가중치: {{ interview._weight?.toFixed(2) }}</span>
            </div>
            <div v-if="report.validInterviews.length > 10" class="more">
              ... 외 {{ report.validInterviews.length - 10 }}개
            </div>
          </div>
        </div>

        <div v-if="report.failedInterviews.length > 0" class="section">
          <h4>❌ 제외될 데이터 ({{ report.failedInterviews.length }}개)</h4>
          <div class="failed-list">
            <div
              v-for="(interview, idx) in report.failedInterviews"
              :key="idx"
              class="failed-item"
            >
              <span class="title">{{ interview.title }}</span>
              <span class="score">{{ interview.score }}점</span>
              <div class="issues">
                <span v-for="(issue, i) in interview.issues" :key="i" class="issue">
                  • {{ issue }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>💡 결론</h4>
          <div class="conclusion">
            <p v-if="report.passed >= 20" class="success">
              ✅ <strong>{{ report.passed }}개</strong>의 품질 좋은 데이터를 확보했습니다!
              Phase 1 (질문 개선)을 진행할 수 있습니다.
            </p>
            <p v-else-if="report.passed >= 15" class="warning">
              ⚠️ <strong>{{ report.passed }}개</strong>의 데이터는 있지만, 20개 이상 권장됩니다.
              진행은 가능하나 품질이 다소 낮을 수 있습니다.
            </p>
            <p v-else class="error">
              ❌ <strong>{{ report.passed }}개</strong>는 너무 적습니다 (최소 15개 필요).
              데이터 수집이 필요하거나 품질 기준을 낮춰야 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadAllInterviews } from '../services/interviewInsightsLoader';

export default {
  name: 'DataValidationTest',
  data() {
    return {
      loading: false,
      report: null,
      error: null
    };
  },
  methods: {
    async runValidation() {
      this.loading = true;
      this.error = null;
      this.report = null;

      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 Phase 0: 데이터 검증 시작');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const result = loadAllInterviews({
          skipValidation: false,
          useLLMClassification: false,
          minQualityScore: 60,
          useCache: false  // 캐시 사용 안 함 (테스트용)
        });

        this.report = result.validation;

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ 검증 완료!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📊 결과:', result.validation);
      } catch (err) {
        console.error('❌ 검증 실패:', err);
        this.error = err.message || '알 수 없는 오류';
      } finally {
        this.loading = false;
      }
    },
    clearResults() {
      this.report = null;
      this.error = null;
      console.clear();
    }
  }
};
</script>

<style scoped>
.data-validation-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: #f44336;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #da190b;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
}

.report {
  margin-top: 30px;
}

.report h3 {
  color: #2c3e50;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.card {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.card.success {
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
}

.card.warning {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.card.info {
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.section {
  margin: 30px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.section h4 {
  margin-top: 0;
  color: #2c3e50;
}

.distribution, .stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dist-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.dist-item.excellent {
  border-left: 4px solid #4CAF50;
}

.dist-item.good {
  border-left: 4px solid #8BC34A;
}

.dist-item.fair {
  border-left: 4px solid #FF9800;
}

.dist-item.poor {
  border-left: 4px solid #F44336;
}

.bias-status {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.bias-status.ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.bias-status.high_bias,
.bias-status.low_coverage {
  background: #fff3e0;
  color: #e65100;
}

.bias-keywords {
  margin-top: 10px;
}

.bias-keywords ul {
  list-style: none;
  padding: 0;
}

.bias-keywords li {
  padding: 5px 0;
}

.interview-list, .failed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interview-item {
  display: grid;
  grid-template-columns: 40px 1fr 80px 120px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
}

.rank {
  font-weight: bold;
  color: #666;
}

.title {
  font-weight: 500;
}

.score {
  color: #4CAF50;
  font-weight: bold;
}

.weight {
  font-size: 12px;
  color: #666;
}

.more {
  padding: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.failed-item {
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #f44336;
}

.failed-item .title {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.failed-item .score {
  color: #f44336;
  font-weight: bold;
}

.issues {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.issue {
  font-size: 12px;
  color: #666;
}

.conclusion {
  padding: 15px;
  border-radius: 6px;
}

.conclusion.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.conclusion.warning {
  background: #fff3e0;
  color: #e65100;
}

.conclusion.error {
  background: #ffebee;
  color: #c62828;
}

.conclusion p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}
</style>
