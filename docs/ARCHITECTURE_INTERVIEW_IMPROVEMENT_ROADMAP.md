# 시스템 아키텍처 면접 질문/평가 개선 로드맵

**작성일:** 2026-02-09
**목적:** 현실적이고 단계적인 개선 방향 제시
**대상:** 길을 잃은 개발자를 위한 명확한 가이드

---

## 📍 현재 위치 파악

### 1. 현재 시스템 구조

```
[기존 시스템]
질문 생성 (architectureQuestionApi.js)
├─ 1단계: analyzeWeakPillars()
│   └─ 아키텍처 분석 → 취약한 3개 기둥 선택
├─ 2단계: generateSinglePillarQuestion() × 3
│   └─ 각 기둥마다 질문 1개 생성
├─ 3단계: judgeAnswerSufficiency()
│   └─ 답변 충분성 판정
└─ 4단계: generateDeepDiveQuestion()
    └─ 불충분 시 후속 질문 생성

평가 (architectureEvaluatorApi.js)
└─ evaluateWithMasterAgent()
    ├─ 3개 카테고리 평가
    ├─ 점수 산정 (0-100)
    └─ 모범답안 생성
```

### 2. 당신이 가진 자산

✅ **코드:**
- ✅ 작동하는 질문 생성/평가 시스템
- ✅ 분석 에이전트 (취약점 찾기)
- ✅ 판정 에이전트 (답변 충분성)
- ✅ 딥다이브 질문 생성

✅ **데이터:**
- ✅ 31개 실제 면접 JSON 파일
- ✅ 6대 기둥 원칙 txt 파일

✅ **문서:**
- ✅ V1 통합 계획 (이상적이지만 구현 누락)
- ✅ V2 개선안 (feedback 반영)
- ✅ feedback.md (V1의 문제점 지적)

### 3. 당신이 잃어버린 것

❌ **명확한 목표:**
- "딥다이브를 적용"이 뭘 의미하는가?
- "랭그래프로 구현"이 왜 필요한가?
- 최종 결과물이 어떤 모습이어야 하는가?

❌ **기술적 범위:**
- LangGraph를 배워야 하는가?
- 에이전트를 분리해야 하는가?
- 단일 에이전트로도 충분한가?

❌ **우선순위:**
- 질문 개선이 먼저인가?
- 평가 개선이 먼저인가?
- 데이터 활용이 먼저인가?

---

## 🎯 목표 재정의

### 현실적 목표 (달성 가능)

#### 핵심 질문: "무엇이 문제인가?"

당신의 불만:
> "한번에 3개 질문 생성해서 평가하는 로직이 부족해보임"

**진짜 문제를 파악하세요:**

| 가능한 문제 | 해결 방법 | 난이도 |
|-----------|---------|--------|
| **1. 질문이 너무 추상적** | 실제 면접 데이터 활용 | ⭐⭐ |
| **2. 평가가 불공정** | 실제 면접 벤치마크 적용 | ⭐⭐⭐ |
| **3. 딥다이브가 비효율적** | Probing 패턴 학습 | ⭐⭐⭐ |
| **4. 에이전트 구조가 복잡** | 랭그래프로 재설계 | ⭐⭐⭐⭐⭐ |

**우선순위 설정:**
```
Phase 1 (필수): 1번 - 질문 개선
Phase 2 (중요): 2번 - 평가 개선
Phase 3 (선택): 3번 - 딥다이브 개선
Phase 4 (보류): 4번 - 아키텍처 재설계
```

### 이상적 목표 (장기)

```
최종 비전: Google/Facebook 수준의 시스템 디자인 면접 시뮬레이터

특징:
- 실제 면접관처럼 대화
- 취약점을 정확히 파고듦
- 공정하고 구체적인 평가
- 실전 합격 가능성 피드백
```

**중요:** 이건 6개월~1년 프로젝트입니다. 지금 당장은 Phase 1부터.

---

## 🔍 기술적 가능성 평가

### Q1: "랭그래프(LangGraph)가 필요한가?"

**답변: 현재는 NO**

**이유:**
```python
# 랭그래프가 유용한 경우
- 복잡한 상태 관리 필요
- 다중 에이전트 간 협업
- 동적 워크플로우 변경
- 실행 경로 시각화

# 당신의 현재 시스템
- 선형 워크플로우 (1→2→3→4)
- 에이전트 간 협업 없음 (순차 실행)
- 상태가 간단함 (질문, 답변, 평가)
```

**현재 시스템:**
```javascript
// 이미 잘 작동하는 구조
질문1 생성 → 답변 → 판정 → (충분/불충분)
                              ↓ 불충분
                         딥다이브 질문 → 답변 → 판정
```

**랭그래프 도입 시:**
```python
# 복잡도만 증가, 실질적 이점 없음
from langgraph import StateGraph

# 배워야 할 것:
- LangGraph 개념 (2-3일)
- Python-JS 연동 (1-2일)
- 디버깅 (???일)

# 얻는 것:
- ... 별로 없음 (현재 JS로도 충분)
```

**결론:**
- ❌ 지금은 랭그래프 불필요
- ✅ 나중에 필요하면 그때 도입 (Phase 4)
- ✅ 현재 구조로도 개선 가능

### Q2: "에이전트를 분리해야 하는가?"

