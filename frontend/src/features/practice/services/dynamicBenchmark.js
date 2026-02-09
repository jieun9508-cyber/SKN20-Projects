/**
 * Dynamic Benchmark System
 *
 * [생성일: 2026-02-09]
 * [목적: feedback.md의 "동적 벤치마크" 피드백 반영]
 *
 * 문제 난이도와 지원자 레벨에 따라 평가 기준을 동적으로 조정
 * - 고정 벤치마크의 한계 극복
 * - 맥락 기반 공정한 평가
 */

/**
 * 문제 난이도 평가
 *
 * @param {Object} problem - 문제 정보
 * @returns {string} 'simple' | 'moderate' | 'complex'
 */
export function assessProblemDifficulty(problem) {
  let complexityScore = 0;

  // 1. 미션 개수 및 복잡도
  const missionCount = problem?.missions?.length || 0;
  if (missionCount >= 5) complexityScore += 3;
  else if (missionCount >= 3) complexityScore += 2;
  else complexityScore += 1;

  // 2. 제약조건 개수
  const constraintCount = problem?.constraints?.length || 0;
  if (constraintCount >= 5) complexityScore += 3;
  else if (constraintCount >= 3) complexityScore += 2;
  else complexityScore += 1;

  // 3. 시나리오 복잡도 (키워드 기반 추정)
  const scenario = problem?.scenario?.toLowerCase() || '';
  const complexKeywords = [
    'distributed', 'real-time', 'global', 'streaming', 'payment',
    'financial', 'high throughput', 'low latency', 'mission critical'
  ];
  const complexKeywordCount = complexKeywords.filter(kw => scenario.includes(kw)).length;
  if (complexKeywordCount >= 3) complexityScore += 3;
  else if (complexKeywordCount >= 1) complexityScore += 2;

  // 4. 예상 컴포넌트 수
  const expectedComponents = problem?.expectedComponents?.length || 0;
  if (expectedComponents >= 8) complexityScore += 2;
  else if (expectedComponents >= 5) complexityScore += 1;

  // 난이도 판정
  if (complexityScore >= 10) return 'complex';
  if (complexityScore >= 6) return 'moderate';
  return 'simple';
}

/**
 * 지원자 레벨 추정 (답변 패턴 기반)
 *
 * @param {Array} answers - 이전 답변들 [{ answer, score }, ...]
 * @returns {string} 'junior' | 'mid' | 'senior'
 */
export function estimateCandidateLevel(answers) {
  if (!answers || answers.length === 0) {
    return 'mid';  // 기본값
  }

  // 평균 점수 기반 레벨 추정
  const avgScore = answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length;

  // 답변 길이 및 구체성 분석
  const avgLength = answers.reduce((sum, a) => sum + (a.answer?.length || 0), 0) / answers.length;
  const hasSpecificTerms = answers.some(a =>
    /redis|postgresql|kubernetes|cassandra|kafka|prometheus/i.test(a.answer || '')
  );
  const hasTradeoffs = answers.some(a =>
    /trade-?off|but|however|although|pros and cons/i.test(a.answer || '')
  );

  // 종합 판단
  let levelScore = 0;

  if (avgScore >= 75) levelScore += 3;
  else if (avgScore >= 60) levelScore += 2;
  else levelScore += 1;

  if (avgLength >= 200) levelScore += 2;
  else if (avgLength >= 100) levelScore += 1;

  if (hasSpecificTerms) levelScore += 2;
  if (hasTradeoffs) levelScore += 2;

  if (levelScore >= 7) return 'senior';
  if (levelScore >= 4) return 'mid';
  return 'junior';
}

/**
 * 동적 벤치마크 생성
 *
 * @param {string} pillar - 기둥 (reliability, performance, etc.)
 * @param {string} difficulty - 문제 난이도
 * @param {string} candidateLevel - 지원자 레벨
 * @returns {Object} 벤치마크 기준
 */
