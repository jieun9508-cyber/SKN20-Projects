# Interview Transcript 데이터 기반 프로젝트 개선 실행 계획

> 단계별로 하나씩 실행. 각 단계는 독립적으로 완료 및 테스트 가능.

---

## 현재 시스템 흐름 (As-Is)

```
[1] 사용자가 아키텍처 배치 (ArchitectureCanvas)
      ↓
[2] "평가 시작" 클릭 → 설명 작성 (DeepDiveModal Phase 1)
      ↓
[3] 6대 기둥 질문 생성 (architectureApiFastTest.js)
    ├─ 신뢰성.txt에서 원칙 추출 → LLM → 질문 1
    ├─ 최적화.txt에서 원칙 추출 → LLM → 질문 2
    ├─ ... (6개 병렬)
    └─ 실패 시 FALLBACK_QUESTIONS 사용
      ↓
[4] 사용자가 6개 질문에 순차 답변 (DeepDiveModal Phase 2)
      ↓
[5] Master Agent가 답변 평가 (architectureApiMasterAgent.js)
      ↓
[6] 결과 표시 (EvaluationResultScreen.vue)
```

---

## Phase 1: 인터뷰 데이터 전처리 및 구조화

### 목표
비구조적 대화 텍스트 → **구조화된 JSON 데이터**로 변환

### 변경 대상
- 새 파일 생성: `frontend/src/data/interview/structured/`

### 작업 내용

interview txt 파일 6개에서 다음을 추출하여 JSON으로 구조화:

```
frontend/src/data/interview/structured/
├── interviewQuestions.json      ← 면접관 질문 패턴
├── evaluationRubric.json        ← 레벨별 평가 기준
├── commonMistakes.json          ← 실수 패턴 + 교정
├── corePuzzles.json             ← 주제별 핵심 설계 문제
└── interviewTips.json           ← 면접 전략/팁
```

#### interviewQuestions.json 예시
```json
{
  "scenario_based": [
    {
      "source": "facebook_events",
      "pillar": "reliability",
      "question": "4th of July에 1000만 이벤트가 동시 진행되는데, 배치 잡으로 리마인더를 정시에 보낼 수 있나요?",
      "context": "대규모 이벤트 알림 시스템",
      "follow_ups": [
        "그 잡의 시작 시간은?",
        "트래픽이 극적으로 다른 상황에서 같은 주기로 처리 가능?"
      ]
    }
  ],
  "tradeoff": [
    {
      "source": "design_live_comment",
      "question": "Push와 Pull 중 왜 Push를 선택했나요? Pull의 장단점은?",
      "options": ["Push (WebSocket)", "Pull (Long Polling)"],
      "key_insight": "레이턴시 100ms 이하 요구 → Pull은 대역폭 낭비"
    }
  ],
  "deep_dive": [
    {
      "source": "video_upload",
      "question": "모든 워커가 죽으면 큐에 메시지가 계속 쌓이는데, 어떻게 감지하나요?",
      "expected_answer": "코디네이터/모니터링 시스템으로 워커 헬스체크"
    }
  ]
}
```

#### evaluationRubric.json 예시
```json
{
  "levels": {
    "L4": {
      "description": "기본적으로 올바르게 설명할 수 있는가",
      "criteria": [
        "주요 컴포넌트를 올바르게 배치",
        "데이터 모델링 기본 수행",
        "가이던스를 받아 방향 조정 가능"
      ]
    },
    "L5": {
      "description": "트레이드오프를 명시적으로 논의하는가",
      "criteria": [
        "설계 결정마다 최소 2개 대안 제시",
        "각 대안의 장단점 명시",
        "선택 근거를 논리적으로 설명",
        "NFR을 스스로 도출"
      ]
    },
    "L6": {
      "description": "트레이드오프를 NFR 수치에 연결하는가",
      "criteria": [
        "설계 결정이 요구사항 수치에 의해 근거",
        "NFR의 함의(implication)를 설명",
        "운영 부하, 모니터링, 메트릭 논의",
        "의존 서비스 SLA 고려"
      ]
    }
  },
  "scoring_axes": [
    {
      "axis": "tradeoff_discussion",
      "name": "트레이드오프 논의",
      "weight": 25,
      "L5_requirement": "최소 2개 대안 + pros/cons",
      "L6_requirement": "선택 근거를 NFR 수치에 연결"
    },
    {
      "axis": "core_puzzle",
      "name": "핵심 문제 파악",
      "weight": 20,
      "description": "이 설계에서 가장 중요한 기술적 문제를 파악했는가"
    },
    {
      "axis": "requirements_gathering",
      "name": "요구사항 수집",
      "weight": 15,
      "description": "FR을 사용자 관점으로, NFR을 함의와 함께 도출했는가"
    },
    {
      "axis": "data_modeling",
      "name": "데이터 모델링",
      "weight": 15,
      "description": "테이블 스키마, 인덱싱, 파티셔닝 전략이 있는가"
    },
    {
      "axis": "failure_handling",
      "name": "장애 대응",
      "weight": 15,
      "description": "장애 시나리오를 선제적으로 언급했는가"
    },
    {
      "axis": "communication",
      "name": "커뮤니케이션",
      "weight": 10,
      "description": "힌트 수용, 시간 배분, 구조적 설명"
    }
  ]
}
```

