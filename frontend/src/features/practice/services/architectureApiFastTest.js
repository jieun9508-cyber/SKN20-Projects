/**
 * Architecture Practice API Service - Quick Mode
 *
 * [수정일: 2026-02-09]
 * 퀵 플레이 모드: 가장 취약한 3개 갈래만 선택하여 질문 생성
 * - 분석 에이전트가 아키텍처에서 취약한 3개 기둥 식별
 * - 각 기둥마다 전담 에이전트가 질문 1개 생성
 * - 딥다이브 최대 1회로 제한하여 5-10분 플레이 시간 유지
 *
 * txt 파일에서 [핵심 분석 원칙] 섹션만 파싱하여 사용
 */

import architectureProblems from '@/data/architecture.json';

// 6대 기둥 txt 파일 import (Vite ?raw 쿼리 사용)
import reliabilityTxt from '@/data/신뢰성.txt?raw';
import performanceTxt from '@/data/최적화.txt?raw';
import operationalTxt from '@/data/운영유용성.txt?raw';
import costTxt from '@/data/비용.txt?raw';
import securityTxt from '@/data/보안.txt?raw';
import sustainabilityTxt from '@/data/지속가능성.txt?raw';

const getApiKey = () => import.meta.env.VITE_OPENAI_API_KEY;

/**
 * txt 파일에서 [핵심 분석 원칙] 섹션만 추출
 * - 질문 예시는 제외 (LLM이 복사하는 것 방지)
 * - 원칙만 제공하여 맞춤형 질문 생성 유도
 */
