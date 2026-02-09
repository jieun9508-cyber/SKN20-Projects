/**
 * Interview Data Validator
 *
 * [생성일: 2026-02-09]
 * [목적: feedback.md의 "데이터 품질 검증" 피드백 반영]
 *
 * 31개 면접 데이터의 품질을 검증하고 필터링합니다.
 * - 데이터 편향 감지
 * - 품질 점수 계산
 * - 가중치 부여
 */

/**
 * 단일 면접 데이터의 품질 점수 계산
 *
 * @param {Object} interview - { title, url, summary, transcript, filename }
 * @returns {Object} { score, issues, metadata }
 */
export function calculateInterviewQuality(interview) {
  const issues = [];
  let score = 100;

  // 1. 데이터 완정성 검사
  if (!interview.title || interview.title.length < 5) {
    issues.push('제목이 너무 짧거나 없음');
    score -= 20;
  }

  if (!interview.summary || interview.summary.length < 100) {
    issues.push('Summary가 너무 짧음 (최소 100자)');
    score -= 30;
  }

  if (!interview.transcript || interview.transcript.length < 500) {
    issues.push('Transcript가 너무 짧음 (실제 대화가 아닐 가능성)');
    score -= 40;
  }

  // 2. 대화 품질 검사 (transcript 분석)
  if (interview.transcript) {
    const lines = interview.transcript.split('\n');
    const dialogueLines = lines.filter(line =>
      line.includes(':') && (line.toLowerCase().includes('interviewer') || line.toLowerCase().includes('candidate'))
    );

    if (dialogueLines.length < 10) {
      issues.push('대화 교환 횟수가 적음 (최소 10회)');
      score -= 20;
    }

    // 면접관/지원자 대화 비율 (너무 한쪽으로 치우치면 품질 낮음)
    const interviewerLines = dialogueLines.filter(line => line.toLowerCase().includes('interviewer'));
    const candidateLines = dialogueLines.filter(line => line.toLowerCase().includes('candidate'));
    const ratio = candidateLines.length / (interviewerLines.length || 1);

    if (ratio < 0.5 || ratio > 3) {
      issues.push('대화 비율 불균형 (면접관과 지원자 대화가 한쪽으로 치우침)');
      score -= 15;
    }
  }

  // 3. 피드백 품질 검사 (summary 분석)
  if (interview.summary) {
    const hasStrengths = /strong|good|excellent|well done|impressive/i.test(interview.summary);
    const hasWeaknesses = /weak|missing|forgot|should|improve|lack/i.test(interview.summary);
    const hasSpecifics = /\d+|specific|detail|example/i.test(interview.summary);

    if (!hasStrengths && !hasWeaknesses) {
      issues.push('피드백에 강점/약점 구분이 없음');
      score -= 20;
    }

    if (!hasSpecifics) {
      issues.push('피드백이 추상적 (구체적 예시/수치 없음)');
      score -= 10;
    }
  }

  // 4. URL 신뢰도 (interviewing.io 확인)
  const isInterviewingIO = interview.url?.includes('interviewing.io');
  if (!isInterviewingIO) {
    issues.push('출처가 interviewing.io가 아님 (신뢰도 의심)');
    score -= 25;
  }

  return {
    score: Math.max(0, score),
    issues,
    metadata: {
      titleLength: interview.title?.length || 0,
      summaryLength: interview.summary?.length || 0,
      transcriptLength: interview.transcript?.length || 0,
      estimatedDialogueCount: interview.transcript?.split('\n').filter(l =>
        l.includes(':')
      ).length || 0,
      hasURL: !!interview.url,
      source: isInterviewingIO ? 'interviewing.io' : 'unknown'
    }
  };
}

/**
 * 편향 감지: 특정 키워드가 과도하게 많이 나타나는지 검사
 *
 * @param {Array} interviews - 모든 면접 데이터
 * @returns {Object} 편향 리포트
 */