**답변: 현재도 이미 분리되어 있음**

```javascript
// 당신의 현재 시스템
분석 에이전트: analyzeWeakPillars()
질문 에이전트: generateSinglePillarQuestion()
판정 에이전트: judgeAnswerSufficiency()
딥다이브 에이전트: generateDeepDiveQuestion()
평가 에이전트: evaluateWithMasterAgent()
```

**이미 5개 에이전트로 분리됨!**

**문제는 분리가 아니라:**
- ❌ 에이전트 개수가 부족한 게 아님
- ✅ 각 에이전트의 **품질**이 부족함
- ✅ 에이전트에게 주는 **지식(데이터)**이 부족함

### Q3: "단일 에이전트로 통합해야 하는가?"

**답변: NO, 역행임**

```javascript
// 단일 에이전트 (나쁜 예)
async function doEverything(architecture) {
  // 1. 분석하고
  // 2. 질문 만들고
  // 3. 답변 받고
  // 4. 평가하고
  // ...
  // → 1000줄 함수, 디버깅 지옥
}

// 현재 구조 (좋은 예)
analyzeWeakPillars() → 명확한 책임
generateQuestion()   → 명확한 책임
judgeAnswer()        → 명확한 책임
```

**결론:** 현재 구조 유지, 각 에이전트를 **개선**하는 것이 핵심

---

## 🚀 점진적 개선 계획

### Phase 0: 데이터 검증 (1-2일)

**목표:** 31개 면접 데이터가 실제로 쓸만한지 확인

**작업:**
```javascript
// 파일: interviewDataValidator.js (새로 생성)

1. 모든 JSON 파일 로드 (31개)
2. 각 파일의 품질 점수 계산
   - title 존재? (5점)
   - summary 길이 > 100자? (20점)
   - transcript 길이 > 500자? (50점)
   - 대화 교환 횟수 > 10회? (25점)

3. 품질 리포트 생성
   - Excellent (80+): X개
   - Good (60-79): X개
   - Fair (40-59): X개
   - Poor (0-39): X개

4. 필터링 기준 결정
   - 예: 60점 이상만 사용 → 약 22개
```

**코드 예시:**
```javascript
// interviewDataValidator.js
export function validateInterviews() {
  const interviews = loadAll31Interviews();

  const scored = interviews.map(iv => ({
    ...iv,
    qualityScore: calculateQualityScore(iv)
  }));

  return {
    total: scored.length,
    excellent: scored.filter(s => s.qualityScore >= 80).length,
    good: scored.filter(s => s.qualityScore >= 60).length,
    fair: scored.filter(s => s.qualityScore >= 40).length,
    poor: scored.filter(s => s.qualityScore < 40).length,
    passed: scored.filter(s => s.qualityScore >= 60) // 이것만 사용
  };
}

function calculateQualityScore(interview) {
  let score = 0;

  if (interview.title && interview.title.length > 5) score += 10;
  if (interview.summary && interview.summary.length > 100) score += 30;
  if (interview.transcript && interview.transcript.length > 500) score += 40;

  // 대화 횟수 (Interviewer:, Candidate: 개수)
  const exchanges = (interview.transcript.match(/Interviewer:|Candidate:/g) || []).length;
  if (exchanges > 10) score += 20;

  return score;
}
```

**체크리스트:**
- [ ] interviewDataValidator.js 생성
- [ ] 품질 리포트 확인
- [ ] 60점 미만 면접 제외 결정
- [ ] 실제로 사용할 데이터: ~20-25개

**예상 결과:**
```
총 31개 면접
→ Excellent (80+): 5개
→ Good (60-79): 17개
→ Fair (40-59): 7개
→ Poor (0-39): 2개

✅ 사용할 데이터: 22개 (60점 이상)
```

---

### Phase 1: 질문 생성 개선 (3-5일)

**목표:** 실제 면접 인사이트를 질문 생성에 반영

**현재 문제:**
```javascript
// 현재 (architectureQuestionApi.js:190-246)
const prompt = `
당신은 ${pillar.name} 전문 면접관입니다.

## 핵심 원칙
${pillar.principles}  // ← txt 파일에서 추출한 원칙만 사용

질문을 생성하세요.
`;
// → 추상적이고 이론적인 질문
```

**개선:**
```javascript
// 개선 (실제 면접 인사이트 추가)
const prompt = `
당신은 ${pillar.name} 전문 면접관입니다.

## 핵심 원칙
${pillar.principles}

## 실제 면접에서 자주 발견되는 취약점 (22개 면접 분석)
${getCommonGaps(pillarKey)}
// 예: "SPOF 분석 누락 (18/22 면접에서 발견)"
//     "RTO/RPO 구체화 부족 (15/22)"

## 효과적이었던 질문 스타일 (참고)
${getEffectiveQuestions(pillarKey)}
// 예: "주 데이터센터가 다운되면 얼마나 빨리 복구되나요?"
//     (추상적 "장애 대응은?" 보다 구체적)

질문을 생성하세요.
`;
```

**작업 순서:**

