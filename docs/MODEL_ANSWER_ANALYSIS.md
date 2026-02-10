# 🔍 모범답안 제공 현황 분석

## ✅ 현재 구현 상태

### 1. UI는 이미 구현되어 있음 ✅

**EvaluationResultScreen.vue:83-96**

```vue
<!-- 아코디언 본문 -->
<div class="accordion-body">
  <div class="accordion-answers">
    <!-- 내 답변 -->
    <div class="accordion-answer-box user-answer">
      <div class="answer-label">MY ANSWER</div>
      <p>{{ result.questionEvaluations[idx].userAnswer || '(답변 없음)' }}</p>
    </div>

    <!-- ✅ 모범답안 박스 -->
    <div class="accordion-answer-box model-answer">
      <div class="answer-label">MODEL ANSWER</div>
      <p>{{ result.questionEvaluations[idx].modelAnswer || '(모범답안 없음)' }}</p>
    </div>
  </div>

  <!-- 피드백 & 개선점 -->
  <div class="accordion-feedback">...</div>
</div>
```

**UI 동작:**
```
┌─────────────────────────────────────────┐
│ 신뢰성 영역                        85   │ ← 클릭 가능
├─────────────────────────────────────────┤
│ [질문] 서버 다운 시?                     │
│                                         │
│ [MY ANSWER]           [MODEL ANSWER]    │
│ ┌─────────────────┐   ┌─────────────┐  │
│ │ 백업 서버 있음   │   │ (모범답안)  │  │
│ └─────────────────┘   └─────────────┘  │
│                                         │
│ [FEEDBACK] ...                          │
│ [IMPROVEMENTS] ...                      │
└─────────────────────────────────────────┘
```

---

### 2. 백엔드도 모범답안 생성 요청 ✅

**architectureEvaluatorApi.js:270-275**

```javascript
### 2. 모범답안 작성 규칙 (실제 면접 기준)
- 해당 시나리오와 아키텍처에 맞는 구체적인 답변
- 실제 기술/서비스 이름 포함 (예: Redis, PostgreSQL, Kubernetes)
- **트레이드오프 논의 포함** (예: "Redis는 빠르지만 영속성이 약해서...")
- 실제 면접에서 좋은 평가를 받을 수 있는 수준의 답변
- 사용자가 배울 수 있도록 상세하게
```

**JSON 출력 형식 (294번 줄)**

```json
{
  "evaluations": [
    {
      "category": "신뢰성",
      "question": "서버 다운 시?",
      "userAnswer": "백업 서버 있음",
      "score": 65,
      "feedback": "기본 개념은 있으나 구체성 부족",
      "modelAnswer": "이 시나리오/아키텍처에 맞는 모범답안 (5-7문장, 구체적 기술 포함)",  // ✅ 이 부분
      "improvements": ["자동 failover 메커니즘 설명 추가", "복구 시간 명시"]
    }
  ]
}
```

---

## ⚠️ 문제점

### **AI가 modelAnswer를 생성하지 않거나 품질이 낮을 수 있음**

#### 원인 1: 프롬프트 명확성 부족

**현재 프롬프트 (294번 줄):**
```json
"modelAnswer": "이 시나리오/아키텍처에 맞는 모범답안 (5-7문장, 구체적 기술 포함)"
```

**문제:**
- 설명이 너무 짧음
- "5-7문장"이 애매함
- 구체적인 예시가 없음
- **생성하지 않아도 패널티 없음**

#### 원인 2: 프롬프트 우선순위 낮음

**현재 프롬프트 구조:**
```
1. 평가 기준 (긴 설명)
2. 점수 산정 기준 (긴 설명)
3. 모범답안 작성 규칙 (짧은 설명)  ← 마지막에 있어서 무시될 수 있음
```

AI 모델은 프롬프트 앞부분에 더 집중하므로, 마지막 부분은 무시될 수 있습니다.

#### 원인 3: 예시 부재

프롬프트에 **모범답안의 실제 예시**가 없어서 AI가 어떤 형식으로 작성해야 할지 모를 수 있습니다.