### 완료 기준
- [ ] 6개 대본에서 면접관 질문 추출 완료
- [ ] 레벨별 평가 루브릭 JSON 구축 완료
- [ ] 실수 패턴 JSON 구축 완료
- [ ] 모든 JSON이 import 가능한 상태

---

## Phase 2: 질문 생성 품질 강화

### 목표
`architectureApiFastTest.js`의 프롬프트에 **실제 면접관 질문 패턴**을 few-shot으로 추가

### 변경 대상
- `frontend/src/features/practice/services/architectureApiFastTest.js`
  - `generateSinglePillarQuestion()` 함수의 프롬프트 수정
- `frontend/src/data/interview/structured/interviewQuestions.json` (Phase 1에서 생성)

### 변경 전 (현재)
```javascript
const prompt = `당신은 **${pillar.name}** 전문 아키텍트입니다.
...
## ${pillar.name} 핵심 원칙
${pillar.principles}

## 규칙
- "~한 상황이 발생하면" 형태의 상황 기반 질문
...`;
```

### 변경 후
```javascript
const prompt = `당신은 **${pillar.name}** 전문 아키텍트입니다.
...
## ${pillar.name} 핵심 원칙
${pillar.principles}

## 실제 FAANG 면접관의 질문 예시 (이 수준과 스타일로 생성하세요)
${getExampleQuestions(pillarKey)}

## 규칙
- "~한 상황이 발생하면" 형태의 상황 기반 질문
- 아래 예시처럼 구체적 숫자와 상황을 포함
- 트레이드오프를 유도하는 질문 우선
...`;
```

### 새로 추가할 함수
```javascript
import interviewQuestions from '@/data/interview/structured/interviewQuestions.json';

function getExampleQuestions(pillarKey) {
  // pillarKey에 해당하는 실제 면접관 질문 2~3개를 반환
  const examples = interviewQuestions.scenario_based
    .filter(q => q.pillar === pillarKey)
    .slice(0, 3);
  return examples.map((q, i) => `예시${i+1}: "${q.question}"`).join('\n');
}
```

### 완료 기준
- [ ] 각 기둥별 최소 2개의 실제 면접관 질문이 few-shot으로 포함
- [ ] 생성되는 질문이 기존 대비 더 구체적/상황적인지 비교 테스트
- [ ] FALLBACK_QUESTIONS도 면접 대본 기반으로 업그레이드

---

## Phase 3: 평가 루브릭 강화

### 목표
`architectureApiMasterAgent.js`의 평가 프롬프트에 **FAANG 면접관의 실제 평가 구조**를 이식

### 변경 대상
- `frontend/src/features/practice/services/architectureApiMasterAgent.js`
  - `evaluateWithMasterAgent()` 함수의 프롬프트 수정
- `frontend/src/data/interview/structured/evaluationRubric.json` (Phase 1에서 생성)

### 핵심 변경: 평가 프롬프트에 루브릭 주입

```javascript
import rubric from '@/data/interview/structured/evaluationRubric.json';

// 평가 프롬프트에 추가할 섹션:
const rubricPrompt = `
## FAANG 면접관 평가 기준 (실제 면접관 루브릭 기반)