**Step 1.1: 면접 데이터 로더 생성 (1일)**
```javascript
// 파일: interviewInsightsLoader.js (새로 생성)

// 이미 코드에서 import 시도 중:
// architectureQuestionApi.js:27
import { enhanceQuestionContext, getProbingPatterns, getAnswerBenchmarks } from './interviewInsightsLoader';

// 실제 구현:
export function loadAllInterviews() {
  // Vite에서 동적 import
  const interviewFiles = import.meta.glob('@/data/interview/*.json', { eager: true });

  return Object.entries(interviewFiles).map(([path, module]) => ({
    filename: path.split('/').pop(),
    ...module.default
  }));
}

export function getCommonGaps(pillarKey) {
  const interviews = loadAllInterviews();
  const validInterviews = interviews.filter(iv =>
    calculateQualityScore(iv) >= 60
  );

  // 키워드 기반 간단 분류
  const pillarKeywords = {
    reliability: ['SPOF', 'failover', 'redundancy', 'availability'],
    performance: ['CDN', 'cache', 'latency', 'scaling'],
    // ...
  };

  const gaps = [];
  const keywords = pillarKeywords[pillarKey] || [];

  // 각 키워드가 몇 번 언급되었는지 카운트
  keywords.forEach(keyword => {
    const count = validInterviews.filter(iv =>
      iv.summary.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (count > validInterviews.length * 0.3) {
      gaps.push(`${keyword} 관련 이슈 (${count}/${validInterviews.length} 면접에서 언급)`);
    }
  });

  return gaps.slice(0, 3); // 상위 3개만
}

export function enhanceQuestionContext(pillarKey, basePrinciples) {
  const gaps = getCommonGaps(pillarKey);

  return `
${basePrinciples}

---

## 실제 면접에서 자주 발견되는 취약점
${gaps.map(g => `- ${g}`).join('\n')}

## 질문 스타일 권장사항
- "~한 상황이 발생하면 어떻게 되나요?" (구체적 상황 제시)
- "몇 초 안에 복구되나요?" (수치 요구)
- 배치된 컴포넌트만 언급
`;
}
```

**Step 1.2: 질문 생성 API 업데이트 (1일)**
```javascript
// architectureQuestionApi.js

// 이미 import는 되어 있음 (27번줄)
// 실제 사용만 추가:

async function generateSinglePillarQuestion(pillarKey, pillar, context) {
  // ✅ 이 부분 추가 (194번줄)
  const enhancedPrinciples = enhanceQuestionContext(pillarKey, pillar.principles);

  const prompt = `
  당신은 ${pillar.name} 전문 면접관입니다.

  ## 핵심 원칙 + 실제 면접 인사이트
  ${enhancedPrinciples}  // ← 기존 pillar.principles 대신

  ...
  `;

  // 나머지 동일
}
```

**Step 1.3: 테스트 (1일)**
```javascript
// 테스트: 질문이 개선되었는지 확인

// Before:
"장애 대응은 어떻게 하시겠습니까?"

// After (기대):
"주 데이터센터가 다운되면 사용자는 몇 초 안에 서비스를 다시 사용할 수 있나요?"
```

**체크리스트:**
- [ ] interviewInsightsLoader.js 생성
- [ ] loadAllInterviews() 구현
- [ ] getCommonGaps() 구현
- [ ] enhanceQuestionContext() 구현
- [ ] architectureQuestionApi.js 업데이트
- [ ] 실제 질문 생성해서 품질 확인
- [ ] Before/After 비교

**난이도:** ⭐⭐ (보통)

**예상 시간:** 3-5일

---

### Phase 2: 평가 개선 (3-5일)

**목표:** 실제 면접 벤치마크를 평가에 반영

**현재 문제:**
```javascript
// architectureEvaluatorApi.js:240-249
## 점수 산정 기준
- 기본 점수 40점에서 시작
- 구체적 기술명 + 이유 + 트레이드오프 → 80-100점
- 기술명과 기본 이유 → 60-79점
- 키워드만 나열 → 40-59점
```

**이건 이미 괜찮음!**

하지만 **문제/레벨별 조정이 없음:**
```
간단한 To-Do 앱: "RTO 1분" → 충분 (80점)
복잡한 Netflix: "RTO 1분" → 부족 (50점)

같은 답변, 다른 점수여야 함
```

**개선:**

**Step 2.1: 동적 벤치마크 함수 (2일)**
```javascript
// 파일: dynamicBenchmark.js (새로 생성)

export function getDynamicBenchmark(pillarKey, problemComplexity) {
  const baseBenchmark = getAnswerBenchmarks(pillarKey);

  // 문제 복잡도에 따라 조정
  if (problemComplexity === 'simple') {
    return {
      excellent: "기본 개념 이해 + 1가지 구체적 예시",
      good: "기본 개념만 언급",
      needsImprovement: "키워드만 나열",
      poor: "답변 없음 또는 매우 짧음"
    };
  } else if (problemComplexity === 'complex') {
    return {
      excellent: "구체적 기술명 + 트레이드오프 + 테스트/검증 경험 + 실제 수치",
      good: "기술명 + 기본 이유 + 일부 구체적 예시",
      needsImprovement: "키워드만 나열, 추상적",
      poor: "매우 짧고 구체성 없음"
    };
  }
  // ...
}

export function estimateComplexity(problem) {
  let score = 0;

  // 미션 개수
  score += (problem.missions?.length || 0) * 2;

  // 제약조건 개수
  score += (problem.constraints?.length || 0) * 2;

  // 복잡 키워드
  const complexKeywords = ['distributed', 'real-time', 'global', 'million'];
  const scenario = problem.scenario?.toLowerCase() || '';
  complexKeywords.forEach(kw => {
    if (scenario.includes(kw)) score += 3;
  });

  if (score >= 10) return 'complex';
  if (score >= 5) return 'moderate';
  return 'simple';
}
```