---

## 🔧 해결 방안

### **방안 1: 프롬프트 개선 (권장) ⭐⭐⭐⭐⭐**

#### A. 모범답안 섹션을 프롬프트 앞으로 이동

```javascript
## ⚠️ 평가 규칙

### 1. 모범답안 작성 규칙 (최우선 - 반드시 작성!)  ← 맨 앞으로
**모범답안은 사용자 학습에 가장 중요한 요소입니다. 반드시 작성하세요.**

각 질문마다 다음 형식으로 모범답안을 작성:

**예시:**
질문: "서버가 다운되면 서비스가 멈추나요?"

모범답안:
"이 아키텍처에서는 다중 가용 영역(Multi-AZ) 구성으로 신뢰성을 확보합니다.

1. **자동 Failover**: AWS RDS의 Multi-AZ 기능으로 Primary DB 장애 시 30초 내 Standby로 자동 전환됩니다.

2. **백엔드 서버 이중화**: ALB(Application Load Balancer) 뒤에 최소 2개의 EC2 인스턴스를 배치하여, 하나가 다운되어도 다른 인스턴스가 트래픽을 처리합니다.

3. **헬스체크**: ALB가 30초마다 인스턴스 상태를 확인하며, 3번 연속 실패 시 해당 인스턴스를 자동으로 제외합니다.

4. **Trade-off**: Multi-AZ는 비용이 2배이지만, RTO(복구 목표 시간) 30초를 달성하려면 필수입니다. 비용이 중요하다면 Read Replica로 수동 전환하는 방법도 있으나 RTO는 5-10분으로 증가합니다.

5. **실제 구현**: Terraform으로 `aws_db_instance`의 `multi_az = true` 설정 + ALB의 `health_check` 블록 설정"

**형식 규칙:**
- 최소 5문장, 최대 8문장
- 반드시 **구체적 기술/서비스 이름** 포함 (AWS RDS, Kubernetes, Redis 등)
- **숫자 포함** (30초, 2개, 3번 등)
- **Trade-off 1개 이상** 언급
- **실제 구현 방법** 1가지 이상 제시

### 2. 점수 산정 기준
...
```

#### B. 모범답안 품질 체크리스트 추가

```javascript
## 🎯 모범답안 품질 체크리스트 (반드시 확인)

각 질문의 modelAnswer가 다음을 만족하는지 확인:
- [ ] 구체적 기술 이름 2개 이상 (예: PostgreSQL, Redis)
- [ ] 숫자 포함 (예: "30초 내", "3개 인스턴스")
- [ ] Trade-off 언급 1개 이상
- [ ] 이 문제의 시나리오와 연결
- [ ] 실제 면접에서 "Strong Hire" 받을 수 있는 수준

**나쁜 예:**
"백업 서버를 만들면 됩니다."  ← 추상적, 숫자 없음, trade-off 없음

**좋은 예:**
"AWS RDS Multi-AZ로 Primary DB 장애 시 30초 내 Standby로 자동 전환됩니다.
 비용은 2배지만 RTO 30초 달성 가능합니다..."  ← 구체적, 숫자, trade-off 모두 포함
```

#### C. Few-shot 예시 추가

```javascript
## 📚 모범답안 예시 (Few-shot Learning)

다음은 실제 면접에서 "Strong Hire"를 받은 답변들입니다.
이 수준으로 modelAnswer를 작성하세요:

**Q1: "트래픽이 10배 증가하면?"**
A: "Kubernetes HPA(Horizontal Pod Autoscaler)로 CPU 사용률 70% 이상 시 자동으로 Pod 수를 2배씩 증가시킵니다.
    최대 50개까지 확장 가능하며, 트래픽 감소 시 5분 후 축소하여 비용을 절감합니다.
    ALB는 최대 10만 RPS를 처리하므로 병목이 되지 않습니다.
    Trade-off: HPA는 반응 시간이 1-2분이므로 갑작스러운 스파이크에는 미리 예측하여 Pre-warming이 필요합니다.
    실제 구현: `kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=50`"

**Q2: "서버 다운 시?"**
A: "AWS RDS Multi-AZ로 Primary DB 장애 시 30초 내 Standby DB로 자동 Failover됩니다.
    백엔드는 ALB + 3개의 EC2로 이중화하며, 하나가 다운되어도 나머지 2개가 트래픽을 처리합니다.
    ALB 헬스체크가 10초마다 인스턴스 상태를 확인하며, 3번 연속 실패 시 자동 제외합니다.
    Trade-off: Multi-AZ는 비용 2배이지만 RTO 30초 달성에 필수입니다.
    실제 구현: Terraform `aws_db_instance { multi_az = true }`"

이 수준으로 각 질문의 modelAnswer를 작성하세요.
```

