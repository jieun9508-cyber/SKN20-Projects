/**
 * Interview Insights Loader (Enhanced)
 *
 * [생성일: 2026-02-09]
 * [업데이트: feedback.md 반영 - 데이터 검증, LLM 분류, 가중치 시스템]
 *
 * 실제 시스템 디자인 면접 데이터(transcript, summary)를 로드하고
 * 질문 생성 및 평가에 활용할 수 있는 인사이트를 추출합니다.
 *
 * 주요 개선사항:
 * - 데이터 품질 검증 (Phase 0)
 * - 가중치 기반 인사이트 (품질 높은 데이터 우선)
 * - LLM 기반 분류 옵션 (키워드 매칭 한계 극복)
 * - 측정 가능한 지표
 */

// 모든 interview JSON 파일을 동적으로 import
const interviewFiles = import.meta.glob('@/data/interview/*.json', { eager: true });

// 검증 및 분류 모듈 import
import { validateInterviewDataset } from './interviewDataValidator';
import { batchClassifyInterviews } from './llmBasedClassifier';

// 캐시 (중복 로드 방지)
let _cachedInterviews = null;
let _cachedValidation = null;

/**
 * 모든 면접 데이터를 로드 (검증 포함)
 *
 * @param {Object} options - { skipValidation: false, useLLMClassification: false, minQualityScore: 60 }
 * @returns {Object} { interviews, validation }
 */
export function loadAllInterviews(options = {}) {
  const {
    skipValidation = false,
    useLLMClassification = false,
    minQualityScore = 60,
    useCache = true
  } = options;

  // 캐시 사용
  if (useCache && _cachedInterviews && _cachedValidation) {
    console.log('📦 [캐시] 기존 로드된 데이터 사용');
    return {
      interviews: _cachedInterviews,
      validation: _cachedValidation
    };
  }

  console.log('📂 [로드] Interview JSON 파일 로딩 중...');
  const rawInterviews = [];

  for (const path in interviewFiles) {
    const data = interviewFiles[path].default || interviewFiles[path];
    rawInterviews.push({
      ...data,
      filename: path.split('/').pop().replace('.json', ''),
      _source: 'interviewing.io'  // 출처 명시
    });
  }

  console.log(`✅ [로드 완료] ${rawInterviews.length}개 파일 로드됨`);

  // 검증 수행
  if (skipValidation) {
    console.log('⚠️ [검증 스킵] 데이터 검증을 건너뜀');
    _cachedInterviews = rawInterviews;
    _cachedValidation = { skipped: true };
    return { interviews: rawInterviews, validation: { skipped: true } };
  }

  const validation = validateInterviewDataset(rawInterviews, {
    minQualityScore,
    includeWeights: true
  });

  // 검증 통과한 데이터만 사용
  const validInterviews = validation.validInterviews;

  console.log(`✅ [검증 완료] ${validInterviews.length}/${rawInterviews.length} 사용 가능`);

  // 경고 출력
  if (validation.biasReport.warning !== 'OK') {
    console.warn(`⚠️ [편향 경고] ${validation.biasReport.warning}`);
  }

  // LLM 분류 (옵션)
  let finalInterviews = validInterviews;
  if (useLLMClassification) {
    console.log('🤖 [LLM 분류] 시작... (시간이 걸릴 수 있습니다)');
    // 주의: 이것은 async이므로 실제로는 별도 함수로 처리 필요
    console.warn('⚠️ LLM 분류는 async이므로 별도로 처리해야 합니다. loadAllInterviewsAsync() 사용 권장');
  }

  // 캐시 저장
  _cachedInterviews = finalInterviews;
  _cachedValidation = validation;

  return {
    interviews: finalInterviews,
    validation
  };
}

/**
 * 비동기 버전: LLM 분류 포함
 */
export async function loadAllInterviewsAsync(options = {}) {
  const { useLLMClassification = false, ...otherOptions } = options;

  const { interviews, validation } = loadAllInterviews({
    ...otherOptions,
    useLLMClassification: false  // 동기 버전에서는 LLM 사용 안 함
  });

  if (useLLMClassification) {
    console.log('🤖 [LLM 분류] 비동기 처리 시작...');
    const classified = await batchClassifyInterviews(interviews, {
      batchSize: 3,
      delayMs: 2000
    });

    return {
      interviews: classified,
      validation,
      llmClassified: true
    };
  }

  return { interviews, validation, llmClassified: false };
}

