/**
 * A/B Test Manager
 *
 * [생성일: 2026-02-09]
 * [목적: feedback.md의 "점진적 롤아웃" 피드백 반영]
 *
 * 새로운 평가 시스템을 A/B 테스트로 안전하게 배포
 * - 50% 사용자: 기존 시스템 (Control)
 * - 50% 사용자: 개선 시스템 (Treatment)
 * - 지표 수집 및 비교
 */

/**
 * A/B 테스트 그룹 결정
 *
 * @param {string} userId - 사용자 ID (없으면 랜덤)
 * @returns {string} 'control' | 'treatment'
 */
export function assignABGroup(userId = null) {
  // localStorage에 저장된 그룹 확인 (일관성 유지)
  const storedGroup = localStorage.getItem('ab_test_group');
  if (storedGroup) {
    return storedGroup;
  }

  // 새 그룹 할당
  let group;

  if (userId) {
    // userId 기반 결정적 할당 (해시 기반)
    const hash = simpleHash(userId);
    group = hash % 2 === 0 ? 'control' : 'treatment';
  } else {
    // 랜덤 할당
    group = Math.random() < 0.5 ? 'control' : 'treatment';
  }

  // 저장
  localStorage.setItem('ab_test_group', group);
  console.log(`🧪 [A/B 테스트] ${group} 그룹에 할당됨`);

  return group;
}

/**
 * 간단한 해시 함수
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 현재 그룹 조회
 */
export function getCurrentGroup() {
  return localStorage.getItem('ab_test_group') || assignABGroup();
}

/**
 * A/B 테스트 지표 기록
 *
 * @param {string} metricName - 지표 이름
 * @param {any} value - 지표 값
 * @param {Object} metadata - 추가 메타데이터
 */
export function recordABMetric(metricName, value, metadata = {}) {
  const group = getCurrentGroup();

  const metric = {
    group,
    metricName,
    value,
    metadata,
    timestamp: new Date().toISOString()
  };

  // localStorage에 저장 (실제로는 서버로 전송)
  const metricsKey = 'ab_test_metrics';
  const existing = JSON.parse(localStorage.getItem(metricsKey) || '[]');
  existing.push(metric);

  // 최대 100개까지만 저장 (메모리 절약)
  if (existing.length > 100) {
    existing.shift();
  }

  localStorage.setItem(metricsKey, JSON.stringify(existing));

  console.log(`📊 [지표 기록] ${metricName}: ${value} (${group})`);
}

/**
 * 수집된 지표 조회
 *
 * @returns {Array} 지표 배열
 */
export function getCollectedMetrics() {
  const metricsKey = 'ab_test_metrics';
  return JSON.parse(localStorage.getItem(metricsKey) || '[]');
}

/**
 * 그룹별 지표 비교
 *
 * @param {string} metricName - 비교할 지표
 * @returns {Object} { control: {...}, treatment: {...}, comparison: {...} }
 */
export function compareGroups(metricName) {
  const metrics = getCollectedMetrics();
  const filtered = metrics.filter(m => m.metricName === metricName);

  const control = filtered.filter(m => m.group === 'control');
  const treatment = filtered.filter(m => m.group === 'treatment');

  const controlAvg = control.length > 0
    ? control.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0) / control.length
    : 0;

  const treatmentAvg = treatment.length > 0
    ? treatment.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0) / treatment.length
    : 0;

  const improvement = controlAvg !== 0
    ? ((treatmentAvg - controlAvg) / controlAvg * 100).toFixed(1)
    : 0;

  return {
    metricName,
    control: {
      count: control.length,
      average: controlAvg.toFixed(2),
      values: control.map(m => m.value)
    },
    treatment: {
      count: treatment.length,
      average: treatmentAvg.toFixed(2),
      values: treatment.map(m => m.value)
    },
    comparison: {
      improvement: `${improvement}%`,
      winner: treatmentAvg > controlAvg ? 'treatment' : 'control',
      significant: Math.abs(improvement) > 10  // 10% 이상 차이면 유의미
    }
  };
}

/**
 * 평가 시스템 A/B 테스트 실행
 *
 * @param {Function} legacyEvaluator - 기존 평가 함수
 * @param {Function} newEvaluator - 새 평가 함수
 * @param {Object} evaluationInput - 평가 입력
 * @returns {Promise<Object>} 평가 결과
 */