**Step 2.2: 평가 API 업데이트 (1일)**
```javascript
// architectureEvaluatorApi.js

export async function evaluateWithMasterAgent(
  problem,
  architectureContext,
  generatedQuestion,
  userExplanation,
  deepDiveQnA
) {
  // ✅ 복잡도 추정
  const complexity = estimateComplexity(problem);

  // ✅ 동적 벤치마크 가져오기
  const benchmarkInfo = categories.map(cat => {
    const pillarKey = categoryToKey[cat];
    const benchmark = getDynamicBenchmark(pillarKey, complexity);

    return `
    ### ${cat} 영역 - ${complexity} 난이도 기준

    **Excellent (80-100점):** ${benchmark.excellent}
    **Good (60-79점):** ${benchmark.good}
    **Needs Improvement (40-59점):** ${benchmark.needsImprovement}
    **Poor (0-39점):** ${benchmark.poor}
    `;
  });

  const prompt = `
  ...

  ## 평가 기준 (${complexity} 난이도)
  ${benchmarkInfo}

  **중요:** 이 문제는 ${complexity} 난이도입니다.
  위 벤치마크에 따라 점수를 부여하세요.
  `;

  // 나머지 동일
}
```

**Step 2.3: 테스트 (1일)**
```javascript
// 같은 답변, 다른 문제

// 간단한 문제
problem: { scenario: "Design a To-Do List" }
answer: "RTO 1분이면 충분합니다"
→ 80점 (Excellent for simple)

// 복잡한 문제
problem: { scenario: "Design Netflix with real-time streaming" }
answer: "RTO 1분이면 충분합니다"
→ 50점 (Needs Improvement for complex)
```

**체크리스트:**
- [ ] dynamicBenchmark.js 생성
- [ ] estimateComplexity() 구현
- [ ] getDynamicBenchmark() 구현
- [ ] architectureEvaluatorApi.js 업데이트
- [ ] 간단한 문제 / 복잡한 문제 테스트
- [ ] 점수 차이 확인

**난이도:** ⭐⭐⭐ (중간-높음)

**예상 시간:** 3-5일

---

### Phase 3: 딥다이브 개선 (2-3일)

**목표:** 실제 면접관의 probing 패턴 적용

**현재 상태:**
```javascript
// generateDeepDiveQuestion() (444-509번줄)
// 이미 getProbingPatterns()를 사용하려고 시도 중 (452번줄)
const probingPatterns = getProbingPatterns(pillarKey);

// 하지만 실제 구현은 없음
```

**작업:**

**Step 3.1: Probing 패턴 정의 (1일)**
```javascript
// interviewInsightsLoader.js에 추가

export function getProbingPatterns(pillarKey) {
  // 실제 면접 데이터 분석 결과 하드코딩
  // (자동 추출은 Phase 4)

  const patterns = {
    reliability: {
      sequence: [
        "접근 방식 파악: '장애 대응을 어떻게 하시겠습니까?'",
        "구체화: '구체적으로 몇 초 안에 복구되나요?'",
        "메커니즘: 'health check는 어떻게 동작하나요?'",
        "테스트 검증: '이 방식을 실제로 테스트해보셨나요?'",
        "엣지 케이스: '양쪽 데이터센터가 동시에 다운되면?'"
      ],
      ahaGoal: "'redundancy 있습니다' → '구체적 failover 시간(30초) + 테스트 경험'"
    },
    performance: {
      sequence: [
        "현재 상태: '캐시를 사용하시겠다고 하셨는데'",
        "구체화: '어디에 캐시를 두시겠어요? (어느 레이어?)'",
        "용량: 'cache 메모리가 꽉 차면 어떻게 되나요?'",
        "정책: 'eviction policy는 무엇을 쓰시겠어요?'",
        "측정: 'cache hit rate이 얼마나 나와야 성공이라고 보시나요?'"
      ],
      ahaGoal: "'캐시 쓰겠습니다' → 'Redis 사용, LRU eviction, 80% hit rate 목표'"
    },
    // ... 나머지 기둥들
  };

  return patterns[pillarKey] || patterns.reliability;
}
```

**Step 3.2: 딥다이브 질문 생성 개선 (1일)**
```javascript
// architectureQuestionApi.js의 generateDeepDiveQuestion()는 이미 getProbingPatterns() 사용 중 (452번줄)

// 확인만 하면 됨:
// 1. getProbingPatterns() 구현 완료?
// 2. prompt에 잘 반영되었는가?
```

**Step 3.3: 테스트 (1일)**
```javascript
// 시나리오 테스트

// 1차 질문
"Redis 메모리가 꽉 차면 어떻게 되나요?"

// 불충분한 답변
"eviction합니다"

// 딥다이브 질문 (기대)
"어떤 eviction policy를 사용하시겠어요? (LRU, LFU, Random?)"

// 2차 답변
"LRU요"

// 딥다이브 질문 (기대)
"LRU를 선택한 이유는 무엇인가요? (access pattern을 고려하셨나요?)"
```