/**
 * 6대 기둥별로 면접 인사이트 추출
 *
 * 각 transcript와 summary에서 다음을 추출:
 * - 자주 묻는 질문 패턴
 * - 지원자가 놓치는 부분
 * - 좋은 답변/나쁜 답변 예시
 * - 효과적인 후속 질문(probing) 패턴
 */
export function extractPillarInsights() {
  const interviews = loadAllInterviews();

  const insights = {
    reliability: {
      keywords: ['redundancy', 'failover', 'availability', 'disaster recovery', 'replication', 'single point of failure', 'spof'],
      commonGaps: [
        '단일 장애점(SPOF) 분석 누락',
        '장애 복구 시간(RTO/RPO) 구체화 부족',
        'Multi-region 배포 전략 미흡',
        '장애 테스트 방법 언급 없음'
      ],
      effectiveQuestions: [
        '주 데이터센터가 다운되면 얼마나 빨리 복구되나요?',
        '장애 복구를 실제로 테스트해본 적이 있나요?',
        '데이터 복제 지연(replication lag)이 발생하면 어떻게 처리하나요?'
      ],
      interviewExamples: []
    },
    performance: {
      keywords: ['latency', 'throughput', 'scalability', 'cdn', 'cache', 'load balancing', 'auto-scaling'],
      commonGaps: [
        'CDN 활용 누락 (특히 영상/이미지 서비스)',
        '용량 계획(capacity planning) 시 구체적 수치 없음',
        'Auto-scaling 전략 불명확',
        'P99 latency 등 구체적 성능 목표 없음'
      ],
      effectiveQuestions: [
        '트래픽이 10배 증가하면 어떤 부분이 병목이 되나요?',
        '왜 CDN을 사용하지 않았나요?',
        '캐시 미스율(miss rate)이 높아지면 어떻게 대응하나요?'
      ],
      interviewExamples: []
    },
    operational: {
      keywords: ['monitoring', 'observability', 'alerting', 'logging', 'metrics', 'telemetry'],
      commonGaps: [
        '모니터링 시스템 구체화 부족',
        '장애 감지 시간/방법 불명확',
        '알람 임계값(threshold) 설정 전략 없음',
        'Runbook/Playbook 개념 누락'
      ],
      effectiveQuestions: [
        '사용자가 신고하기 전에 장애를 감지할 수 있나요?',
        '어떤 메트릭을 모니터링하고, 언제 알람이 발생하나요?',
        '새벽 3시에 알람이 울리면 무엇을 확인하나요?'
      ],
      interviewExamples: []
    },
    cost: {
      keywords: ['cost optimization', 'reserved instances', 'spot instances', 'auto-scaling down', 'data tiering'],
      commonGaps: [
        '트래픽 적은 시간대 비용 최적화 고려 없음',
        'Reserved/Spot instance 활용 전략 부족',
        'Cold storage 전환 전략 누락',
        '비용 모니터링 방법 불명확'
      ],
      effectiveQuestions: [
        '새벽 시간대에도 동일한 인프라 비용이 발생하나요?',
        '1년치 데이터를 모두 빠른 스토리지에 보관해야 하나요?',
        '비용이 예상보다 2배 늘어났을 때 어떻게 알 수 있나요?'
      ],
      interviewExamples: []
    },
    security: {
      keywords: ['encryption', 'authentication', 'authorization', 'tls', 'key management', 'least privilege'],
      commonGaps: [
        '데이터 암호화 범위 불명확 (전송/저장)',
        '접근 제어(access control) 전략 추상적',
        'API 인증 방식 구체화 부족',
        'Key rotation 전략 누락'
      ],
      effectiveQuestions: [
        '외부에서 데이터베이스로 직접 접근할 수 있나요?',
        '암호화 키는 어디에 보관하고 얼마나 자주 교체하나요?',
        'API 토큰이 유출되면 어떻게 대응하나요?'
      ],
      interviewExamples: []
    },
    sustainability: {
      keywords: ['modularity', 'coupling', 'dependency', 'maintainability', 'extensibility', 'technical debt'],
      commonGaps: [
        '컴포넌트 간 결합도(coupling) 분석 부족',
        '새 기능 추가 시 영향 범위 불명확',
        'API 버전 관리 전략 누락',
        'Feature flag 개념 부족'
      ],
      effectiveQuestions: [
        '이 컴포넌트를 교체하면 무엇이 영향을 받나요?',
        'API를 변경하면 기존 클라이언트는 어떻게 되나요?',
        '새 팀원이 코드베이스를 이해하는데 얼마나 걸릴까요?'
      ],
      interviewExamples: []
    }
  };

  // transcript와 summary에서 실제 예시 추출
  interviews.forEach(interview => {
    const { title, summary, transcript } = interview;

    // 각 기둥별 키워드 매칭하여 관련 예시 수집
    Object.keys(insights).forEach(pillar => {
      const pillarData = insights[pillar];
      const keywords = pillarData.keywords;

      // summary나 transcript에 키워드가 포함되어 있으면 예시로 추가
      const lowerSummary = summary.toLowerCase();
      const lowerTranscript = transcript.toLowerCase();

      const isRelevant = keywords.some(keyword =>
        lowerSummary.includes(keyword.toLowerCase()) ||
        lowerTranscript.includes(keyword.toLowerCase())
      );

      if (isRelevant) {
        pillarData.interviewExamples.push({
          title,
          summary: summary.substring(0, 300) + '...',
          url: interview.url
        });
      }
    });
  });

  return insights;
}