### 평가 축 (${rubric.scoring_axes.length}개)
${rubric.scoring_axes.map(axis =>
  `- **${axis.name}** (${axis.weight}%): ${axis.description}`
).join('\n')}

### 레벨별 기대치
- L4: ${rubric.levels.L4.description}
- L5: ${rubric.levels.L5.description}
- L6: ${rubric.levels.L6.description}

### Good/Bad 답변 예시

[트레이드오프 - Good]
"WebSocket과 Long Polling을 비교했습니다. 레이턴시 100ms 요구사항 때문에
 Pull은 대역폭 낭비가 심해 Push(WebSocket)를 선택합니다."

[트레이드오프 - Bad]
"WebSocket을 사용합니다." (대안 미제시, 이유 미설명)

### 출력에 추가할 필드
- "estimated_level": "L4" | "L5" | "L6"
- "axis_scores": { "tradeoff_discussion": 1~5, ... }
`;
```

### 변경되는 평가 결과 구조
```javascript
// 기존
{ score: 75, feedback: "...", modelAnswer: "..." }

// 개선
{
  score: 75,
  feedback: "...",
  modelAnswer: "...",
  estimatedLevel: "L5",      // 새로 추가
  axisScores: {               // 새로 추가
    tradeoffDiscussion: 4,
    corePuzzle: 3,
    requirementsGathering: 3,
    dataModeling: 2,
    failureHandling: 3,
    communication: 4
  }
}
```

### UI 반영 (EvaluationResultScreen.vue)
- 기존 단순 점수 → **레벨 뱃지** (L4/L5/L6) 추가 표시
- 6개 평가 축별 레이더 차트 또는 바 차트 추가

### 완료 기준
- [ ] 평가 프롬프트에 루브릭 주입 완료
- [ ] 평가 결과에 estimatedLevel, axisScores 포함
- [ ] EvaluationResultScreen에 레벨 뱃지 표시
- [ ] Good/Bad 예시가 평가 정확도를 높이는지 테스트

---

## Phase 4: 실수 감지 + 힌트 시스템

### 목표
사용자의 답변에서 **반복적 실수 패턴을 감지**하고, **단계적 힌트를 제공**

### 변경 대상
- `frontend/src/data/interview/structured/commonMistakes.json` (Phase 1에서 생성)
- `frontend/src/features/practice/composables/useEvaluation.js`
  - 답변 제출 시 실수 감지 로직 추가
- `frontend/src/features/practice/components/DeepDiveModal.vue`
  - 힌트 표시 UI 추가

### commonMistakes.json 구조
```json
[
  {
    "id": "no_alternative",
    "pattern": "대안 없이 단일 기술 선택",
    "detection_keywords": ["사용하겠습니다", "선택합니다"],
    "detection_missing": ["대안", "비교", "대신", "반면", "장단점", "트레이드오프"],
    "hints": [
      { "level": 1, "text": "다른 방법은 없을까요?" },
      { "level": 2, "text": "이 기술 대신 사용할 수 있는 대안과 비교해보세요" },
      { "level": 3, "text": "예: SQL vs NoSQL, Push vs Pull - 각각의 장단점을 설명하고 선택 근거를 제시하세요" }
    ]
  },
  {
    "id": "no_failure_scenario",
    "pattern": "장애 시나리오 미언급",
    "detection_missing": ["실패", "장애", "죽으면", "다운", "에러", "복구", "재시도"],
    "hints": [
      { "level": 1, "text": "이 컴포넌트에 문제가 생기면 어떻게 되나요?" },
      { "level": 2, "text": "메시지 큐가 죽거나, 워커가 전부 죽는 상황을 고려해보세요" },
      { "level": 3, "text": "재시도 메커니즘, DLQ(Dead Letter Queue), 모니터링 시스템을 논의하세요" }
    ]
  }
]
```

### 동작 흐름
```
사용자가 질문에 답변 작성 중...
  ↓
[답변 제출 전] 실시간 또는 제출 시점에 패턴 감지
  ↓
패턴 감지됨: "no_alternative" (대안 미제시)
  ↓
힌트 Level 1 표시: "다른 방법은 없을까요?"
  ↓
사용자가 여전히 대안 미제시 → Level 2 힌트
  ↓
최종 제출 → 힌트 사용 여부를 평가에 반영
```

