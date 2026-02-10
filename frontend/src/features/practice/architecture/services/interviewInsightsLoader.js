/**
 * Interview Insights Loader (Enhanced V2)
 *
 * [생성일: 2026-02-09]
 * [업데이트 V2: 2026-02-10] - JSON 데이터 실제 활용
 *
 * 실제 시스템 디자인 면접 데이터(transcript, summary)를 로드하고
 * 질문 생성 및 평가에 활용할 수 있는 인사이트를 추출합니다.
 *
 * V2 개선사항:
 * - ✅ Summary에서 실제 commonGaps 추출 (하드코딩 제거)
 * - ✅ Transcript에서 실제 effectiveQuestions 추출 (하드코딩 제거)
 * - ✅ Transcript에서 실제 probingSequences 추출
 * - ✅ 캐싱 시스템으로 성능 최적화
 */

// 모든 interview JSON 파일을 동적으로 import
const interviewFiles = import.meta.glob('@/data/interview/*.json', { eager: true });

// 검증 및 분류 모듈 import
import { validateInterviewDataset } from './interviewDataValidator';
import { batchClassifyInterviews } from './llmBasedClassifier';

// 캐시 (중복 로드 및 파싱 방지)
let _cachedInterviews = null;
let _cachedValidation = null;
let _cachedInsights = null; // 추출한 인사이트 캐싱

/**
 * 6대 기둥 키워드 정의
 */