function extractPrinciples(txtContent) {
  // [핵심 분석 원칙 으로 시작해서 다음 ### 까지 추출
  const match = txtContent.match(/### \[핵심 분석 원칙[^\]]*\]\s*([\s\S]*?)(?=### \[|$)/);
  if (match) {
    return match[1].trim();
  }
  return '';
}

/**
 * 6대 기둥 (txt 파일에서 핵심 원칙 추출)
 */
const PILLAR_DATA = {
  reliability: {
    name: '신뢰성 (Reliability)',
    principles: extractPrinciples(reliabilityTxt)
  },
  performance: {
    name: '성능 최적화 (Performance)',
    principles: extractPrinciples(performanceTxt)
  },
  operational: {
    name: '운영 우수성 (Operational Excellence)',
    principles: extractPrinciples(operationalTxt)
  },
  cost: {
    name: '비용 최적화 (Cost)',
    principles: extractPrinciples(costTxt)
  },
  security: {
    name: '보안 (Security)',
    principles: extractPrinciples(securityTxt)
  },
  sustainability: {
    name: '지속 가능성 (Sustainability)',
    principles: extractPrinciples(sustainabilityTxt)
  }
};

/**
 * 기둥별 Fallback 질문 (API 실패 시 사용)
 */
const FALLBACK_QUESTIONS = {
  reliability: {
    category: '신뢰성',
    gap: '장애 대응',
    question: '핵심 서버가 갑자기 다운된다면, 사용자들은 어떤 경험을 하게 되나요? 서비스가 완전히 중단되나요?'
  },
  performance: {
    category: '성능',
    gap: '확장성',
    question: '동시 사용자가 평소의 10배로 급증하면, 이 아키텍처가 자동으로 처리량을 늘릴 수 있나요?'
  },
  operational: {
    category: '운영',
    gap: '모니터링',
    question: '시스템에 문제가 생겼을 때, 운영팀이 사용자보다 먼저 알 수 있는 방법이 있나요?'
  },
  cost: {
    category: '비용',
    gap: '비용 효율성',
    question: '트래픽이 적은 새벽 시간대에도 동일한 인프라 비용이 발생하나요? 비용을 줄일 수 있는 구조인가요?'
  },
  security: {
    category: '보안',
    gap: '접근 제어',
    question: '외부에서 내부 데이터베이스에 직접 접근하는 것을 어떻게 차단하고 있나요?'
  },
  sustainability: {
    category: '지속가능성',
    gap: '유지보수성',
    question: '새로운 기능을 추가하거나 기존 컴포넌트를 교체할 때, 다른 부분에 영향을 최소화할 수 있는 구조인가요?'
  }
};

/**
 * 분석 에이전트: 아키텍처에서 가장 취약한 3개 기둥 식별
 * (퀵 플레이 모드)
 */
async function analyzeWeakPillars(context) {
  const allPillars = Object.entries(PILLAR_DATA).map(([key, pillar]) => ({
    key,
    name: pillar.name,
    category: FALLBACK_QUESTIONS[key].category
  }));

  const prompt = `당신은 **시스템 아키텍처 분석 전문가**입니다.

## 임무
지원자의 아키텍처를 분석하여 **가장 취약한 3개 영역**을 식별하세요.

## 시나리오
${context.scenario || '시스템 아키텍처 설계'}

## 미션
${context.missions.length > 0 ? context.missions.map((m, i) => `${i + 1}. ${m}`).join('\n') : '없음'}

## 제약조건
${context.constraints.length > 0 ? context.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n') : '없음'}

## 아키텍처
컴포넌트:
${context.componentList || '(없음)'}

연결:
${context.connectionList || '(없음)'}

## 지원자 설명
"${context.userExplanation || '(설명 없음)'}"

## 평가 가능한 영역
${allPillars.map(p => `- ${p.name}`).join('\n')}

## 규칙
1. 위 6개 영역 중 **가장 취약한 3개**를 우선순위 순으로 선택
2. 시나리오의 핵심 요구사항과 관련이 높은 영역 우선
3. 아키텍처에 명시되지 않았거나 불충분한 영역 선택
4. 지원자가 이미 충분히 설명한 영역은 제외

## JSON 출력 (반드시 이 형식만, 정확히 3개)
{
  "weakPillars": [
    { "category": "신뢰성", "reason": "장애 복구 전략이 명시되지 않음" },
    { "category": "성능", "reason": "확장성 고려가 부족함" },
    { "category": "보안", "reason": "접근 제어 메커니즘이 없음" }
  ]
}`;

  try {
    const response = await callOpenAI(prompt, { maxTokens: 600, temperature: 0.3 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 정확히 3개인지 확인
      if (parsed.weakPillars && parsed.weakPillars.length >= 3) {
        return parsed.weakPillars.slice(0, 3);
      }
    }
  } catch (error) {
    console.warn('분석 에이전트 실패, 기본 3개 선택:', error);
  }

  // Fallback: 신뢰성, 성능, 보안 (가장 보편적인 3개)
  return [
    { category: '신뢰성', reason: '장애 복구 전략 확인 필요' },
    { category: '성능', reason: '확장성 및 성능 최적화 확인 필요' },
    { category: '보안', reason: '보안 메커니즘 확인 필요' }
  ];
}

/**
 * 단일 기둥 전담 에이전트: 해당 기둥 관점의 질문 1개 생성
 */
async function generateSinglePillarQuestion(pillarKey, pillar, context) {
  const categoryName = FALLBACK_QUESTIONS[pillarKey].category;

  const prompt = `당신은 **${pillar.name}** 전문 면접관입니다.

## 임무
지원자의 아키텍처에서 ${pillar.name} 관점의 취약점을 파악하고,
**구체적이고 상황 기반의 질문 1개**를 생성하세요.

## 시나리오
${context.scenario || '시스템 아키텍처 설계'}

## 미션
${context.missions.length > 0 ? context.missions.map((m, i) => `${i + 1}. ${m}`).join('\n') : '없음'}

## 제약조건
${context.constraints.length > 0 ? context.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n') : '없음'}

## 아키텍처
컴포넌트:
${context.componentList || '(없음)'}

연결:
${context.connectionList || '(없음)'}

## 지원자 설명
"${context.userExplanation || '(설명 없음)'}"

## ${pillar.name} 핵심 원칙
${pillar.principles}

## 질문 스타일 (힌트형 퍼즐, 심문 X)
- ❌ 나쁜 예: "eviction policy는 뭘 쓰시겠습니까?" (답을 요구)
- ✅ 좋은 예: "Redis 메모리가 꽉 차면 어떻게 될까요?" (상황 제시)
- "~한 상황이 발생하면 어떻게 되나요?" 형태 권장
- 배치된 컴포넌트만 언급
- Yes/No가 아닌 설계 의도를 묻는 개방형 질문
- 지원자가 이미 설명한 내용은 재질문 금지

## JSON 출력 (반드시 이 형식만)
{ "category": "${categoryName}", "gap": "부족한 점", "question": "질문" }`;

  const response = await callOpenAI(prompt, { maxTokens: 400, temperature: 0.4 });
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    // 카테고리를 강제 고정 (LLM이 다른 카테고리를 반환할 수 있으므로)
    parsed.category = categoryName;
    return parsed;
  }
  throw new Error('Invalid JSON from pillar agent');
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(prompt, options = {}) {
  const {
    model = 'gpt-4o-mini',
    maxTokens = 1500,
    temperature = 0.7
  } = options;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature
    })
  });

  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * 문제 데이터 로드
 */