export function detectBias(interviews) {
  const keywordCounts = {};
  const totalInterviews = interviews.length;

  // 키워드 빈도 계산
  interviews.forEach(interview => {
    const text = `${interview.summary} ${interview.transcript}`.toLowerCase();

    // 주요 기술 키워드
    const keywords = [
      'cdn', 'cache', 'redis', 'database', 'sql', 'nosql',
      'load balancer', 'redundancy', 'failover', 'monitoring',
      'kubernetes', 'docker', 'microservice', 'api',
      'latency', 'throughput', 'scalability', 'availability'
    ];

    keywords.forEach(keyword => {
      const count = (text.match(new RegExp(keyword, 'gi')) || []).length;
      if (count > 0) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      }
    });
  });

  // 편향 계산 (80% 이상에서 나타나면 편향)
  const biasThreshold = totalInterviews * 0.8;
  const biasedKeywords = Object.entries(keywordCounts)
    .filter(([_, count]) => count >= biasThreshold)
    .map(([keyword, count]) => ({
      keyword,
      frequency: count,
      percentage: ((count / totalInterviews) * 100).toFixed(1)
    }));

  // 희소 키워드 (5% 미만에서만 나타남 → 대표성 부족)
  const rarityThreshold = totalInterviews * 0.05;
  const rareKeywords = Object.entries(keywordCounts)
    .filter(([_, count]) => count < rarityThreshold && count > 0)
    .map(([keyword, count]) => ({
      keyword,
      frequency: count,
      percentage: ((count / totalInterviews) * 100).toFixed(1)
    }));

  return {
    totalInterviews,
    biasedKeywords,  // 너무 자주 나타남
    rareKeywords,    // 너무 드물게 나타남
    balanced: biasedKeywords.length === 0 && rareKeywords.length < 5,
    warning: biasedKeywords.length > 3 ? 'HIGH_BIAS' : rareKeywords.length > 10 ? 'LOW_COVERAGE' : 'OK'
  };
}

/**
 * 가중치 계산: 품질이 높고 최근일수록 높은 가중치
 *
 * @param {Object} interview - 면접 데이터
 * @param {Object} qualityResult - calculateInterviewQuality 결과
 * @returns {number} 0.0 ~ 1.0 사이의 가중치
 */
export function calculateInterviewWeight(interview, qualityResult) {
  let weight = 1.0;

  // 1. 품질 점수 반영 (0-100 → 0.0-1.0)
  const qualityWeight = qualityResult.score / 100;
  weight *= qualityWeight;

  // 2. 대화 길이 반영 (긴 대화 = 더 많은 정보)
  const transcriptLength = qualityResult.metadata.transcriptLength;
  if (transcriptLength > 5000) {
    weight *= 1.2; // 20% 보너스
  } else if (transcriptLength < 1000) {
    weight *= 0.7; // 30% 페널티
  }

  // 3. 피드백 상세도 반영
  const summaryLength = qualityResult.metadata.summaryLength;
  if (summaryLength > 500) {
    weight *= 1.15; // 15% 보너스
  } else if (summaryLength < 150) {
    weight *= 0.8; // 20% 페널티
  }

  // 4. 대화 교환 횟수 반영 (활발한 질의응답)
  const dialogueCount = qualityResult.metadata.estimatedDialogueCount;
  if (dialogueCount > 30) {
    weight *= 1.1; // 10% 보너스
  } else if (dialogueCount < 10) {
    weight *= 0.75; // 25% 페널티
  }

  // 최종 가중치는 0.0 ~ 1.0 범위로 제한
  return Math.max(0.0, Math.min(1.0, weight));
}

/**
 * 전체 면접 데이터 검증 및 필터링
 *
 * @param {Array} interviews - 모든 면접 데이터
 * @param {Object} options - { minQualityScore: 50, includeWeights: true }
 * @returns {Object} 검증 결과
 */