**체크리스트:**
- [ ] getProbingPatterns() 구현
- [ ] 6개 기둥 모두 패턴 정의
- [ ] generateDeepDiveQuestion() 확인
- [ ] 실제 딥다이브 질문 생성 테스트
- [ ] 질문이 순서대로 파고드는지 확인

**난이도:** ⭐⭐ (보통)

**예상 시간:** 2-3일

---

### Phase 4: A/B 테스트 (선택, 1주)

**목표:** 개선 효과 측정

**작업:**
```javascript
// abTestManager.js (새로 생성)

let variant = 'A'; // or 'B'

export function setVariant(v) {
  variant = v;
}

export async function generateQuestions(...args) {
  if (variant === 'A') {
    // 기존 시스템
    return generateQuestionsOld(...args);
  } else {
    // 개선 시스템
    return generateQuestionsNew(...args);
  }
}

export function logMetrics(event, data) {
  // 로컬스토리지나 서버에 기록
  const metrics = JSON.parse(localStorage.getItem('abTestMetrics') || '[]');
  metrics.push({
    timestamp: Date.now(),
    variant,
    event,
    data
  });
  localStorage.setItem('abTestMetrics', JSON.stringify(metrics));
}

export function getReport() {
  const metrics = JSON.parse(localStorage.getItem('abTestMetrics') || '[]');

  const variantA = metrics.filter(m => m.variant === 'A');
  const variantB = metrics.filter(m => m.variant === 'B');

  return {
    A: {
      count: variantA.length,
      avgScore: average(variantA.map(m => m.data.score)),
      avgAnswerLength: average(variantA.map(m => m.data.answerLength))
    },
    B: {
      count: variantB.length,
      avgScore: average(variantB.map(m => m.data.score)),
      avgAnswerLength: average(variantB.map(m => m.data.answerLength))
    },
    improvement: {
      score: ((B.avgScore - A.avgScore) / A.avgScore * 100).toFixed(1) + '%',
      answerLength: ((B.avgAnswerLength - A.avgAnswerLength) / A.avgAnswerLength * 100).toFixed(1) + '%'
    }
  };
}
```

**사용:**
```javascript
// 사용자 50% A, 50% B
const variant = Math.random() < 0.5 ? 'A' : 'B';
setVariant(variant);

// 질문 생성
const questions = await generateQuestions(...);

// 메트릭 기록
logMetrics('questionGenerated', {
  questionCount: questions.length,
  complexity: estimateComplexity(problem)
});

// 답변 받았을 때
logMetrics('answerReceived', {
  answerLength: answer.length,
  score: evaluation.score
});

// 1주 후 리포트 확인
const report = getReport();
console.log('개선율:', report.improvement);
```

**체크리스트:**
- [ ] abTestManager.js 생성
- [ ] Variant A/B 분기 추가
- [ ] 메트릭 수집
- [ ] 1주 후 리포트 생성
- [ ] 통계적 유의성 확인

**난이도:** ⭐⭐⭐ (중간)

**예상 시간:** 1주 (+ 데이터 수집 1주)

---

## ❌ 하지 말아야 할 것

### 1. LangGraph 도입 (지금은)

**이유:**
```
✅ 현재 시스템이 작동함
✅ 선형 워크플로우로 충분함
✅ JS로 충분히 개선 가능

❌ LangGraph는 복잡도만 증가
❌ Python-JS 연동 이슈
❌ 학습 곡선 가파름
```

**언제 고려?**
- 다중 에이전트 협업 필요할 때
- 동적 워크플로우 변경 필요할 때
- 최소 6개월 후

### 2. 에이전트 재설계

**이유:**
```
✅ 현재 구조가 나쁘지 않음 (5개 에이전트)
✅ 각 에이전트 책임 명확

❌ 재설계는 위험 (기존 코드 전부 버림)
❌ 시간 낭비 (3-4주)
```

**대신:**
- 각 에이전트를 **개선**
- 구조는 유지

### 3. 전체 시스템 한번에 바꾸기

**이유:**
```
❌ 디버깅 불가능
❌ 뭐가 문제인지 파악 못 함
❌ 롤백 어려움
```

**대신:**
- Phase별로 점진적 개선
- 각 Phase마다 테스트
- A/B 테스트로 검증

### 4. NLP/ML 모델 직접 구현

**이유:**
```
❌ 시간 많이 걸림 (몇 달)
❌ 전문 지식 필요
❌ 유지보수 어려움
```

**대신:**
- LLM 활용 (Few-shot learning)
- 키워드 매칭으로 시작
- 나중에 필요하면 외부 API

---

## ✅ 당신이 할 수 있는 것

### 지금 당장 (Phase 0-1, 1주)

```
✅ 데이터 검증 (2일)
   - 31개 면접 품질 확인
   - 60점 이상만 필터링

✅ 질문 생성 개선 (3-5일)
   - interviewInsightsLoader.js 생성
   - getCommonGaps() 구현
   - enhanceQuestionContext() 구현
   - 실제 면접 인사이트 반영
```

**난이도:** ⭐⭐
**성공 가능성:** 90%
**효과:** 질문 품질 향상 (체감 가능)

### 2주 후 (Phase 2, 1주)

```
✅ 평가 개선
   - dynamicBenchmark.js 생성
   - 문제 복잡도 추정
   - 동적 벤치마크 적용
```

