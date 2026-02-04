# PSEUDOCODE Deep Dive 평가 시스템 구현 가이드

## 📋 개요

SystemArchitecture Practice의 Deep Dive 평가 방식을 Pseudocode Practice에 적용한 구현입니다.

### 변경 사항 요약

**AS-IS (기존)**
- 평가 모델: GPT-4o-mini (단일성 분석)
- 평가 프로세스: 제출 → 5단 역량 분석 → 결과
- 활용 데이터: 의사코드(Text) + 문제 정의

**TO-BE (변경)**
- 평가 모델: GPT-4o-mini (면접관 페르소나)
- 평가 프로세스: 제출 → [AI 역질문 (Deep Dive)] → 답변 → 종합 결과
- 활용 데이터: 의사코드 + 사용자의 방어 논리(Answer)

---

## 🏗️ 파일 구조

```
frontend/src/features/practice/
├── services/
│   ├── pseudocodeApi.js              # API 통신 (새로 생성)
│   └── architectureApiFastTest.js    # 참고용
│
├── composables/
│   ├── usePseudocodeEvaluation.js    # 평가 로직 (새로 생성)
│   └── useEvaluation.js              # 참고용
│
├── components/
│   ├── PseudocodeDeepDiveModal.vue   # Deep Dive 모달 (새로 생성)
│   ├── PseudocodeResultScreen.vue    # 결과 화면 (새로 생성)
│   └── DeepDiveModal.vue             # 참고용
│
└── PseudocodePractice.vue            # 메인 컴포넌트 (새로 생성)
```

---

## 🚀 구현된 기능

### 1. API 서비스 (`pseudocodeApi.js`)

#### 주요 함수:

**`generatePseudocodeDeepDiveQuestions(problem, pseudocode)`**
- 의사코드를 분석하여 3가지 카테고리의 질문 생성:
  1. **논리 이해도**: 알고리즘 설계 의도 확인
  2. **예외 처리**: 엣지 케이스 대응 방법
  3. **최적화**: 시간/공간 복잡도 및 개선 방안

**`evaluatePseudocode(problem, pseudocode, deepDiveQnA)`**
- 50점(의사코드) + 50점(면접 답변) = 100점 만점 평가
- 각 질문별 모범 답안과 비교 분석
- 상세한 피드백 및 학습 제안 제공

### 2. Composable (`usePseudocodeEvaluation.js`)

SystemArchitecture의 `useEvaluation.js` 패턴을 따르는 상태 관리:

```javascript
const {
  // 평가 상태
  isEvaluating,
  evaluationResult,
  showResultScreen,
  
  // Deep Dive 상태
  isDeepDiveModalActive,
  isGeneratingDeepDive,
  deepDiveQuestion,
  deepDiveQuestions,
  currentQuestionIndex,
  
  // 메서드
  skipDeepDive,
  submitDeepDiveAnswer,
  startEvaluation,
  executeEvaluation,
  handleRetry
} = usePseudocodeEvaluation();
```

### 3. UI 컴포넌트

#### **PseudocodeDeepDiveModal.vue**
- 의사코드를 좌측에 표시
- 면접관의 질문과 답변 입력 UI
- 진행 상황 표시 (1/3, 2/3, 3/3)

#### **PseudocodeResultScreen.vue**
- 총점 및 등급 표시 (Excellent/Good/Needs Improvement/Poor)
- 의사코드 평가 세부사항 (논리/구조/완성도)
- 면접 답변 분석 (각 질문별 점수 및 피드백)
- 학습 제안 및 개선 방향

---

## 💻 사용 예시

### 기본 사용법

```vue
<template>
  <PseudocodePractice />
</template>

<script>
import PseudocodePractice from '@/features/practice/PseudocodePractice.vue';

export default {
  components: { PseudocodePractice }
};
</script>
```

### 커스텀 통합

```vue
<script setup>
import { ref } from 'vue';
import { usePseudocodeEvaluation } from './composables/usePseudocodeEvaluation';
import PseudocodeDeepDiveModal from './components/PseudocodeDeepDiveModal.vue';
import PseudocodeResultScreen from './components/PseudocodeResultScreen.vue';

const currentProblem = ref({ /* 문제 데이터 */ });
const userPseudocode = ref('');

const {
  isDeepDiveModalActive,
  isGeneratingDeepDive,
  deepDiveQuestion,
  deepDiveQuestions,
  currentQuestionIndex,
  evaluationResult,
  showResultScreen,
  startEvaluation,
  skipDeepDive,
  submitDeepDiveAnswer,
  executeEvaluation
} = usePseudocodeEvaluation();

// 제출 핸들러
const handleSubmit = async () => {
  await startEvaluation(currentProblem.value, userPseudocode.value);
};

// Deep Dive 답변 제출
const handleDeepDiveSubmit = async (answer) => {
  const finished = await submitDeepDiveAnswer(answer);
  if (finished) {
    await executeEvaluation(currentProblem.value, userPseudocode.value);
  }
};
</script>
```

---

## 🎯 평가 프로세스 흐름

