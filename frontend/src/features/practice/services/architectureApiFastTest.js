/**
 * Architecture Practice API Service
 *
 * 6대 기둥 각각에 전담 에이전트를 배정하여 병렬로 질문 6개를 생성
 * - 기둥 선택 비결정성을 원천 제거 (항상 동일한 6개 카테고리)
 * - Promise.allSettled로 병렬 실행하여 속도 유지
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
 * 단일 기둥 전담 에이전트: 해당 기둥 관점의 질문 1개 생성
 */
async function generateSinglePillarQuestion(pillarKey, pillar, context) {
  const categoryName = FALLBACK_QUESTIONS[pillarKey].category;

  const prompt = `당신은 **${pillar.name}** 전문 아키텍트입니다.

## 임무
지원자의 아키텍처와 설명에서 ${pillar.name} 관점의 부족한 점을 파악하고,
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

## 규칙
- "~한 상황이 발생하면" 형태의 상황 기반 질문
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
 * 6대 기둥 병렬 에이전트로 맞춤형 질문 6개 생성
 * - 각 기둥마다 전담 에이전트가 해당 관점의 질문 1개를 생성
 * - Promise.allSettled로 병렬 실행 → 속도 유지
 * - 실패한 에이전트는 해당 기둥의 fallback 질문 사용
 */
export async function generateFollowUpQuestions(problem, components, connections, mermaidCode, userExplanation) {
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

  // 6개 기둥 병렬 실행
  const pillarEntries = Object.entries(PILLAR_DATA);
  const results = await Promise.allSettled(
    pillarEntries.map(([key, pillar]) => generateSinglePillarQuestion(key, pillar, context))
  );

  // 성공한 결과 수집, 실패 시 fallback
  const questions = results.map((result, idx) => {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
    console.warn(`기둥 에이전트 실패 (${pillarEntries[idx][0]}):`, result.reason);
    return FALLBACK_QUESTIONS[pillarEntries[idx][0]];
  });

  return {
    analysis: {
      mentioned: [],
      missing: questions.map(q => q.category)
    },
    questions // 6개
  };
}