**난이도:** ⭐⭐⭐
**성공 가능성:** 70%
**효과:** 평가 공정성 향상

### 3주 후 (Phase 3, 1주)

```
✅ 딥다이브 개선
   - getProbingPatterns() 구현
   - 체계적 후속 질문
```

**난이도:** ⭐⭐
**성공 가능성:** 80%
**효과:** 딥다이브 효율성 증가

### 4주 후 (Phase 4, 선택)

```
✅ A/B 테스트
   - 개선 효과 측정
   - 데이터 기반 의사결정
```

**난이도:** ⭐⭐⭐
**성공 가능성:** 60%
**효과:** 정량적 검증

---

## ❌ 당신이 할 수 없는 것 (현재)

### 기술적으로 어려운 것

```
❌ LangGraph 전환 (학습 곡선 가파름)
❌ 자동 NLP 분류 (전문 지식 필요)
❌ 완전 자동화된 면접 시뮬레이터 (몇 달 프로젝트)
❌ 실시간 음성 면접 (기술 스택 전환)
```

### 데이터 부족

```
❌ 통계적으로 유의한 일반화 (31개 → 100+ 필요)
❌ 회사별 맞춤 벤치마크 (Google vs Facebook 구분)
❌ 레벨별 정확한 평가 (Junior vs Senior 데이터 부족)
```

### 시간이 많이 걸리는 것

```
❌ 완벽한 면접관 AI (6개월~1년)
❌ 모든 기둥의 상세 벤치마크 (3개월)
❌ 100+ 면접 데이터 수집 (진행 중)
```

---

## 🎯 현실적 목표 (4주 계획)

### Week 1: Phase 0-1

**목표:** 질문이 눈에 띄게 좋아짐

```
Day 1-2: 데이터 검증
- [ ] interviewDataValidator.js
- [ ] 품질 리포트 확인
- [ ] 22개 데이터 선별

Day 3-5: 질문 개선
- [ ] interviewInsightsLoader.js
- [ ] getCommonGaps() 구현
- [ ] enhanceQuestionContext() 구현
- [ ] architectureQuestionApi.js 업데이트

Day 6-7: 테스트
- [ ] 실제 질문 생성 10회
- [ ] Before/After 비교
- [ ] 체감 개선 확인
```

**성공 기준:**
```
✅ 질문이 구체적으로 변함
   Before: "장애 대응은?"
   After: "주 데이터센터가 다운되면 몇 초 안에 복구되나요?"

✅ 실제 면접 약점 탐색
   "SPOF 분석이 빠진 것 같은데, 어떤 컴포넌트가 단일 장애점이 될 수 있을까요?"
```

### Week 2: Phase 2

**목표:** 평가가 공정해짐

```
Day 8-10: 동적 벤치마크
- [ ] dynamicBenchmark.js
- [ ] estimateComplexity()
- [ ] getDynamicBenchmark()

Day 11-12: 평가 업데이트
- [ ] architectureEvaluatorApi.js 수정
- [ ] 복잡도별 테스트

Day 13-14: 검증
- [ ] 간단한 문제 평가
- [ ] 복잡한 문제 평가
- [ ] 점수 차이 확인
```

**성공 기준:**
```
✅ 같은 답변, 다른 점수
   Simple problem + "RTO 1분" = 80점
   Complex problem + "RTO 1분" = 50점

✅ 복잡도 추정 정확
   "Design To-Do" → simple
   "Design Netflix" → complex
```

### Week 3: Phase 3

**목표:** 딥다이브가 효율적임

```
Day 15-17: Probing 패턴
- [ ] getProbingPatterns() 구현
- [ ] 6개 기둥 패턴 정의

Day 18-19: 딥다이브 개선
- [ ] generateDeepDiveQuestion() 확인
- [ ] 테스트

Day 20-21: 검증
- [ ] 실제 딥다이브 시뮬레이션
- [ ] 질문 순서 확인
```

**성공 기준:**
```
✅ 체계적 탐색
   1차: "어떤 방식?"
   2차: "구체적으로 몇 초?"
   3차: "테스트해봤나요?"

✅ Aha moment 도달
   "redundancy" → "30초 RTO + Chaos Engineering"
```

### Week 4: Phase 4 (선택)

**목표:** 개선 효과 측정

```
Day 22-24: A/B 테스트 설정
- [ ] abTestManager.js
- [ ] Variant A/B 분기
- [ ] 메트릭 수집

Day 25-28: 데이터 수집
- [ ] 실제 사용자 테스트
- [ ] 메트릭 기록

Day 29-30: 분석
- [ ] 리포트 생성
- [ ] 개선율 확인
- [ ] 의사결정
```

**성공 기준:**
```
✅ 정량적 데이터 확보
   Variant A: 평균 점수 68점, 답변 길이 80 토큰
   Variant B: 평균 점수 74점, 답변 길이 95 토큰

✅ 개선율 확인
   점수: +8.8%
   답변 길이: +18.75%
```

---

## 🔧 실제 코드 가이드

### 어디서 시작?

**Step 1: 데이터 검증부터**

```bash
# 파일 생성
frontend/src/features/practice/services/interviewDataValidator.js
```