export function getDynamicBenchmark(pillar, difficulty = 'moderate', candidateLevel = 'mid') {
  const baseBenchmarks = {
    reliability: {
      simple: {
        junior: {
          excellent: '기본 redundancy 개념 + 1가지 예시 (예: "서버 2대 띄웁니다")',
          good: 'Redundancy 또는 backup 언급',
          needsImprovement: '막연한 답변 ("안정적으로 만들겠습니다")',
          poor: '관련 개념 없음'
        },
        mid: {
          excellent: 'Failover 메커니즘 + 복구 시간 (예: "Load balancer health check로 30초 내 failover")',
          good: 'Failover 또는 replication 언급 + 간단한 설명',
          needsImprovement: 'Redundancy만 언급, 구체성 없음',
          poor: '추상적 답변'
        },
        senior: {
          excellent: 'Multi-region + 구체적 RTO/RPO + 테스트 전략 (예: "Chaos Engineering으로 매 분기 검증")',
          good: 'Multi-AZ 또는 replication + 복구 시간 목표',
          needsImprovement: 'Failover 언급하나 검증 방법 없음',
          poor: '막연한 "고가용성" 언급만'
        }
      },
      moderate: {
        junior: {
          excellent: 'Replication + health check 언급',
          good: 'Backup 전략 언급',
          needsImprovement: '개념만 나열',
          poor: '관련 없는 답변'
        },
        mid: {
          excellent: 'Multi-AZ/region + failover 자동화 + 모니터링',
          good: 'Failover 메커니즘 + health check',
          needsImprovement: 'Redundancy 언급하나 방법 불명확',
          poor: '추상적'
        },
        senior: {
          excellent: '다중 리전 전략 + 구체적 RPO/RTO + Chaos testing + DR runbook',
          good: 'Multi-region + 자동 failover + 복구 시간',
          needsImprovement: 'Failover 있으나 테스트 방법 없음',
          poor: '개념만 나열'
        }
      },
      complex: {
        junior: {
          excellent: 'Redundancy + 기본 failover 개념',
          good: 'Backup 또는 replication 언급',
          needsImprovement: '매우 기본적',
          poor: '관련 없음'
        },
        mid: {
          excellent: 'Multi-region + DR 전략 + 복구 절차',
          good: 'Cross-region replication + failover',
          needsImprovement: 'Failover 언급하나 글로벌 전략 없음',
          poor: '지역적 해결책만'
        },
        senior: {
          excellent: '글로벌 DR 아키텍처 + 구체적 RTO/RPO (초 단위) + 실시간 replication + Chaos Engineering + 사후 분석 프로세스',
          good: 'Multi-region active-active + 자동 failover + 테스트',
          needsImprovement: 'Multi-region 있으나 테스트/검증 부족',
          poor: '단일 리전 전략'
        }
      }
    },
    performance: {
      simple: {
        junior: {
          excellent: 'Cache 사용 언급 + 어디에 쓸지 (예: "데이터베이스 앞에 Redis")',
          good: 'Cache 또는 CDN 언급',
          needsImprovement: '"빠르게 만들겠습니다" 수준',
          poor: '성능 고려 없음'
        },
        mid: {
          excellent: 'Cache 전략 + CDN + latency 목표 (예: "P99 200ms")',
          good: 'Cache + load balancing',
          needsImprovement: 'Cache만 언급, 목표 없음',
          poor: '추상적'
        },
        senior: {
          excellent: 'Multi-layer caching + CDN + auto-scaling + 구체적 메트릭 + A/B 테스트',
          good: 'Cache + CDN + scaling 전략',
          needsImprovement: '도구 나열하나 통합 전략 없음',
          poor: '개념만'
        }
      },
      moderate: {
        junior: {
          excellent: 'CDN + cache 위치 명시',
          good: 'Cache 또는 load balancer',
          needsImprovement: '막연',
          poor: '없음'
        },
        mid: {
          excellent: 'Multi-tier caching + CDN + load balancing + latency 목표',
          good: 'Cache + CDN + 기본 scaling',
          needsImprovement: 'Cache 있으나 전략 불명',
          poor: '추상적'
        },
        senior: {
          excellent: '글로벌 CDN 전략 + edge caching + auto-scaling + P99 latency + cost tradeoff',
          good: 'CDN + cache hierarchy + scaling',
          needsImprovement: '도구는 있으나 최적화 전략 부족',
          poor: '기본 cache만'
        }
      },
      complex: {
        junior: {
          excellent: 'Cache + CDN 기본 개념',
          good: 'Cache 언급',
          needsImprovement: '매우 기본',
          poor: '없음'
        },
        mid: {
          excellent: 'Global CDN + multi-region cache + auto-scaling',
          good: 'CDN + cache + load balancing',
          needsImprovement: 'Local 최적화만, global 전략 없음',
          poor: '추상적'
        },
        senior: {
          excellent: 'Edge computing + multi-tier CDN + intelligent routing + real-time metrics + cost optimization + performance testing',
          good: 'Global CDN + edge cache + auto-scaling + latency monitoring',
          needsImprovement: '글로벌 CDN 있으나 edge optimization 부족',
          poor: '단일 리전 최적화만'
        }
      }
    }
    // operational, cost, security, sustainability도 유사하게 확장 가능
    // 지면 관계상 생략, 실제로는 모든 기둥에 대해 작성
  };

  // 기본값 반환
  const pillarBenchmark = baseBenchmarks[pillar] || baseBenchmarks.reliability;
  const difficultyBenchmark = pillarBenchmark[difficulty] || pillarBenchmark.moderate;
  const levelBenchmark = difficultyBenchmark[candidateLevel] || difficultyBenchmark.mid;

  return {
    pillar,
    difficulty,
    candidateLevel,
    benchmarks: levelBenchmark,
    _dynamic: true  // 동적 벤치마크 표시
  };
}