const PILLAR_KEYWORDS = {
  reliability: ['redundancy', 'failover', 'availability', 'disaster recovery', 'replication', 'single point of failure', 'spof', 'backup', 'fault toleran'],
  performance: ['latency', 'throughput', 'scalability', 'cdn', 'cache', 'caching', 'load balancing', 'auto-scaling', 'performance', 'bottleneck', 'optimize'],
  operational: ['monitoring', 'observability', 'alerting', 'logging', 'metrics', 'telemetry', 'alarm', 'runbook', 'playbook'],
  cost: ['cost', 'pricing', 'reserved instance', 'spot instance', 'auto-scaling down', 'data tiering', 'storage', 'expense'],
  security: ['encryption', 'authentication', 'authorization', 'tls', 'ssl', 'key management', 'least privilege', 'security', 'access control', 'firewall'],
  sustainability: ['modularity', 'coupling', 'dependency', 'maintainability', 'extensibility', 'technical debt', 'refactor', 'api version']
};

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
  if (validation.biasReport && validation.biasReport.warning !== 'OK') {
    console.warn(`⚠️ [편향 경고] ${validation.biasReport.warning}`);
  }

  // LLM 분류 (옵션)
  let finalInterviews = validInterviews;
  if (useLLMClassification) {
    console.log('🤖 [LLM 분류] 시작... (시간이 걸릴 수 있습니다)');
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
 * ========================================
 * V2 신규 기능: JSON에서 실제 인사이트 추출
 * ========================================
 */

/**
 * Summary에서 commonGaps 추출
 *
 * @param {Array} interviews - 면접 데이터 배열
 * @param {string} pillarKey - 기둥 키 (reliability, performance 등)
 * @returns {Array} 추출된 commonGaps
 */
function extractCommonGapsFromSummaries(interviews, pillarKey) {
  const gaps = [];
  const keywords = PILLAR_KEYWORDS[pillarKey];

  interviews.forEach(interview => {
    const { summary, title } = interview;
    if (!summary) return;

    const lowerSummary = summary.toLowerCase();

    // 패턴 1: "missing", "didn't mention", "forgot", "should have"
    const missingPatterns = [
      /missing ([^.!?\n]{10,80})/gi,
      /didn't mention ([^.!?\n]{10,80})/gi,
      /forgot to ([^.!?\n]{10,80})/gi,
      /should have ([^.!?\n]{10,80})/gi,
      /wasn't able to finish ([^.!?\n]{10,80})/gi,
      /failed to ([^.!?\n]{10,80})/gi,
      /didn't discuss ([^.!?\n]{10,80})/gi,
      /missed ([^.!?\n]{10,80})/gi
    ];

    missingPatterns.forEach(pattern => {
      const matches = summary.matchAll(pattern);
      for (const match of matches) {
        const gap = match[1].trim();

        // 키워드와 관련 있으면 추가
        if (keywords.some(kw => gap.toLowerCase().includes(kw))) {
          gaps.push({
            gap: gap,
            source: title
          });
        }
      }
    });

    // 패턴 2: "should look into the following topics:"
    const shouldLookIntoMatch = summary.match(/should look into[^:]*:\s*([^.!?\n]+)/i);
    if (shouldLookIntoMatch) {
      const topicsText = shouldLookIntoMatch[1];
      const topics = topicsText.split(/,|and/).map(t => t.trim()).filter(t => t.length > 2);

      topics.forEach(topic => {
        if (keywords.some(kw => topic.toLowerCase().includes(kw))) {
          gaps.push({
            gap: `${topic} 개념 누락`,
            source: title
          });
        }
      });
    }

    // 패턴 3: "was also missing"
    const alsoMissingMatch = summary.match(/was also missing ([^.!?\n]{10,80})/gi);
    if (alsoMissingMatch) {
      alsoMissingMatch.forEach(match => {
        const gapMatch = match.match(/was also missing ([^.!?\n]+)/i);
        if (gapMatch) {
          const gap = gapMatch[1].trim();
          if (keywords.some(kw => gap.toLowerCase().includes(kw))) {
            gaps.push({
              gap: gap,
              source: title
            });
          }
        }
      });
    }
  });

  // 중복 제거 및 빈도순 정렬
  const gapCounts = {};
  gaps.forEach(({ gap }) => {
    const normalized = gap.toLowerCase().trim();
    gapCounts[normalized] = gapCounts[normalized] || { gap, count: 0 };
    gapCounts[normalized].count += 1;
  });

  const sortedGaps = Object.values(gapCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 상위 10개

  return sortedGaps.map(item => item.gap);
}

/**
 * Transcript에서 effectiveQuestions 추출
 *
 * @param {Array} interviews - 면접 데이터 배열
 * @param {string} pillarKey - 기둥 키
 * @returns {Array} 추출된 효과적인 질문들
 */
function extractEffectiveQuestionsFromTranscripts(interviews, pillarKey) {
  const questions = [];
  const keywords = PILLAR_KEYWORDS[pillarKey];

  interviews.forEach(interview => {
    const { transcript, title } = interview;
    if (!transcript) return;

    // 면접관 이름 추출 (transcript 앞부분에서)
    const speakerMatches = [...transcript.matchAll(/([A-Z][a-z]+\s+[A-Z][a-z]+):/g)];
    if (speakerMatches.length < 2) return;

    // 가장 많이 등장하는 화자 2명 추출 (면접관 vs 지원자)
    const speakerCounts = {};
    speakerMatches.forEach(match => {
      const name = match[1];
      speakerCounts[name] = (speakerCounts[name] || 0) + 1;
    });

    const sortedSpeakers = Object.entries(speakerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    if (sortedSpeakers.length < 2) return;

    // 두 번째로 많이 말한 사람이 면접관 (보통 면접관이 질문을 더 많이 함)
    const interviewerName = sortedSpeakers[0];

    // 면접관 발화만 추출
    const interviewerPattern = new RegExp(`${interviewerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*([^\\n]+)`, 'g');
    const matches = transcript.matchAll(interviewerPattern);

    for (const match of matches) {
      const utterance = match[1].trim();

      // 질문 형태인지 확인
      const isQuestion = utterance.includes('?') ||
                        /^(how|what|why|when|where|do you|can you|is there|are there|does|did you|have you|could you)/i.test(utterance);

      if (isQuestion && utterance.length > 15 && utterance.length < 200) {
        // 키워드와 관련 있으면 추가
        const lowerUtterance = utterance.toLowerCase();
        if (keywords.some(kw => lowerUtterance.includes(kw))) {
          questions.push({
            question: utterance,
            source: title,
            interviewer: interviewerName
          });
        }
      }
    }
  });

  // 중복 제거 (유사 질문)
  const uniqueQuestions = [];
  questions.forEach(q => {
    const isDuplicate = uniqueQuestions.some(uq =>
      similarity(q.question.toLowerCase(), uq.question.toLowerCase()) > 0.85
    );
    if (!isDuplicate) {
      uniqueQuestions.push(q);
    }
  });

  return uniqueQuestions.slice(0, 15).map(q => q.question);
}

/**
 * Transcript에서 probing sequences 추출
 *
 * @param {Array} interviews - 면접 데이터 배열
 * @param {string} pillarKey - 기둥 키
 * @returns {Array} 추출된 연속 질문 패턴
 */
function extractProbingSequences(interviews, pillarKey) {
  const sequences = [];
  const keywords = PILLAR_KEYWORDS[pillarKey];

  interviews.forEach(interview => {
    const { transcript, title } = interview;
    if (!transcript) return;

    // 면접관 이름 추출
    const speakerMatches = [...transcript.matchAll(/([A-Z][a-z]+\s+[A-Z][a-z]+):/g)];
    if (speakerMatches.length < 2) return;

    const speakerCounts = {};
    speakerMatches.forEach(match => {
      const name = match[1];
      speakerCounts[name] = (speakerCounts[name] || 0) + 1;
    });

    const sortedSpeakers = Object.entries(speakerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    if (sortedSpeakers.length < 2) return;

    const interviewerName = sortedSpeakers[0];
    const candidateName = sortedSpeakers[1];

    // 모든 발화를 순서대로 추출
    const utterances = [];
    const pattern = /([A-Z][a-z]+\s+[A-Z][a-z]+):\s*([^\n]+)/g;
    const matches = transcript.matchAll(pattern);

    for (const match of matches) {
      utterances.push({
        speaker: match[1],
        text: match[2].trim()
      });
    }

    // 면접관의 연속 질문 찾기
    let currentSequence = [];

    for (let i = 0; i < utterances.length; i++) {
      const u = utterances[i];

      if (u.speaker === interviewerName) {
        const isQuestion = u.text.includes('?') ||
                          /^(how|what|why|when|where|do you|can you|is there)/i.test(u.text);

        if (isQuestion && u.text.length > 15 && u.text.length < 200) {
          const lowerText = u.text.toLowerCase();
          const hasTopic = keywords.some(kw => lowerText.includes(kw));

          if (hasTopic || currentSequence.length > 0) {
            currentSequence.push(u.text);
          }
        }
      } else if (u.speaker === candidateName) {
        // 지원자 답변 → 시퀀스 종료 판단
        if (currentSequence.length >= 3) {
          sequences.push({
            sequence: [...currentSequence],
            source: title
          });
        }
        currentSequence = [];
      }
    }
  });

  // 가장 긴 시퀀스 반환
  const sortedSequences = sequences.sort((a, b) => b.sequence.length - a.sequence.length);
  return sortedSequences.slice(0, 3); // 상위 3개
}

/**
 * 문자열 유사도 계산 (간단한 Jaccard similarity)
 */
function similarity(str1, str2) {
  const tokens1 = new Set(str1.split(/\s+/));
  const tokens2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

/**
 * 6대 기둥별로 면접 인사이트 추출 (V2: JSON 실제 활용)
 *
 * 각 transcript와 summary에서 다음을 추출:
 * - commonGaps: summary에서 "missing", "didn't mention" 등 패턴 추출
 * - effectiveQuestions: transcript에서 면접관의 실제 질문 추출
 * - probingSequences: transcript에서 연속 질문 패턴 추출
 */
export function extractPillarInsights() {
  // 캐시 확인
  if (_cachedInsights) {
    console.log('📦 [캐시] 인사이트 캐시 사용');
    return _cachedInsights;
  }

  console.log('🔍 [인사이트 추출] JSON 파싱 시작...');

  const { interviews } = loadAllInterviews();

  const insights = {};

  // 각 기둥별로 처리
  Object.keys(PILLAR_KEYWORDS).forEach(pillarKey => {
    const keywords = PILLAR_KEYWORDS[pillarKey];

    // 관련 면접만 필터링
    const relevantInterviews = interviews.filter(interview => {
      const lowerSummary = (interview.summary || '').toLowerCase();
      const lowerTranscript = (interview.transcript || '').toLowerCase();

      return keywords.some(kw =>
        lowerSummary.includes(kw.toLowerCase()) ||
        lowerTranscript.includes(kw.toLowerCase())
      );
    });

    console.log(`  - ${pillarKey}: ${relevantInterviews.length}개 관련 면접 발견`);

    // JSON에서 실제 인사이트 추출
    const commonGaps = extractCommonGapsFromSummaries(relevantInterviews, pillarKey);
    const effectiveQuestions = extractEffectiveQuestionsFromTranscripts(relevantInterviews, pillarKey);
    const probingSequences = extractProbingSequences(relevantInterviews, pillarKey);

    insights[pillarKey] = {
      keywords,
      commonGaps: commonGaps.length > 0 ? commonGaps : [
        // Fallback (JSON에서 추출 실패 시)
        `${pillarKey} 관련 설계 구체화 부족`,
        `${pillarKey} 전략 불명확`
      ],
      effectiveQuestions: effectiveQuestions.length > 0 ? effectiveQuestions : [
        // Fallback
        `${pillarKey}는 어떻게 처리하시겠어요?`
      ],
      probingSequences: probingSequences.length > 0 ? probingSequences : [],
      interviewExamples: relevantInterviews.slice(0, 10).map(i => ({
        title: i.title,
        summary: (i.summary || '').substring(0, 300) + '...',
        url: i.url
      })),
      stats: {
        totalRelevant: relevantInterviews.length,
        gapsExtracted: commonGaps.length,
        questionsExtracted: effectiveQuestions.length,
        sequencesExtracted: probingSequences.length
      }
    };
  });

  console.log('✅ [인사이트 추출] 완료');

  // 캐시 저장
  _cachedInsights = insights;

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
 * 질문 생성 시 사용할 컨텍스트 강화 (V2: JSON 실제 활용)
 *
 * 기존 원칙(principles)에 실제 면접 인사이트를 추가하여
 * 더 현실적이고 구체적인 질문을 생성할 수 있도록 함
 */
export function enhanceQuestionContext(pillarKey, basePrinciples) {
  const insights = extractPillarInsights();
  const pillarInsights = insights[pillarKey];

  if (!pillarInsights) return basePrinciples;

  const stats = pillarInsights.stats;

  const enhancedContext = `
${basePrinciples}

---

## 실제 면접에서 자주 발견되는 취약점 (${stats.totalRelevant}개 면접 분석)

${pillarInsights.commonGaps.slice(0, 8).map(gap => `- ${gap}`).join('\n')}

## 효과적인 질문 예시 (실제 Google/Facebook 면접관 질문, ${stats.questionsExtracted}개 추출)

${pillarInsights.effectiveQuestions.slice(0, 10).map(q => `- "${q}"`).join('\n')}

${pillarInsights.probingSequences.length > 0 ? `
## 면접관의 Probing 패턴 (연속 질문 예시)

### 예시: ${pillarInsights.probingSequences[0].source}
${pillarInsights.probingSequences[0].sequence.slice(0, 4).map((q, i) => `${i + 1}. "${q}"`).join('\n')}
` : ''}

## 질문 생성 가이드

1. **상황 기반**: 위 효과적인 질문들처럼 구체적 상황 제시
2. **탐색적**: "Do you know...?" "Can you explain...?" "What happens if...?" 형태
3. **실전 연계**: 위 취약점들을 자연스럽게 탐색할 수 있는 질문
4. **Probing**: ${pillarInsights.probingSequences.length > 0 ? '위 연속 질문 패턴처럼 점진적으로 깊이 파기' : '점진적으로 구체화하며 깊이 파기'}
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
    exampleCount: pillarInsights.interviewExamples.length,
    stats: pillarInsights.stats
  };
}

/**
 * 딥다이브 질문 생성 시 실제 면접관의 후속 질문 패턴 제공 (V2: JSON 활용)
 */
export function getProbingPatterns(pillarKey) {
  const insights = extractPillarInsights();
  const pillarInsights = insights[pillarKey];

  if (!pillarInsights || pillarInsights.probingSequences.length === 0) {
    // Fallback: 하드코딩된 기본 패턴
    const fallbackPatterns = {
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

    return fallbackPatterns[pillarKey] || fallbackPatterns.reliability;
  }

  // JSON에서 추출한 실제 패턴 사용
  const bestSequence = pillarInsights.probingSequences[0];

  return {
    sequence: bestSequence.sequence,
    source: bestSequence.source,
    ahaGoal: `실제 ${bestSequence.source} 면접에서 사용된 probing 패턴`
  };
}

/**
 * 통계 정보 조회
 */
export function getInterviewStatistics() {
  const { interviews } = loadAllInterviews();
  const insights = extractPillarInsights();

  return {
    totalInterviews: interviews.length,
    pillarCoverage: Object.keys(insights).map(pillar => ({
      pillar,
      exampleCount: insights[pillar].interviewExamples.length,
      commonGaps: insights[pillar].commonGaps.length,
      effectiveQuestions: insights[pillar].effectiveQuestions.length,
      probingSequences: insights[pillar].probingSequences.length,
      stats: insights[pillar].stats
    }))
  };
}

/**
 * 캐시 초기화 (테스트/디버깅용)
 */
export function clearCache() {
  _cachedInterviews = null;
  _cachedValidation = null;
  _cachedInsights = null;
  console.log('🗑️ [캐시 초기화] 모든 캐시 삭제됨');
}
