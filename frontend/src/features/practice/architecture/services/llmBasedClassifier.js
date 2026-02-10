/**
 * LLM-Based Interview Data Classifier
 *
 * [생성일: 2026-02-09]
 * [목적: feedback.md의 "NLP 대신 Few-shot Learning" 피드백 반영]
 *
 * 키워드 매칭 대신 LLM Few-shot Learning으로 면접 데이터 분류
 * - 맥락을 이해하며 분류
 * - False Positive 감소
 * - 강점/약점 구분
 */

const getApiKey = () => import.meta.env.VITE_OPENAI_API_KEY;

/**
 * LLM을 사용하여 면접 피드백 분류
 *
 * @param {string} summary - 면접 피드백 요약
 * @param {string} title - 면접 제목 (컨텍스트)
 * @returns {Promise<Object>} 분류 결과
 */
export async function classifyInterviewFeedback(summary, title = '') {
  const prompt = `당신은 시스템 디자인 면접 전문가입니다.
다음 면접 피드백을 분석하여 JSON 형식으로 분류하세요.

## 면접 제목
${title}

## 피드백 내용
${summary}

## 분류 기준

### 6대 기둥 (Well-Architected Framework)
1. **reliability** (신뢰성): redundancy, failover, disaster recovery, SPOF, availability
2. **performance** (성능): CDN, cache, latency, throughput, scalability, load balancing
3. **operational** (운영): monitoring, observability, logging, alerting, automation
4. **cost** (비용): cost optimization, reserved instances, auto-scaling, resource utilization
5. **security** (보안): encryption, authentication, authorization, IAM, key management
6. **sustainability** (지속가능성): maintainability, extensibility, code quality, technical debt

### 강점 vs 약점 구분
- **strengths**: "good job", "excellent", "well done", "strong", "impressive"
- **gaps**: "missing", "forgot", "should have", "lacked", "didn't mention", "weak"

## Few-shot 예시

### 예시 1
**Input:** "Good job on handling NFRs and discussing CDN. However, candidate forgot to mention cost optimization strategies."
**Output:**
\`\`\`json
{
  "pillars": ["performance", "cost"],
  "strengths": [
    {
      "pillar": "performance",
      "point": "CDN 논의",
      "detail": "CDN을 언급하여 성능 최적화 이해도를 보임"
    }
  ],
  "gaps": [
    {
      "pillar": "cost",
      "point": "비용 최적화 전략 누락",
      "detail": "비용 최적화 전략을 언급하지 않음"
    }
  ],
  "keywords": ["NFRs", "CDN", "cost optimization"]
}
\`\`\`

### 예시 2
**Input:** "Candidate struggled with redundancy. Mentioned SPOF but no concrete failover strategy. Also missing monitoring discussion."
**Output:**
\`\`\`json
{
  "pillars": ["reliability", "operational"],
  "strengths": [],
  "gaps": [
    {
      "pillar": "reliability",
      "point": "구체적인 failover 전략 부족",
      "detail": "SPOF를 언급했으나 구체적인 failover 전략 없음"
    },
    {
      "pillar": "operational",
      "point": "모니터링 논의 누락",
      "detail": "모니터링에 대한 언급 없음"
    }
  ],
  "keywords": ["redundancy", "SPOF", "failover", "monitoring"]
}
\`\`\`

### 예시 3
**Input:** "Excellent work on database choice justification. Candidate explained trade-offs between SQL and NoSQL clearly."
**Output:**
\`\`\`json
{
  "pillars": ["performance", "sustainability"],
  "strengths": [
    {
      "pillar": "performance",
      "point": "데이터베이스 선택 근거 명확",
      "detail": "SQL vs NoSQL 트레이드오프를 명확히 설명"
    },
    {
      "pillar": "sustainability",
      "point": "트레이드오프 논의",
      "detail": "설계 결정에 대한 트레이드오프 분석"
    }
  ],
  "gaps": [],
  "keywords": ["database", "SQL", "NoSQL", "trade-offs"]
}
\`\`\`

## 주의사항
1. **맥락 이해:** 단순 키워드 매칭이 아닌 문맥 파악
2. **강점/약점 구분:** 긍정적 vs 부정적 의미 정확히 판단
3. **다중 기둥:** 하나의 포인트가 여러 기둥에 걸칠 수 있음
4. **구체성:** detail에는 구체적인 이유/상황 포함

## 출력 형식 (JSON만)
\`\`\`json
{
  "pillars": ["pillar1", "pillar2"],
  "strengths": [
    { "pillar": "...", "point": "...", "detail": "..." }
  ],
  "gaps": [
    { "pillar": "...", "point": "...", "detail": "..." }
  ],
  "keywords": ["keyword1", "keyword2"]
}
\`\`\`
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3  // 낮은 temperature로 일관된 분류
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // JSON 추출
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }

    throw new Error('LLM이 JSON 형식을 반환하지 않음');
  } catch (error) {
    console.error('[LLM 분류 실패]', error);

    // Fallback: 기본 키워드 매칭 (최소한의 분류)
    return fallbackKeywordClassification(summary, title);
  }
}

/**
 * Fallback: 기본 키워드 매칭 분류
 *
 * LLM 실패 시 최소한의 분류 제공
 */
function fallbackKeywordClassification(summary, title) {
  const lowerSummary = summary.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const text = `${lowerSummary} ${lowerTitle}`;

  const pillarKeywords = {
    reliability: ['redundancy', 'failover', 'availability', 'spof', 'disaster', 'recovery'],
    performance: ['cdn', 'cache', 'latency', 'throughput', 'scalability', 'performance'],
    operational: ['monitoring', 'observability', 'logging', 'alerting', 'telemetry'],
    cost: ['cost', 'pricing', 'budget', 'reserved', 'spot instance'],
    security: ['encryption', 'authentication', 'authorization', 'security', 'access control'],
    sustainability: ['maintainability', 'extensibility', 'technical debt', 'refactor']
  };

  const detectedPillars = [];
  const keywords = [];

  Object.entries(pillarKeywords).forEach(([pillar, kws]) => {
    const found = kws.some(kw => text.includes(kw));
    if (found) {
      detectedPillars.push(pillar);
      keywords.push(...kws.filter(kw => text.includes(kw)));
    }
  });

  // 강점/약점 간단 구분
  const hasPositive = /(good|excellent|strong|well|impressive)/i.test(summary);
  const hasNegative = /(missing|forgot|lack|weak|should|didn't)/i.test(summary);

  const gaps = hasNegative ? [
    {
      pillar: detectedPillars[0] || 'unknown',
      point: '구체적 내용 확인 필요',
      detail: summary.substring(0, 100)
    }
  ] : [];

  return {
    pillars: detectedPillars,
    strengths: [],  // Fallback에서는 상세 분류 생략
    gaps,
    keywords: [...new Set(keywords)],
    _fallback: true  // Fallback 사용 표시
  };
}

/**
 * 배치 분류: 여러 면접 데이터를 한 번에 분류
 *
 * @param {Array} interviews - [{ title, summary, ... }, ...]
 * @param {Object} options - { batchSize: 5, delayMs: 1000 }
 * @returns {Promise<Array>} 분류 결과 배열
 */
export async function batchClassifyInterviews(interviews, options = {}) {
  const { batchSize = 5, delayMs = 1000 } = options;

  console.log(`🤖 [LLM 분류] ${interviews.length}개 면접 데이터 분류 시작...`);

  const results = [];
  const batches = [];

  // 배치로 나누기 (API 요청 제한 고려)
  for (let i = 0; i < interviews.length; i += batchSize) {
    batches.push(interviews.slice(i, i + batchSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`   배치 ${i + 1}/${batches.length} 처리 중...`);

    const batchResults = await Promise.allSettled(
      batch.map(interview =>
        classifyInterviewFeedback(interview.summary, interview.title)
      )
    );

    batchResults.forEach((result, idx) => {
      const interview = batch[idx];

      if (result.status === 'fulfilled') {
        results.push({
          ...interview,
          classification: result.value
        });
      } else {
        console.warn(`   ⚠️ 분류 실패: ${interview.title}`, result.reason);
        results.push({
          ...interview,
          classification: fallbackKeywordClassification(interview.summary, interview.title)
        });
      }
    });

    // 다음 배치 전 대기 (Rate limit 방지)
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successCount = results.filter(r => !r.classification._fallback).length;
  const fallbackCount = results.filter(r => r.classification._fallback).length;

  console.log(`✅ [분류 완료] 성공: ${successCount}, Fallback: ${fallbackCount}`);

  return results;
}

/**
 * 사용 예시:
 *
 * import { classifyInterviewFeedback, batchClassifyInterviews } from './llmBasedClassifier';
 *
 * // 단일 분류
 * const result = await classifyInterviewFeedback(
 *   "Good job on CDN, but missing cost discussion",
 *   "Design YouTube"
 * );
 *
 * // 배치 분류
 * const interviews = loadAllInterviews();
 * const classified = await batchClassifyInterviews(interviews, {
 *   batchSize: 3,  // 한 번에 3개씩
 *   delayMs: 2000  // 2초 대기
 * });
 */