### DeepDiveModal.vue 변경
- 답변 입력 영역 하단에 **힌트 카드** 영역 추가
- 힌트는 접이식(collapsible)으로 "힌트 보기" 버튼 클릭 시 노출
- 힌트 사용 횟수를 추적하여 평가에 반영 (힌트 많이 사용 = 감점 요소)

### 완료 기준
- [ ] 최소 5개 실수 패턴 감지 로직 구현
- [ ] 각 패턴에 3단계 힌트 구현
- [ ] DeepDiveModal에 힌트 UI 통합
- [ ] 힌트 사용 여부가 평가에 반영

---

## Phase 5: Core Puzzle 중심 질문 체계

### 목표
각 시나리오의 **핵심 설계 문제(Core Puzzle)**를 정의하고, 이를 중심으로 질문 생성

### 변경 대상
- `frontend/src/data/architecture.json`
  - 각 문제에 `corePuzzle` 필드 추가
- `frontend/src/data/interview/structured/corePuzzles.json` (Phase 1에서 생성)
- `frontend/src/features/practice/services/architectureApiFastTest.js`
  - Core Puzzle 기반 질문 우선 생성

### architecture.json 변경
```json
{
  "problem_id": "jr_001_url_shortener",
  "title": "축제 홍보용 단축 URL 생성기",
  "corePuzzle": {
    "description": "초당 수천 건의 읽기 요청에서 DB 부하를 최소화하면서 빠른 리다이렉션을 보장하는 방법",
    "tradeoffs": [
      {
        "optionA": "DB 직접 조회",
        "optionB": "Redis 캐시 + DB",
        "key_factor": "읽기 비율이 쓰기의 100배 이상 → 캐시 필수"
      }
    ],
    "mustDiscuss": true
  }
}
```

### 질문 생성 로직 변경
```
기존: 6개 기둥 각각 독립적으로 1개씩 질문
개선: Core Puzzle 관련 질문 1개 + 나머지 5개 기둥 질문

질문 1 (Core Puzzle): "이 시스템에서 가장 중요한 설계 결정은 무엇인가요?"
질문 2~6: 기존 6대 기둥 중 Core Puzzle과 겹치지 않는 5개
```

### 완료 기준
- [ ] 모든 architecture.json 문제에 corePuzzle 추가
- [ ] Core Puzzle 질문이 항상 첫 번째로 생성
- [ ] 평가에서 Core Puzzle 답변에 가중치 적용

---

## Phase 6: 면접 전략 팁 시스템

### 목표
연습 과정 전/중/후에 **상황에 맞는 면접 전략 팁** 제공

### 변경 대상
- `frontend/src/data/interview/structured/interviewTips.json` (Phase 1에서 생성)
- `frontend/src/features/practice/components/DeepDiveModal.vue`
  - 각 Phase에 맞는 팁 표시
- `frontend/src/features/practice/components/EvaluationResultScreen.vue`
  - 결과 화면에 개선 팁 표시

### interviewTips.json 구조
```json
{
  "explanation_phase": [
    {
      "trigger": "always",
      "tip": "API가 아닌 '사용자 스토리'로 먼저 설명하세요. '사용자가 앱을 열면 → 일정이 보이고 → 만들기를 누르면...'",
      "source": "calender.txt 면접관"
    },
    {
      "trigger": "always",
      "tip": "NFR을 직접 도출하세요: reliability? scalability? latency? security? durability?",
      "source": "design_live_comment.txt 면접관"
    }
  ],
  "questioning_phase": [
    {
      "trigger": "question_category == 'tradeoff'",
      "tip": "최소 2개 대안을 제시하고 각각의 장단점을 설명한 뒤 선택 근거를 말하세요",
      "source": "design_live_comment.txt 면접관 - L5 기준"
    }
  ],
  "result_phase": [
    {
      "trigger": "score < 60",
      "tip": "Core Puzzle(핵심 설계 문제)을 먼저 파악하세요. 나머지 API/스키마는 부차적입니다.",
      "source": "design_live_comment.txt - Core Puzzle 개념"
    },
    {
      "trigger": "axisScores.tradeoff < 3",
      "tip": "설계 결정에 대안을 항상 제시하세요. 틀려도 괜찮습니다. 사고 과정이 중요합니다.",
      "source": "photo_sharing.txt 면접관"
    }
  ]
}
```