export async function fetchProblems() {
  return architectureProblems;
}

/**
 * 퀵 플레이 모드: 취약한 3개 갈래만 선택하여 질문 생성
 * [수정일: 2026-02-09]
 *
 * 흐름:
 * 1. 분석 에이전트가 가장 취약한 3개 기둥 식별
 * 2. 각 기둥마다 전담 에이전트가 질문 1개 생성 (병렬 실행)
 * 3. 실패한 에이전트는 해당 기둥의 fallback 질문 사용
 */
export async function generateFollowUpQuestions(problem, components, connections, mermaidCode, userExplanation) {
  console.log('🔍 [퀵 모드] 분석 에이전트 시작...');

  // 컴포넌트/연결 정보 정리
  const componentList = components.map(c => `- ${c.text} (타입: ${c.type})`).join('\n');
  const connectionList = connections.map(conn => {
    const from = components.find(c => c.id === conn.from);
    const to = components.find(c => c.id === conn.to);
    return from && to ? `- ${from.text} → ${to.text}` : null;
  }).filter(Boolean).join('\n');

  // 공통 컨텍스트 빌드
  const context = {
    scenario: problem?.scenario || '',
    missions: problem?.missions || [],
    constraints: problem?.constraints || [],
    componentList,
    connectionList,
    mermaidCode,
    userExplanation
  };

  // 1단계: 분석 에이전트 - 취약한 3개 기둥 식별
  const weakPillars = await analyzeWeakPillars(context);
  console.log('📊 취약한 3개 영역:', weakPillars.map(p => p.category).join(', '));

  // 카테고리 → 기둥 키 매핑
  const categoryToKey = {
    '신뢰성': 'reliability',
    '성능': 'performance',
    '운영': 'operational',
    '비용': 'cost',
    '보안': 'security',
    '지속가능성': 'sustainability'
  };

  // 2단계: 선택된 3개 기둥에 대해 질문 생성 (병렬 실행)
  const selectedPillarKeys = weakPillars.map(wp => categoryToKey[wp.category]).filter(Boolean);
  const results = await Promise.allSettled(
    selectedPillarKeys.map(key => {
      const pillar = PILLAR_DATA[key];
      return pillar ? generateSinglePillarQuestion(key, pillar, context) : null;
    }).filter(Boolean)
  );

  // 성공한 결과 수집, 실패 시 fallback
  const questions = results.map((result, idx) => {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
    const key = selectedPillarKeys[idx];
    console.warn(`기둥 에이전트 실패 (${key}):`, result.reason);
    return FALLBACK_QUESTIONS[key];
  });

  console.log('✅ [퀵 모드] 질문 3개 생성 완료');

  return {
    analysis: {
      mentioned: [],
      missing: questions.map(q => q.category),
      weakPillars // 분석 에이전트의 판단 근거 포함
    },
    questions // 3개만
  };
}

/**
 * 판정 에이전트: 사용자 답변이 충분한지 판단
 * [수정일: 2026-02-09]
 *
 * @param {Object} questionData - 질문 정보 { category, question, gap }
 * @param {string} userAnswer - 사용자 답변
 * @param {Object} context - 아키텍처 컨텍스트
 * @returns {Object} { isSufficient: boolean, reason: string }
 */