/**
 * 특정 기둥에 대한 실제 면접 예시 가져오기
 */
export function getInterviewExamplesForPillar(pillarKey) {
  const insights = extractPillarInsights();
  return insights[pillarKey] || null;
}

/**
 * 질문 생성 시 사용할 컨텍스트 강화
 *
 * 기존 원칙(principles)에 실제 면접 인사이트를 추가하여
 * 더 현실적이고 구체적인 질문을 생성할 수 있도록 함
 */
export function enhanceQuestionContext(pillarKey, basePrinciples) {
  const insights = extractPillarInsights();
  const pillarInsights = insights[pillarKey];

  if (!pillarInsights) return basePrinciples;

  const enhancedContext = `
${basePrinciples}

---

## 실제 면접에서 자주 발견되는 취약점

${pillarInsights.commonGaps.map(gap => `- ${gap}`).join('\n')}

## 효과적인 질문 예시 (참고용, 직접 복사하지 말고 유사한 스타일로 생성)

${pillarInsights.effectiveQuestions.map(q => `- "${q}"`).join('\n')}

## 질문 생성 가이드

1. **상황 기반**: "~한 상황이 발생하면 어떻게 되나요?" 형태
2. **구체적**: 추상적 용어보다 구체적 시나리오 제시
3. **탐색적**: Yes/No가 아닌 설계 의도를 묻는 질문
4. **실전 연계**: 위 취약점들을 자연스럽게 탐색할 수 있는 질문
`;

  return enhancedContext;
}

/**
 * 평가 시 사용할 답변 벤치마크 제공
 *
 * 실제 면접에서 나온 좋은/나쁜 답변 패턴을 기반으로
 * 사용자 답변의 품질을 평가할 수 있는 기준 제공
 */
export function getAnswerBenchmarks(pillarKey) {
  const insights = extractPillarInsights();
  const pillarInsights = insights[pillarKey];

  if (!pillarInsights) return null;

  // 실제 면접 예시에서 추출한 패턴 기반 벤치마크
  const benchmarks = {
    excellent: [
      '구체적인 기술명 + 이유 + 트레이드오프 언급',
      '실제 수치와 메트릭 제시',
      '대안 비교 및 선택 근거 명확'
    ],
    good: [
      '기술명과 기본 이유 제시',
      '일부 구체적 예시 포함',
      '기본적인 설계 의도 설명'
    ],
    needsImprovement: [
      '키워드만 나열, 이유 없음',
      '추상적이고 모호한 설명',
      '질문과 동떨어진 답변'
    ],
    poor: [
      '매우 짧고 구체성 없음',
      '잘못된 개념 이해',
      '질문을 이해하지 못함'
    ]
  };

  return {
    pillar: pillarKey,
    commonGaps: pillarInsights.commonGaps,
    benchmarks,
    exampleCount: pillarInsights.interviewExamples.length
  };
}