```javascript
// interviewDataValidator.js

// 1. 모든 면접 JSON 로드
const interviewFiles = import.meta.glob('@/data/interview/*.json', { eager: true });

const interviews = Object.entries(interviewFiles).map(([path, module]) => ({
  filename: path.split('/').pop(),
  title: module.default.title,
  summary: module.default.summary,
  transcript: module.default.transcript,
  url: module.default.url
}));

// 2. 품질 점수 계산
function calculateQualityScore(interview) {
  let score = 0;

  // Title (10점)
  if (interview.title && interview.title.length > 5) {
    score += 10;
  }

  // Summary (30점)
  if (interview.summary) {
    if (interview.summary.length > 100) score += 15;
    if (interview.summary.length > 300) score += 15;
  }

  // Transcript (40점)
  if (interview.transcript) {
    if (interview.transcript.length > 500) score += 20;
    if (interview.transcript.length > 2000) score += 20;
  }

  // 대화 횟수 (20점)
  const exchanges = (interview.transcript?.match(/Interviewer:|Candidate:/g) || []).length;
  if (exchanges > 10) score += 10;
  if (exchanges > 30) score += 10;

  return score;
}

// 3. 검증 실행
export function validateInterviews() {
  const scored = interviews.map(iv => ({
    ...iv,
    qualityScore: calculateQualityScore(iv)
  }));

  scored.sort((a, b) => b.qualityScore - a.qualityScore);

  const excellent = scored.filter(s => s.qualityScore >= 80);
  const good = scored.filter(s => s.qualityScore >= 60 && s.qualityScore < 80);
  const fair = scored.filter(s => s.qualityScore >= 40 && s.qualityScore < 60);
  const poor = scored.filter(s => s.qualityScore < 40);

  console.log('📊 면접 데이터 품질 리포트');
  console.log(`총 ${scored.length}개 면접`);
  console.log(`Excellent (80+): ${excellent.length}개`);
  console.log(`Good (60-79): ${good.length}개`);
  console.log(`Fair (40-59): ${fair.length}개`);
  console.log(`Poor (0-39): ${poor.length}개`);

  console.log('\n✅ 사용할 데이터 (60점 이상):');
  const passed = [...excellent, ...good];
  passed.forEach((iv, idx) => {
    console.log(`${idx + 1}. ${iv.title} (${iv.qualityScore}점)`);
  });

  console.log(`\n⚠️ 제외할 데이터 (60점 미만): ${fair.length + poor.length}개`);

  return {
    total: scored.length,
    passed,
    excellent,
    good,
    fair,
    poor
  };
}

// 4. 테스트 실행
// 개발자 콘솔에서:
// import { validateInterviews } from './interviewDataValidator';
// validateInterviews();
```

**실행:**
```javascript
// Vue 컴포넌트나 개발자 콘솔에서
import { validateInterviews } from '@/features/practice/services/interviewDataValidator';

const report = validateInterviews();
// → 콘솔에 리포트 출력
```

---

## 📊 예상 결과

### Phase 1 완료 후

**질문 품질:**
```
Before:
"장애 대응은 어떻게 하시겠습니까?"
"성능 최적화 방안은 무엇인가요?"

After:
"주 데이터센터가 다운되면 사용자는 몇 초 안에 서비스를 다시 사용할 수 있나요?"
"트래픽이 10배 증가하면 어떤 컴포넌트가 병목이 될까요? CDN을 고려하셨나요?"
```

**체감 개선:** +++

### Phase 2 완료 후

**평가 공정성:**
```
Simple problem (To-Do List):
  Answer: "기본 replication하고 1분 내 복구"
  Score: 75점 (Good) ← 간단한 앱에는 충분

Complex problem (Netflix):
  Answer: "기본 replication하고 1분 내 복구"
  Score: 45점 (Needs Improvement) ← 복잡한 앱에는 부족
```

**체감 개선:** ++

### Phase 3 완료 후

**딥다이브 효율:**
```
1차: "Redis 메모리가 꽉 차면 어떻게 되나요?"
답변: "eviction 합니다"

2차: "어떤 eviction policy를 쓰시겠어요?"
답변: "LRU요"

3차: "LRU를 선택한 이유는? 이 시스템의 access pattern을 고려하셨나요?"
답변: "최근 데이터가 자주 쓰이니까요. 실제로..."

→ Aha moment 도달!
```

**체감 개선:** ++

### Phase 4 완료 후

**정량적 검증:**
```
A/B 테스트 결과 (2주, 각 50회)

Variant A (기존):
  평균 점수: 68.5점
  평균 답변 길이: 82 토큰
  딥다이브 성공률: 35%

Variant B (개선):
  평균 점수: 74.2점
  평균 답변 길이: 98 토큰
  딥다이브 성공률: 52%

개선율:
  점수: +8.3%
  답변 길이: +19.5%
  딥다이브 성공률: +17%p

결론: 개선 시스템이 통계적으로 유의미하게 더 좋음
```

---

## 🚨 위험 요소

### 1. 데이터 품질

**위험:**
```
31개 → 22개로 줄어들면
→ 인사이트가 부족할 수 있음
```

**대응:**
```
✅ 품질 > 수량
✅ 22개로 시작, 나중에 추가
✅ 최소 기준: 10개 이상 면접에서 나타나는 패턴만 사용
```

### 2. 키워드 매칭 한계