```
1. 사용자가 의사코드 작성 및 제출
   ↓
2. startEvaluation() 호출
   ↓
3. AI가 의사코드 분석하여 3개 질문 생성
   ↓
4. Deep Dive Modal 표시 (질문 1/3)
   ↓
5. 사용자 답변 입력 (또는 건너뛰기)
   ↓
6. 질문 2/3, 3/3 순차 진행
   ↓
7. 모든 질문 완료 후 executeEvaluation() 자동 호출
   ↓
8. 종합 평가 결과 화면 표시
```

---

## 📊 평가 기준

### 의사코드 평가 (50점)
- **논리 정확성 (25점)**: 알고리즘이 문제를 올바르게 해결하는가?
- **구조 명확성 (15점)**: 단계별 흐름이 명확하고 이해하기 쉬운가?
- **완성도 (10점)**: 필요한 단계들이 모두 포함되어 있는가?

### 면접 답변 평가 (50점)
- **답변 없음/의미 없음**: 최대 10점
- **짧지만 타당함 (30~100자)**: 최대 30점
- **개념은 맞으나 설명 부족**: 30~40점
- **구체적 설명 + 기술 용어**: 40~45점
- **구체적 설명 + 트레이드오프 명시**: 45~50점

---

## ⚙️ 환경 설정

### 필수 환경 변수

`.env` 파일에 OpenAI API 키 추가:

```env
VITE_OPENAI_API_KEY=your-api-key-here
```

### 의존성

```json
{
  "dependencies": {
    "vue": "^3.x",
    "openai": "^4.x"
  }
}
```

---

## 🔄 기존 시스템과의 차이점

| 항목 | SystemArchitecture | Pseudocode |
|------|-------------------|------------|
| 평가 대상 | 아키텍처 다이어그램 | 의사코드 텍스트 |
| 질문 카테고리 | 설계 의도/확장성/장애 대응 | 논리 이해/예외 처리/최적화 |
| 시각화 | Mermaid 다이어그램 | 코드 텍스트 |
| 점수 배분 | 아키텍처 50 + 면접 50 | 의사코드 50 + 면접 50 |

---

## 🐛 트러블슈팅

### Q1. Deep Dive 모달이 열리지 않아요
**A**: `startEvaluation()`이 제대로 호출되었는지 확인하세요. 콘솔에서 에러 메시지를 확인하세요.

### Q2. 평가 결과가 표시되지 않아요
**A**: `executeEvaluation()`이 모든 질문 완료 후 호출되는지 확인하세요. `moveToNextQuestion()`이 `true`를 반환할 때 호출되어야 합니다.

### Q3. API 호출이 실패해요
**A**: 
1. `.env` 파일의 `VITE_OPENAI_API_KEY` 확인
2. API 키의 유효성 및 잔액 확인
3. CORS 설정 확인

### Q4. 모범 답안과 비교가 제대로 안 돼요
**A**: 문제 데이터에 `pseudocode` 또는 `solution_code` 필드가 있는지 확인하세요.

---

## 🎨 커스터마이징

### 질문 카테고리 변경

`pseudocodeApi.js`의 `generatePseudocodeDeepDiveQuestions()` 함수에서 수정:

```javascript
1. **논리 이해도** → 원하는 카테고리
2. **예외 처리** → 원하는 카테고리
3. **최적화** → 원하는 카테고리
```

### 평가 기준 조정

`pseudocodeApi.js`의 `evaluatePseudocode()` 함수의 프롬프트에서 수정:

```javascript
### Pseudocode Score (50점 만점)
- **논리 정확성 (25점)**: ... ← 여기를 수정
```

### UI 테마 변경

각 컴포넌트의 `<style>` 섹션에서 색상 변경:

```css
/* PseudocodeDeepDiveModal.vue */
.header-title { color: #e74c3c; } ← 변경 가능
```

---

## 📚 참고 자료

- SystemArchitecture Practice: `/frontend/src/features/practice/SystemArchitecturePractice.vue`
- useEvaluation: `/frontend/src/features/practice/composables/useEvaluation.js`
- architectureApi: `/frontend/src/features/practice/services/architectureApiFastTest.js`

---

## ✅ 체크리스트

구현 완료 확인:

- [ ] `pseudocodeApi.js` 생성
- [ ] `usePseudocodeEvaluation.js` 생성
- [ ] `PseudocodeDeepDiveModal.vue` 생성
- [ ] `PseudocodeResultScreen.vue` 생성
- [ ] `PseudocodePractice.vue` 생성
- [ ] `.env`에 API 키 설정
- [ ] 테스트 실행
- [ ] 프로덕션 배포

---

## 🤝 기여

문제가 발생하거나 개선 사항이 있다면:

1. 이슈 생성
2. 기능 브랜치 생성
3. 커밋 및 푸시
4. Pull Request 생성

---

## 📝 라이선스

프로젝트 라이선스를 따릅니다.

---

**작성일**: 2026-02-04  
**버전**: 1.0.0  
**작성자**: AI Assistant