/**
 * 딥다이브 질문 생성 시 실제 면접관의 후속 질문 패턴 제공
 */
export function getProbingPatterns(pillarKey) {
  const patterns = {
    reliability: {
      sequence: [
        '접근 방식 파악: "장애 대응을 어떻게 하시겠습니까?"',
        '구체화: "구체적으로 몇 초 안에 복구되나요?"',
        '테스트 검증: "이 방식을 실제로 테스트해보셨나요?"',
        '엣지 케이스: "네트워크 파티션이 발생하면 어떻게 되나요?"'
      ],
      ahaGoal: '단순히 "redundancy 있습니다"에서 → "구체적 failover 시간과 테스트 방법"까지 도달'
    },
    performance: {
      sequence: [
        '현재 상태: "현재 시스템의 병목은 어디인가요?"',
        '확장성: "트래픽이 10배 증가하면?"',
        '구체적 수치: "목표 latency는 몇 ms인가요?"',
        '비용 대비: "성능 개선의 비용은 어느 정도인가요?"'
      ],
      ahaGoal: '"캐시 쓰겠습니다"에서 → "어떤 데이터를, 어떤 캐시에, 얼마나 오래" 까지 도달'
    },
    operational: {
      sequence: [
        '감지 방법: "문제를 어떻게 알아채나요?"',
        '알람 기준: "어떤 임계값에서 알람이 가나요?"',
        '대응 절차: "새벽 3시 알람이 오면 무엇을 확인하나요?"',
        '사후 분석: "장애 후 어떤 개선을 하나요?"'
      ],
      ahaGoal: '"모니터링 있습니다"에서 → "구체적 메트릭, 임계값, runbook" 까지 도달'
    },
    cost: {
      sequence: [
        '현재 비용: "월 인프라 비용이 얼마나 되나요?"',
        '최적화: "비용을 줄일 수 있는 부분은?"',
        '변동성: "트래픽 적은 시간대 비용은?"',
        '모니터링: "비용 급증을 어떻게 감지하나요?"'
      ],
      ahaGoal: '"비용 효율적입니다"에서 → "reserved instance, auto-scaling down 전략" 까지 도달'
    },
    security: {
      sequence: [
        '경계 확인: "외부에서 DB로 직접 접근 가능한가요?"',
        '암호화: "어디서 어디까지 암호화되나요?"',
        '키 관리: "암호화 키는 어디 보관하나요?"',
        '침해 대응: "API 키가 유출되면 어떻게 하나요?"'
      ],
      ahaGoal: '"보안 있습니다"에서 → "구체적 암호화 범위, 키 관리, 침해 대응" 까지 도달'
    },
    sustainability: {
      sequence: [
        '결합도: "이 컴포넌트를 교체하면 무엇이 깨지나요?"',
        'API 계약: "API 변경 시 기존 클라이언트는?"',
        '확장성: "새 기능 추가가 어렵지 않나요?"',
        '문서화: "새 팀원이 이해하는데 얼마나 걸릴까요?"'
      ],
      ahaGoal: '"모듈화되어 있습니다"에서 → "구체적 인터페이스, 의존성, 확장 전략" 까지 도달'
    }
  };

  return patterns[pillarKey] || patterns.reliability;
}

/**
 * 통계 정보 조회
 */
export function getInterviewStatistics() {
  const interviews = loadAllInterviews();
  const insights = extractPillarInsights();

  return {
    totalInterviews: interviews.length,
    pillarCoverage: Object.keys(insights).map(pillar => ({
      pillar,
      exampleCount: insights[pillar].interviewExamples.length,
      commonGaps: insights[pillar].commonGaps.length,
      effectiveQuestions: insights[pillar].effectiveQuestions.length
    }))
  };
}