---

### **방안 2: 프롬프트에 강제 조항 추가**

```javascript
## ⚠️ 중요: modelAnswer 필수 생성 규칙

**절대적 규칙:**
- modelAnswer가 비어있거나 "(모범답안 없음)" 같은 placeholder를 반환하면 안 됩니다
- 모든 질문에 대해 반드시 5문장 이상의 구체적인 모범답안을 작성하세요
- modelAnswer가 없는 평가는 **불완전한 평가**로 간주됩니다

**검증:**
출력 전에 각 evaluation 항목의 modelAnswer 길이가 최소 200자 이상인지 확인하세요.
```

---

### **방안 3: JSON 스키마 강화**

```javascript
## 출력 형식 (JSON만)

{
  "evaluations": [
    {
      "category": "질문 카테고리 (예: 신뢰성)",
      "question": "질문 내용",
      "userAnswer": "사용자 답변 요약",
      "score": 0-100,
      "feedback": "사용자 답변에 대한 구체적 피드백 (2-3문장)",

      // ✅ 모범답안 (필수, 최소 5문장)
      "modelAnswer": "**필수**: 이 시나리오/아키텍처에 맞는 모범답안을 5-8문장으로 작성.
                      반드시 다음을 포함:
                      1. 구체적 기술 이름 (예: PostgreSQL, Redis, Kubernetes)
                      2. 숫자 (예: '30초 내', '3개 인스턴스')
                      3. Trade-off (예: '비용은 2배지만 RTO 30초 달성')
                      4. 실제 구현 방법 (예: Terraform 설정, kubectl 명령어)

                      예시:
                      'AWS RDS Multi-AZ로 Primary DB 장애 시 30초 내 Standby로 자동 전환됩니다.
                       백엔드는 ALB + 3개 EC2로 이중화하며, 하나가 다운되어도 나머지가 처리합니다.
                       ALB 헬스체크가 10초마다 확인하며 3번 실패 시 제외합니다.
                       Trade-off: Multi-AZ는 비용 2배지만 RTO 30초 필수입니다.
                       실제: Terraform aws_db_instance { multi_az = true }'"
                      ,

      "improvements": ["개선 포인트 1", "개선 포인트 2"]
    }
  ],
  ...
}
```

---

### **방안 4: Fallback 개선**

**현재 fallback (428번 줄):**
```javascript
modelAnswer: '평가 오류로 모범답안을 생성할 수 없습니다.'
```