**위험:**
```
"CDN" 키워드 → performance?
하지만 "CDN 비용" 맥락 → cost?

→ 잘못된 분류
```

**대응:**
```
✅ Phase 1: 간단한 키워드 매칭으로 시작
✅ Phase 2-3: 잘 작동하면 유지
✅ Phase 4 (나중에): LLM 분류 고려
```

### 3. 복잡도 추정 부정확

**위험:**
```
estimateComplexity()가 틀릴 수 있음
→ 잘못된 벤치마크 적용
```

**대응:**
```
✅ 간단한 휴리스틱으로 시작
✅ A/B 테스트로 검증
✅ 사용자 피드백으로 조정
```

---

## ✅ 체크리스트

### Phase 0: 데이터 검증 (2일)
- [ ] `interviewDataValidator.js` 생성
- [ ] `calculateQualityScore()` 구현
- [ ] `validateInterviews()` 실행
- [ ] 품질 리포트 확인
- [ ] 60점 이상 데이터 확보 (목표: 20개 이상)

### Phase 1: 질문 개선 (3-5일)
- [ ] `interviewInsightsLoader.js` 생성
- [ ] `loadAllInterviews()` 구현
- [ ] `getCommonGaps()` 구현 (키워드 기반)
- [ ] `enhanceQuestionContext()` 구현
- [ ] `architectureQuestionApi.js` 업데이트 (194번줄)
- [ ] 실제 질문 생성 테스트 (10회)
- [ ] Before/After 비교

### Phase 2: 평가 개선 (3-5일)
- [ ] `dynamicBenchmark.js` 생성
- [ ] `estimateComplexity()` 구현
- [ ] `getDynamicBenchmark()` 구현
- [ ] `getAnswerBenchmarks()` 구현
- [ ] `architectureEvaluatorApi.js` 업데이트
- [ ] 간단한 문제 테스트
- [ ] 복잡한 문제 테스트
- [ ] 점수 차이 확인

### Phase 3: 딥다이브 개선 (2-3일)
- [ ] `getProbingPatterns()` 구현
- [ ] 6개 기둥 패턴 정의
- [ ] `generateDeepDiveQuestion()` 확인 (이미 구현됨)
- [ ] 실제 딥다이브 시뮬레이션
- [ ] 질문 순서 확인

### Phase 4: A/B 테스트 (선택, 1-2주)
- [ ] `abTestManager.js` 생성
- [ ] Variant A/B 분기 추가
- [ ] 메트릭 수집 구현
- [ ] 1-2주 데이터 수집
- [ ] 리포트 생성
- [ ] 통계적 유의성 확인
- [ ] 의사결정 (전면 배포 or 추가 개선)

---

## 🎓 학습 자료

### 꼭 알아야 할 것

**1. Vite의 import.meta.glob**
```javascript
// JSON 파일들을 동적으로 로드
const files = import.meta.glob('@/data/interview/*.json', { eager: true });
```
참고: https://vitejs.dev/guide/features.html#glob-import

**2. LLM Prompt Engineering**
```
질문 생성 프롬프트 작성법:
- 구체적 예시 제공 (Few-shot)
- 명확한 출력 형식 (JSON)
- 제약 사항 명시
```

**3. 통계 기초**
```
A/B 테스트:
- 샘플 크기 (최소 30회)
- 유의성 검정 (p-value < 0.05)
- 개선율 계산
```

### 알면 좋은 것

- LangGraph (나중에)
- NLP 기초 (나중에)
- 시스템 디자인 면접 패턴

---

## 🎯 최종 요약

### 당신이 지금 해야 할 것

```
1️⃣ Phase 0: 데이터 검증 (2일)
   → 31개 면접 중 20개 이상 확보

2️⃣ Phase 1: 질문 개선 (3-5일)
   → 실제 면접 인사이트 반영

3️⃣ Phase 2: 평가 개선 (3-5일)
   → 동적 벤치마크 적용

4️⃣ Phase 3: 딥다이브 개선 (2-3일)
   → Probing 패턴 적용

총 소요 시간: 2-3주
난이도: ⭐⭐⭐ (중간)
성공 가능성: 70-80%
```

### 당신이 하지 말아야 할 것

```
❌ LangGraph 도입 (지금은)
❌ 에이전트 재설계
❌ 전체 시스템 한번에 바꾸기
❌ NLP/ML 모델 직접 구현
```

### 성공 기준

```
✅ 질문이 구체적으로 변함 (체감)
✅ 평가가 공정해짐 (복잡도별 차등)
✅ 딥다이브가 체계적임 (순차 탐색)
✅ 측정 가능한 개선 (+10% 이상)
```

### 다음 단계

```
4주 후:
- Phase 1-3 완료
- 실제 사용해보기
- 피드백 수집

2개월 후:
- Phase 4 완료 (A/B 테스트)
- 데이터 기반 개선
- 추가 면접 데이터 수집

6개월 후:
- LangGraph 고려 (필요시)
- NLP 분류 고려
- 완전 자동화 면접 시뮬레이터
```

---

**지금 당장 시작하세요: `interviewDataValidator.js` 파일 생성부터!**

**문서 작성일:** 2026-02-09
**마지막 업데이트:** 2026-02-09
**작성자:** Architecture Practice Improvement Team
**다음 검토:** Phase 1 완료 후