### 완료 기준
- [ ] 설명 Phase에 2개 이상 전략 팁 표시
- [ ] 질문 답변 Phase에 상황별 팁 표시
- [ ] 결과 화면에 점수 기반 맞춤 팁 표시

---

## Phase 7: 꼬리질문 (Follow-up) 체인

### 목표
1회성 질문 6개 → **답변에 따른 꼬리질문** 추가로 심층적 면접 경험

### 변경 대상
- `frontend/src/features/practice/services/architectureApiFastTest.js`
  - 새 함수: `generateFollowUpToAnswer(question, answer, pillar)`
- `frontend/src/features/practice/composables/useEvaluation.js`
  - 답변 제출 후 꼬리질문 생성 로직
- `frontend/src/features/practice/components/DeepDiveModal.vue`
  - 꼬리질문 UI (기존 질문 아래에 추가)

### 동작 흐름
```
질문 1: "배치 잡으로 리마인더를 처리하시겠습니까?"
  → 사용자 답변: "네, 5분마다 배치 잡을 돌리겠습니다"
    → [꼬리질문 생성] "트래픽이 10배 급증하는 날에도 같은 5분 주기로 처리 가능한가요?"
      → 사용자 답변: "오토스케일링으로..."
        → 다음 기둥 질문으로 이동

(꼬리질문은 기둥당 최대 1개, 총 질문 수: 6~12개)
```

### 프롬프트 구조
```javascript
async function generateFollowUp(originalQuestion, userAnswer, pillarKey) {
  const prompt = `당신은 ${pillar.name} 면접관입니다.

질문: "${originalQuestion}"
지원자 답변: "${userAnswer}"

지원자의 답변에서 부족하거나 모호한 부분을 짚는 꼬리질문 1개를 생성하세요.
답변이 충분히 깊다면 "SKIP"을 반환하세요.

## 실제 면접관의 꼬리질문 예시
${getFollowUpExamples(pillarKey)}

JSON: { "followUp": "질문" | "SKIP" }`;
}
```

### 완료 기준
- [ ] 꼬리질문 생성 함수 구현
- [ ] DeepDiveModal에서 꼬리질문 표시/답변 수집
- [ ] 꼬리질문 답변도 평가에 포함
- [ ] 꼬리질문이 "SKIP"되면 자연스럽게 다음 기둥으로 이동

---

## 실행 순서 요약

```
Phase 1: 데이터 전처리 ─────────────────── [기반 작업, 모든 Phase의 토대]
   ↓
Phase 2: 질문 품질 강화 ─────────────────── [가장 빠른 체감 효과]
   ↓
Phase 3: 평가 루브릭 강화 ───────────────── [평가 품질 핵심 개선]
   ↓
Phase 4: 실수 감지 + 힌트 ──────────────── [대화형 코칭의 시작]
   ↓
Phase 5: Core Puzzle 체계 ──────────────── [질문 구조의 근본적 개선]
   ↓
Phase 6: 면접 전략 팁 ──────────────────── [사용자 경험 강화]
   ↓
Phase 7: 꼬리질문 체인 ─────────────────── [면접 시뮬레이션 근접]
```

### 각 Phase별 예상 변경 규모

| Phase | 새 파일 | 수정 파일 | 핵심 변경 |
|-------|--------|----------|----------|
| 1 | 5개 JSON | 0 | 데이터 구조화 |
| 2 | 0 | 1 (architectureApiFastTest.js) | 프롬프트 수정 + import 추가 |
| 3 | 0 | 2 (masterAgent + EvaluationResultScreen) | 프롬프트 수정 + UI 추가 |
| 4 | 0 | 3 (useEvaluation + DeepDiveModal + JSON) | 감지 로직 + UI |
| 5 | 0 | 2 (architecture.json + apiFastTest) | 데이터 + 로직 |
| 6 | 0 | 3 (DeepDiveModal + ResultScreen + JSON) | UI 팁 표시 |
| 7 | 0 | 3 (apiFastTest + useEvaluation + DeepDiveModal) | 새 LLM 호출 + UI |

---

## 다음 단계

**"Phase 1 실행해줘"** 라고 말씀하시면 데이터 전처리를 시작합니다.
각 Phase 완료 후 테스트 → 다음 Phase로 진행합니다.