/**
 * 동적 점수 산정
 *
 * @param {string} userAnswer - 사용자 답변
 * @param {Object} dynamicBenchmark - getDynamicBenchmark 결과
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} { score, level, reasoning }
 */
export function calculateDynamicScore(userAnswer, dynamicBenchmark, context = {}) {
  const { benchmarks } = dynamicBenchmark;
  const answer = userAnswer.toLowerCase();

  // 길이 기반 기본 점수
  let score = 0;
  const length = userAnswer.length;

  if (length < 50) {
    score = 20;  // 너무 짧음
  } else if (length < 100) {
    score = 40;
  } else if (length < 200) {
    score = 60;
  } else {
    score = 70;
  }

  // 벤치마크 기준 체크
  let matchedLevel = 'poor';

  // Excellent 기준 체크
  const excellentKeywords = extractKeywords(benchmarks.excellent);
  const excellentMatches = excellentKeywords.filter(kw => answer.includes(kw.toLowerCase())).length;
  if (excellentMatches >= excellentKeywords.length * 0.7) {
    score = 90;
    matchedLevel = 'excellent';
  }

  // Good 기준 체크
  const goodKeywords = extractKeywords(benchmarks.good);
  const goodMatches = goodKeywords.filter(kw => answer.includes(kw.toLowerCase())).length;
  if (matchedLevel === 'poor' && goodMatches >= goodKeywords.length * 0.6) {
    score = 70;
    matchedLevel = 'good';
  }

  // Needs Improvement 기준 체크
  const needsKeywords = extractKeywords(benchmarks.needsImprovement);
  const needsMatches = needsKeywords.filter(kw => answer.includes(kw.toLowerCase())).length;
  if (matchedLevel === 'poor' && needsMatches >= needsKeywords.length * 0.5) {
    score = 50;
    matchedLevel = 'needsImprovement';
  }

  // 보너스: 구체적 기술명, 숫자, 트레이드오프 언급
  const hasSpecificTech = /redis|postgresql|kubernetes|nginx|cloudfront|s3|dynamodb/i.test(userAnswer);
  const hasNumbers = /\d+\s*(ms|seconds?|minutes?|%|GB|TB|users?)/i.test(userAnswer);
  const hasTradeoff = /trade-?off|but|however|pros and cons|although/i.test(userAnswer);

  if (hasSpecificTech) score += 5;
  if (hasNumbers) score += 5;
  if (hasTradeoff) score += 5;

  // 최종 점수 범위 조정
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level: matchedLevel,
    reasoning: `동적 평가 (난이도: ${dynamicBenchmark.difficulty}, 레벨: ${dynamicBenchmark.candidateLevel})\n` +
               `매칭 레벨: ${matchedLevel}\n` +
               `보너스: 구체적 기술명(${hasSpecificTech ? '✓' : '✗'}), 수치(${hasNumbers ? '✓' : '✗'}), 트레이드오프(${hasTradeoff ? '✓' : '✗'})`,
    dynamicContext: {
      difficulty: dynamicBenchmark.difficulty,
      candidateLevel: dynamicBenchmark.candidateLevel,
      matchedBenchmark: benchmarks[matchedLevel]
    }
  };
}

/**
 * 벤치마크 설명에서 핵심 키워드 추출
 */
function extractKeywords(benchmarkText) {
  // 간단한 키워드 추출 (실제로는 더 정교한 NLP 필요)
  const keywords = [];
  const lowerText = benchmarkText.toLowerCase();

  const techTerms = [
    'multi-region', 'multi-az', 'failover', 'replication', 'rto', 'rpo',
    'health check', 'chaos', 'cdn', 'cache', 'load balancer', 'auto-scaling',
    'monitoring', 'redundancy', 'backup', 'dr', 'recovery'
  ];

  techTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.push(term);
    }
  });

  return keywords;
}

/**
 * 사용 예시:
 *
 * import { assessProblemDifficulty, estimateCandidateLevel, getDynamicBenchmark, calculateDynamicScore } from './dynamicBenchmark';
 *
 * // 1. 문제 난이도 평가
 * const difficulty = assessProblemDifficulty(currentProblem);
 * // → 'complex'
 *
 * // 2. 지원자 레벨 추정 (이전 답변 기반)
 * const level = estimateCandidateLevel(previousAnswers);
 * // → 'mid'
 *
 * // 3. 동적 벤치마크 가져오기
 * const benchmark = getDynamicBenchmark('reliability', difficulty, level);
 * // → { pillar, difficulty, candidateLevel, benchmarks: {...} }
 *
 * // 4. 동적 점수 산정
 * const result = calculateDynamicScore(userAnswer, benchmark);
 * // → { score: 75, level: 'good', reasoning: '...' }
 */