export function validateInterviewDataset(interviews, options = {}) {
  const {
    minQualityScore = 50,  // 최소 품질 점수
    includeWeights = true   // 가중치 계산 여부
  } = options;

  console.log(`🔍 [데이터 검증] ${interviews.length}개 면접 데이터 검증 시작...`);

  // 1. 각 면접의 품질 평가
  const qualityResults = interviews.map(interview => {
    const quality = calculateInterviewQuality(interview);
    const weight = includeWeights ? calculateInterviewWeight(interview, quality) : 1.0;

    return {
      interview,
      quality,
      weight,
      passed: quality.score >= minQualityScore
    };
  });

  // 2. 통과/실패 분류
  const passed = qualityResults.filter(r => r.passed);
  const failed = qualityResults.filter(r => !r.passed);

  // 3. 편향 감지
  const biasReport = detectBias(interviews);

  // 4. 통계 계산
  const avgQuality = qualityResults.reduce((sum, r) => sum + r.quality.score, 0) / qualityResults.length;
  const avgWeight = includeWeights
    ? qualityResults.reduce((sum, r) => sum + r.weight, 0) / qualityResults.length
    : 1.0;

  const report = {
    total: interviews.length,
    passed: passed.length,
    failed: failed.length,
    passRate: ((passed.length / interviews.length) * 100).toFixed(1) + '%',
    avgQuality: avgQuality.toFixed(1),
    avgWeight: avgWeight.toFixed(2),
    minQualityScore,

    // 품질별 분포
    qualityDistribution: {
      excellent: qualityResults.filter(r => r.quality.score >= 80).length,
      good: qualityResults.filter(r => r.quality.score >= 60 && r.quality.score < 80).length,
      fair: qualityResults.filter(r => r.quality.score >= 40 && r.quality.score < 60).length,
      poor: qualityResults.filter(r => r.quality.score < 40).length
    },

    biasReport,

    // 실패 사유 분석
    commonIssues: failed
      .flatMap(r => r.quality.issues)
      .reduce((acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {}),

    // 검증 통과한 면접 데이터 (가중치 포함)
    validInterviews: passed.map(r => ({
      ...r.interview,
      _qualityScore: r.quality.score,
      _weight: r.weight,
      _metadata: r.quality.metadata
    })),

    // 실패한 면접 목록 (디버깅용)
    failedInterviews: failed.map(r => ({
      title: r.interview.title,
      score: r.quality.score,
      issues: r.quality.issues
    }))
  };

  // 경고 출력
  console.log(`✅ [검증 완료] ${passed.length}/${interviews.length} 통과 (${report.passRate})`);
  console.log(`📊 [품질 분포] Excellent: ${report.qualityDistribution.excellent}, Good: ${report.qualityDistribution.good}, Fair: ${report.qualityDistribution.fair}, Poor: ${report.qualityDistribution.poor}`);

  if (biasReport.warning !== 'OK') {
    console.warn(`⚠️ [편향 감지] ${biasReport.warning}`);
    if (biasReport.biasedKeywords.length > 0) {
      console.warn(`   - 과다 출현 키워드: ${biasReport.biasedKeywords.map(k => k.keyword).join(', ')}`);
    }
  }

  if (failed.length > interviews.length * 0.3) {
    console.warn(`⚠️ [데이터 품질 주의] ${failed.length}개(${((failed.length / interviews.length) * 100).toFixed(1)}%)가 최소 품질 기준 미달`);
  }

  return report;
}

/**
 * 사용 예시:
 *
 * import { validateInterviewDataset } from './interviewDataValidator';
 * import { loadAllInterviews } from './interviewInsightsLoader';
 *
 * const rawInterviews = loadAllInterviews();
 * const validation = validateInterviewDataset(rawInterviews, {
 *   minQualityScore: 60  // 60점 이상만 통과
 * });
 *
 * // 검증 통과한 데이터만 사용
 * const validInterviews = validation.validInterviews;
 */