export async function judgeAnswerSufficiency(questionData, userAnswer, context) {
  const pillarKey = Object.keys(FALLBACK_QUESTIONS).find(
    key => FALLBACK_QUESTIONS[key].category === questionData.category
  );
  const pillar = pillarKey ? PILLAR_DATA[pillarKey] : null;

  const prompt = `당신은 **답변 충분성 판정 전문가**입니다.
질문하는 사람이 아니라, 답변을 판단하는 독립적인 평가자입니다.

## 질문 정보
카테고리: ${questionData.category}
질문: "${questionData.question}"
의도: ${questionData.gap || '설계 의도 확인'}

## 사용자 답변
"${userAnswer}"

## 판정 기준 (충분 vs 불충분)

### ✅ 충분한 답변
1. **핵심 키워드 + 이유** 모두 포함
   - 예: "PostgreSQL을 사용합니다. ACID가 필요하고 동시 요청 처리에 강점이 있어서입니다."
2. **구체적인 기술/전략** 제시
   - 예: "큐 길이가 1000을 넘으면 Kubernetes가 워커를 자동 스케일링합니다."
3. **트레이드오프** 언급
   - 예: "Redis는 빠르지만 영속성이 약해서 RDB와 함께 사용합니다."

### ❌ 불충분한 답변
1. **키워드만 있고 이유 없음**
   - 예: "캐시를 쓰겠습니다." (어디에? 왜? 어떻게?)
2. **모호하거나 추상적**
   - 예: "모니터링 시스템을 사용합니다." (어떤 메트릭? 어떻게 감지?)
3. **같은 말 반복**
   - 이전 답변과 실질적으로 동일한 내용

### ⚠️ 2회 반복 시 강제 종료
- 같은 방향의 답변을 2번 반복하면 "기록 후 다음 갈래로"
- 더 이상 파고들지 않음

## JSON 출력 (반드시 이 형식만)
{
  "isSufficient": true/false,
  "reason": "판정 근거 (1-2문장)",
  "missingPoints": ["부족한 점 1", "부족한 점 2"] // isSufficient: false일 때만
}`;

  try {
    const response = await callOpenAI(prompt, { maxTokens: 300, temperature: 0.2 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('판정 에이전트 실패:', error);
  }

  // Fallback: 기본적으로 불충분으로 판정 (안전 장치)
  return {
    isSufficient: false,
    reason: '답변 판정 중 오류가 발생했습니다.',
    missingPoints: ['판정 오류']
  };
}

/**
 * 딥다이브 질문 생성 (같은 갈래에서 더 깊이 파기)
 * [수정일: 2026-02-09]
 *
 * @param {Object} questionData - 원래 질문 정보
 * @param {string} userAnswer - 사용자의 불충분한 답변
 * @param {Array} missingPoints - 부족한 점들
 * @param {Object} context - 아키텍처 컨텍스트
 * @returns {Object} { category, question, gap }
 */
export async function generateDeepDiveQuestion(questionData, userAnswer, missingPoints, context) {
  const pillarKey = Object.keys(FALLBACK_QUESTIONS).find(
    key => FALLBACK_QUESTIONS[key].category === questionData.category
  );
  const pillar = pillarKey ? PILLAR_DATA[pillarKey] : null;

  const prompt = `당신은 **${questionData.category}** 전문 면접관입니다.
지원자의 답변이 불충분하여, 같은 주제에서 **더 깊이 파고드는 질문**을 생성하세요.

## 원래 질문
"${questionData.question}"

## 지원자의 불충분한 답변
"${userAnswer}"

## 부족한 점
${missingPoints.map(p => `- ${p}`).join('\n')}

## 아키텍처 컨텍스트
컴포넌트: ${context.componentList || '(없음)'}
연결: ${context.connectionList || '(없음)'}

## 딥다이브 질문 스타일 (힌트형 퍼즐, 심문 X)
- ❌ 나쁜 예: "그럼 eviction policy는 뭘 쓰시겠습니까?" (답 요구, 심문)
- ✅ 좋은 예: "Redis 메모리가 꽉 차면 어떻게 될까요?" (상황 제시, 사고 유도)
- 원래 질문과 **같은 주제**를 **다른 각도**로 접근
- 부족한 점을 자연스럽게 생각하게 만드는 질문
- "~한 상황에서 어떻게 되나요?" 형태 권장

## JSON 출력 (반드시 이 형식만)
{ "category": "${questionData.category}", "gap": "추가로 확인할 점", "question": "딥다이브 질문" }`;

  try {
    const response = await callOpenAI(prompt, { maxTokens: 300, temperature: 0.4 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.category = questionData.category; // 카테고리 고정
      return parsed;
    }
  } catch (error) {
    console.warn('딥다이브 질문 생성 실패:', error);
  }

  // Fallback: 일반적인 심화 질문
  return {
    category: questionData.category,
    gap: '구체적인 전략',
    question: `${questionData.question}에 대해 조금 더 구체적으로 설명해주시겠어요?`
  };
}