**개선된 fallback:**
```javascript
function generateFallbackModelAnswer(question, category) {
  const templates = {
    '신뢰성': `이 아키텍처에서는 다중 가용 영역(Multi-AZ) 구성으로 신뢰성을 확보합니다.
                Primary 서버 장애 시 Standby 서버로 자동 Failover되며, 복구 시간은 30초 이내입니다.
                Load Balancer의 헬스체크로 장애 서버를 자동 제외하며, 최소 2개 인스턴스를 유지합니다.
                Trade-off: 비용은 2배지만 99.9% 가용성 달성이 가능합니다.
                실제 구현: AWS RDS의 multi_az = true 설정 또는 Kubernetes ReplicaSet 활용`,

    '성능': `Kubernetes HPA(Horizontal Pod Autoscaler)로 CPU 70% 이상 시 자동 스케일링합니다.
              CDN(CloudFront)으로 정적 리소스를 캐싱하여 로딩 시간을 50% 단축합니다.
              Redis 캐시로 DB 조회를 90% 감소시키며, TTL 5분으로 데이터 신선도를 유지합니다.
              Trade-off: 캐시는 메모리 비용이 발생하지만 응답 시간이 100ms → 10ms로 개선됩니다.
              실제 구현: kubectl autoscale + aws elasticache 연동`,

    // ... 나머지 카테고리
  };

  return templates[category] || '일반적인 모범답안 템플릿...';
}

function generateFallbackResult(qnaArray) {
  return {
    // ...
    questionEvaluations: qnaArray.map(q => ({
      category: q.category,
      question: q.question,
      userAnswer: q.answer,
      score: 50,
      feedback: '평가 오류',
      modelAnswer: generateFallbackModelAnswer(q.question, q.category),  // ✅ 개선
      improvements: []
    })),
    // ...
  };
}
```

---

## 🎯 최종 권장 사항

### **즉시 적용 (우선순위 높음)**

1. **프롬프트 개선** (방안 1-A, 1-B) ⭐⭐⭐⭐⭐
   - 모범답안 섹션을 프롬프트 맨 앞으로 이동
   - 품질 체크리스트 추가
   - 예상 시간: 30분

2. **Few-shot 예시 추가** (방안 1-C) ⭐⭐⭐⭐
   - 실제 좋은 답변 2-3개 예시 제공
   - 예상 시간: 20분

3. **Fallback 개선** (방안 4) ⭐⭐⭐
   - 평가 오류 시에도 교육적 모범답안 제공
   - 예상 시간: 1시간

### **추가 개선 (선택)**

4. **프롬프트 강제 조항** (방안 2) ⭐⭐
   - 200자 미만 modelAnswer 금지
   - 예상 시간: 10분

5. **JSON 스키마 강화** (방안 3) ⭐⭐
   - 더 상세한 설명 추가
   - 예상 시간: 15분

---

## 📊 기대 효과

### Before (현재)
```json
{
  "modelAnswer": "백업 서버를 사용하면 됩니다."
}
```

**문제:**
- 너무 추상적
- 숫자 없음
- Trade-off 없음
- 실제 구현 방법 없음

### After (개선 후)
```json
{
  "modelAnswer": "AWS RDS Multi-AZ로 Primary DB 장애 시 30초 내 Standby DB로 자동 Failover됩니다. 백엔드는 ALB + 3개의 EC2로 이중화하며, 하나가 다운되어도 나머지 2개가 트래픽을 처리합니다. ALB 헬스체크가 10초마다 인스턴스 상태를 확인하며, 3번 연속 실패 시 자동 제외합니다. Trade-off: Multi-AZ는 비용이 2배이지만 RTO 30초 달성에 필수입니다. 실제 구현: Terraform aws_db_instance { multi_az = true } 설정"
}
```

**개선:**
- ✅ 구체적 기술 (AWS RDS, ALB, EC2)
- ✅ 숫자 (30초, 3개, 10초)
- ✅ Trade-off (비용 2배 vs RTO 30초)
- ✅ 실제 구현 (Terraform 설정)

---

## 🔥 즉시 실행 가능한 코드

### **Step 1: 프롬프트 앞부분에 모범답안 섹션 추가**

`architectureEvaluatorApi.js:202` 부분을 다음과 같이 수정:

```javascript
const prompt = `당신은 **시니어 클라우드 솔루션 아키텍트**입니다.
Google, Facebook, Amazon 등에서 수백 건의 시스템 디자인 면접을 진행한 경험이 있습니다.
지원자의 시스템 아키텍처 설계와 질문 답변을 **실제 면접 기준**에 따라 평가합니다.

---

## ⚠️ 최우선 규칙: 모범답안 필수 작성

**모범답안은 사용자 학습에 가장 중요한 요소입니다. 반드시 작성하세요.**

### 모범답안 작성 필수 요구사항:

1. **최소 5문장, 최대 8문장**으로 작성
2. **구체적 기술/서비스 이름 2개 이상** 포함 (예: AWS RDS, Redis, Kubernetes, PostgreSQL)
3. **숫자 포함** (예: "30초 내", "3개 인스턴스", "99.9% 가용성")
4. **Trade-off 1개 이상** 명시 (예: "비용은 2배지만 RTO 30초 달성")
5. **실제 구현 방법 1개** 제시 (예: Terraform 설정, kubectl 명령어)
6. **이 문제의 시나리오와 아키텍처에 맞는 답변**

### 모범답안 예시:

**Q: "서버가 다운되면 서비스가 멈추나요?"**

**모범답안:**
"AWS RDS Multi-AZ로 Primary DB 장애 시 30초 내 Standby DB로 자동 Failover됩니다.
 백엔드는 ALB(Application Load Balancer) + 최소 3개의 EC2 인스턴스로 이중화하며,
 하나가 다운되어도 나머지 2개가 트래픽을 처리합니다.
 ALB 헬스체크가 10초마다 인스턴스 상태를 확인하며, 3번 연속 실패 시 해당 인스턴스를 자동으로 제외합니다.
 Trade-off: Multi-AZ는 비용이 2배이지만, RTO(복구 목표 시간) 30초를 달성하려면 필수입니다.
 실제 구현: Terraform으로 aws_db_instance의 multi_az = true 설정 + ALB의 health_check 블록 설정"

**나쁜 예 (절대 이렇게 작성하지 마세요):**
"백업 서버를 만들면 됩니다."  ← 추상적, 숫자 없음, trade-off 없음

**검증:**
출력 전에 각 evaluation 항목의 modelAnswer가 다음을 만족하는지 확인:
- [ ] 5문장 이상
- [ ] 구체적 기술 2개 이상
- [ ] 숫자 포함
- [ ] Trade-off 언급
- [ ] 실제 구현 방법

---

## 📋 문제 정보
...
(이하 기존 프롬프트 계속)
`;
```

### **Step 2: JSON 스키마 개선**

`architectureEvaluatorApi.js:286` 부분을 다음과 같이 수정:

```javascript
## 출력 형식 (JSON만)

{
  "evaluations": [
    {
      "category": "질문 카테고리 (예: 신뢰성)",
      "question": "질문 내용",
      "userAnswer": "사용자 답변 요약",
      "score": 0-100,
      "feedback": "사용자 답변에 대한 구체적 피드백 (2-3문장)",
      "modelAnswer": "**필수 작성** 위의 모범답안 작성 규칙을 반드시 따라서 5-8문장으로 작성. 구체적 기술 이름, 숫자, Trade-off, 실제 구현 방법 모두 포함",
      "improvements": ["개선 포인트 1", "개선 포인트 2"]
    }
  ],
  "overallScore": 0-100,
  "grade": "excellent/good/needs-improvement/poor",
  "summary": "전체 평가 요약 (3-4문장)",
  "strengths": ["강점 1", "강점 2"],
  "weaknesses": ["약점 1", "약점 2"],
  "recommendations": ["추천 학습/개선 사항 1", "추천 2"]
}

**중요: 모든 modelAnswer는 반드시 5문장 이상, 구체적 기술 2개 이상, 숫자, Trade-off, 실제 구현 포함해야 합니다.**
```

---

## ✅ 체크리스트

### 즉시 적용할 항목:

- [ ] architectureEvaluatorApi.js의 프롬프트 수정 (Step 1)
- [ ] JSON 스키마 개선 (Step 2)
- [ ] 테스트 실행 (문제 1개 풀고 모범답안 확인)
- [ ] 모범답안 품질 확인 (5문장 이상, 기술명, 숫자, Trade-off)

### 선택적 개선:

- [ ] Fallback 함수에 카테고리별 템플릿 추가
- [ ] 프롬프트에 Few-shot 예시 2-3개 더 추가
- [ ] UI에 "모범답안 보기" 강조 표시 추가

---

**이렇게 하면 모든 평가 결과에서 고품질 모범답안이 제공됩니다!** 🎉