export async function runEvaluationABTest(legacyEvaluator, newEvaluator, evaluationInput) {
  const group = getCurrentGroup();
  const startTime = performance.now();

  let result;

  if (group === 'control') {
    // 기존 시스템
    result = await legacyEvaluator(evaluationInput);
    result._abTestGroup = 'control';
  } else {
    // 개선 시스템
    result = await newEvaluator(evaluationInput);
    result._abTestGroup = 'treatment';
  }

  const duration = performance.now() - startTime;

  // 지표 기록
  recordABMetric('evaluation_score', result.score || result.totalScore, {
    group,
    duration,
    questionsCount: evaluationInput.deepDiveQnA?.length || 0
  });

  recordABMetric('evaluation_duration_ms', duration, {
    group
  });

  console.log(`🧪 [A/B 평가] ${group} 그룹, 점수: ${result.score}, 시간: ${duration.toFixed(0)}ms`);

  return result;
}

/**
 * 하이브리드 모드: 두 점수 모두 표시
 *
 * @param {Function} legacyEvaluator - 기존 평가 함수
 * @param {Function} newEvaluator - 새 평가 함수
 * @param {Object} evaluationInput - 평가 입력
 * @returns {Promise<Object>} { legacy, new, comparison }
 */
export async function runHybridEvaluation(legacyEvaluator, newEvaluator, evaluationInput) {
  console.log('🔀 [하이브리드] 두 시스템 모두 실행...');

  const [legacyResult, newResult] = await Promise.all([
    legacyEvaluator(evaluationInput).catch(err => ({ error: err.message, score: 0 })),
    newEvaluator(evaluationInput).catch(err => ({ error: err.message, score: 0 }))
  ]);

  const comparison = {
    scoreDifference: (newResult.score || 0) - (legacyResult.score || 0),
    percentageChange: legacyResult.score !== 0
      ? (((newResult.score || 0) - (legacyResult.score || 0)) / (legacyResult.score || 1) * 100).toFixed(1)
      : 'N/A'
  };

  return {
    legacy: {
      ...legacyResult,
      _label: '기존 시스템'
    },
    new: {
      ...newResult,
      _label: '개선 시스템'
    },
    comparison
  };
}

/**
 * A/B 테스트 리포트 생성
 *
 * @returns {Object} 전체 리포트
 */
export function generateABTestReport() {
  const metrics = getCollectedMetrics();

  const scoreComparison = compareGroups('evaluation_score');
  const durationComparison = compareGroups('evaluation_duration_ms');

  const controlCount = metrics.filter(m => m.group === 'control').length;
  const treatmentCount = metrics.filter(m => m.group === 'treatment').length;

  const report = {
    summary: {
      totalMetrics: metrics.length,
      controlSamples: controlCount,
      treatmentSamples: treatmentCount,
      balance: (Math.min(controlCount, treatmentCount) / Math.max(controlCount, treatmentCount) * 100).toFixed(1) + '%'
    },
    evaluationScore: scoreComparison,
    evaluationDuration: durationComparison,
    recommendation: generateRecommendation(scoreComparison, durationComparison),
    rawMetrics: metrics
  };

  console.log('📊 [A/B 리포트]', report);

  return report;
}

/**
 * 추천 생성
 */
function generateRecommendation(scoreComp, durationComp) {
  const scoreImprovement = parseFloat(scoreComp.comparison.improvement);
  const durationChange = parseFloat(durationComp.comparison.improvement);

  if (scoreImprovement > 10 && durationChange < 50) {
    return {
      decision: 'APPROVE',
      reasoning: `점수 ${scoreImprovement}% 향상, 성능 영향 미미 (${durationChange}%). 개선 시스템 배포 권장.`
    };
  } else if (scoreImprovement > 5 && durationChange < 100) {
    return {
      decision: 'CAUTIOUS_APPROVE',
      reasoning: `점수 ${scoreImprovement}% 향상, 성능 ${durationChange}% 저하. 모니터링하며 점진적 배포 권장.`
    };
  } else if (scoreImprovement < 0) {
    return {
      decision: 'REJECT',
      reasoning: `점수 ${Math.abs(scoreImprovement)}% 하락. 개선 시스템 재검토 필요.`
    };
  } else {
    return {
      decision: 'CONTINUE_TEST',
      reasoning: `유의미한 차이 없음 (${scoreImprovement}%). 더 많은 데이터 수집 필요.`
    };
  }
}

/**
 * 테스트 초기화 (디버깅/재시작용)
 */
export function resetABTest() {
  localStorage.removeItem('ab_test_group');
  localStorage.removeItem('ab_test_metrics');
  console.log('🔄 [A/B 테스트] 초기화됨');
}

/**
 * 사용 예시:
 *
 * import { runEvaluationABTest, generateABTestReport } from './abTestManager';
 *
 * // 평가 실행
 * const result = await runEvaluationABTest(
 *   legacyEvaluate,
 *   improvedEvaluate,
 *   evaluationInput
 * );
 *
 * // 리포트 생성
 * const report = generateABTestReport();
 * console.log(report.recommendation);
 */
