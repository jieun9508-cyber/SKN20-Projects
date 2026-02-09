import { ref } from 'vue';
// 마스터 에이전트 기반 다중 에이전트 평가 사용 (6대 기둥)
import { evaluateWithMasterAgent, getAvailableSubAgents, getAllQuestionStrategies } from '../services/architectureApiMasterAgent';
import { generateFollowUpQuestions, judgeAnswerSufficiency, generateDeepDiveQuestion } from '../services/architectureApiFastTest';
import {
  buildArchitectureContext,
  generateMockEvaluation
} from '../utils/architectureUtils';

/**
 * 평가 Composable
 *
 * 프로세스:
 * 1. 사용자 아키텍처 설명 입력
 * 2. 6대 기둥 병렬 에이전트로 질문 6개 생성 (txt 파일 참고)
 * 3. 질문에 대한 답변 수집
 * 4. 6대 기둥 기반 평가 실행
 */
export function useEvaluation() {
  // Evaluation State
  const isEvaluating = ref(false);
  const evaluationResult = ref(null);
  const showResultScreen = ref(false);

  // Deep Dive State
  const isDeepDiveModalActive = ref(false);
  const isGeneratingDeepDive = ref(false);
  const deepDiveQuestion = ref(null);
  const deepDiveQuestions = ref([]);
  const currentQuestionIndex = ref(0);
  const collectedDeepDiveAnswers = ref([]);
  const pendingEvaluationAfterDeepDive = ref(false);

  // 설명 입력 Phase 상태
  const evaluationPhase = ref('idle'); // 'idle' | 'explanation' | 'questioning' | 'evaluating'
  const userExplanation = ref('');
  const explanationAnalysis = ref(null);

  // 답변 충분성 판정 상태
  const isJudgingAnswer = ref(false);
  // 딥다이브 컨텍스트 (judgeAnswerSufficiency, generateDeepDiveQuestion에 전달)
  const deepDiveContext = ref(null);

  // Chat messages for evaluation context
  const chatMessages = ref([]);

  // 6대 기둥 정보 (평가지표)
  const sixPillars = ref(getAvailableSubAgents());
  const allQuestionStrategies = ref(getAllQuestionStrategies());

  async function submitDeepDiveAnswer(answer) {
    const currentQ = deepDiveQuestions.value[currentQuestionIndex.value];

    if (answer) {
      collectedDeepDiveAnswers.value.push({
        category: currentQ?.category || '',
        question: deepDiveQuestion.value,
        answer: answer
      });

      chatMessages.value.push({
        role: 'user',
        content: `[심화 질문 - ${currentQ?.category}] ${deepDiveQuestion.value}\n\n[답변] ${answer}`,
        type: 'answer'
      });
    }

    // 이미 딥다이브 질문(후속 질문)이면 판정 없이 다음으로 이동
    if (currentQ?.isDeepDive) {
      return moveToNextQuestion();
    }

    // 답변 충분성 판정
    if (answer && deepDiveContext.value) {
      isJudgingAnswer.value = true;
      try {
        const judgment = await judgeAnswerSufficiency(currentQ, answer, deepDiveContext.value);
        console.log(`🔍 [판정] ${currentQ?.category}: ${judgment.isSufficient ? '충분' : '불충분'} - ${judgment.reason}`);

        if (!judgment.isSufficient) {
          // 딥다이브 후속 질문 생성
          const followUp = await generateDeepDiveQuestion(
            currentQ,
            answer,
            judgment.missingPoints || [],
            deepDiveContext.value
          );
          followUp.isDeepDive = true; // 후속 질문 마킹

          // 현재 질문 바로 뒤에 삽입
          deepDiveQuestions.value.splice(currentQuestionIndex.value + 1, 0, followUp);
          console.log(`🔄 [딥다이브] "${followUp.question}" 삽입 (총 ${deepDiveQuestions.value.length}개)`);
        }
      } catch (error) {
        console.warn('답변 판정 실패, 다음 질문으로 이동:', error);
      } finally {
        isJudgingAnswer.value = false;
      }
    }

    return moveToNextQuestion();
  }

  function moveToNextQuestion() {
    currentQuestionIndex.value++;

    if (currentQuestionIndex.value < deepDiveQuestions.value.length) {
      deepDiveQuestion.value = deepDiveQuestions.value[currentQuestionIndex.value].question;
      return false; // Not finished
    } else {
      isDeepDiveModalActive.value = false;
      deepDiveQuestion.value = null;
      return true; // All questions done
    }
  }

  async function openEvaluationModal(problem, droppedComponents, connections, mermaidCode) {
    if (droppedComponents.length > 0) {
      pendingEvaluationAfterDeepDive.value = true;
      // Phase 1: 설명 입력 모드로 시작
      evaluationPhase.value = 'explanation';
      isDeepDiveModalActive.value = true;
      isGeneratingDeepDive.value = false;
      currentQuestionIndex.value = 0;
      collectedDeepDiveAnswers.value = [];
      userExplanation.value = '';

      // 설명 요청 안내 메시지
      deepDiveQuestion.value = '설계한 아키텍처에 대해 설명해주세요. 왜 이런 구조를 선택했는지, 각 컴포넌트의 역할과 데이터 흐름에 대해 자유롭게 작성해주세요.';
      deepDiveQuestions.value = [{ category: '아키텍처 설명', question: deepDiveQuestion.value }];

      return { needsDeepDive: true, phase: 'explanation' };
    }

    // DeepDive만 사용하므로 EvaluationModal 대신 바로 평가 진행
    await directEvaluate(problem, droppedComponents, connections, mermaidCode);
    return { needsDeepDive: false };
  }

  /**
   * 사용자 설명 제출 후 6대 기둥 병렬 에이전트로 질문 6개 생성
   */
  async function submitUserExplanation(explanation, problem, droppedComponents, connections, mermaidCode) {
    userExplanation.value = explanation;
    isGeneratingDeepDive.value = true;

    // 딥다이브 판정/질문 생성에 사용할 컨텍스트 저장
    const componentList = droppedComponents.map(c => `${c.text} (${c.type})`).join(', ');
    const connectionList = connections.map(conn => {
      const from = droppedComponents.find(c => c.id === conn.from);
      const to = droppedComponents.find(c => c.id === conn.to);
      return from && to ? `${from.text} → ${to.text}` : null;
    }).filter(Boolean).join(', ');
    deepDiveContext.value = { componentList, connectionList, mermaidCode };

    // 설명을 첫 번째 답변으로 저장
    collectedDeepDiveAnswers.value.push({
      category: '아키텍처 설명',
      question: deepDiveQuestion.value,
      answer: explanation
    });

    try {
      // 6대 기둥 병렬 에이전트로 질문 6개 생성
      const result = await generateFollowUpQuestions(
        problem,
        droppedComponents,
        connections,
        mermaidCode,
        explanation
      );

      explanationAnalysis.value = result.analysis;

      // 질문들 설정
      if (result.questions && result.questions.length > 0) {
        deepDiveQuestions.value = result.questions;
        currentQuestionIndex.value = 0;
        deepDiveQuestion.value = result.questions[0].question;
        evaluationPhase.value = 'questioning';
      } else {
        // 질문이 없으면 바로 평가로
        evaluationPhase.value = 'evaluating';
        isDeepDiveModalActive.value = false;
        return true; // 평가 진행 가능
      }
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      // 에러 시 기본 질문 사용
      deepDiveQuestions.value = [
        {
          category: '신뢰성',
          question: '만약 이 시스템의 핵심 서버가 갑자기 다운된다면, 서비스 전체가 멈추나요? 아니면 다른 경로로 우회할 수 있는 구조인가요?'
        },
        {
          category: '성능',
          question: '갑자기 사용자가 10배로 늘어나는 이벤트 상황이 발생하면, 이 시스템이 자동으로 대응하나요?'
        },
        {
          category: '운영',
          question: '서비스에 장애가 났을 때, 관리자가 알기 전에 시스템이 먼저 알려주는 알람 기능이 있나요?'
        },
        {
          category: '비용',
          question: '트래픽이 적은 새벽 시간대에도 동일한 인프라 비용이 발생하나요? 비용을 줄일 수 있는 구조인가요?'
        },
        {
          category: '보안',
          question: '외부에서 내부 데이터베이스에 직접 접근하는 것을 어떻게 차단하고 있나요?'
        },
        {
          category: '지속가능성',
          question: '새로운 기능을 추가하거나 기존 컴포넌트를 교체할 때, 다른 부분에 영향을 최소화할 수 있는 구조인가요?'
        }
      ];
      currentQuestionIndex.value = 0;
      deepDiveQuestion.value = deepDiveQuestions.value[0].question;
      evaluationPhase.value = 'questioning';
    } finally {
      isGeneratingDeepDive.value = false;
    }

    return false; // 아직 질문 단계
  }

  /**
   * 직접 평가 실행
   */
  async function directEvaluate(problem, droppedComponents, connections, mermaidCode) {
    showResultScreen.value = true;
    isEvaluating.value = true;
    evaluationResult.value = null;

    const architectureContext = buildArchitectureContext(
      droppedComponents,
      connections,
      mermaidCode
    );

    // 설명 항목 제외, 6대 기둥 질문 답변 추출
    const deepDiveQnA = collectedDeepDiveAnswers.value
      .filter(item => item.category !== '아키텍처 설명')
      .map(item => ({
        category: item.category,
        question: item.question,
        answer: item.answer
      }));

    try {
      // 마스터 에이전트 기반 6대 기둥 평가
      evaluationResult.value = await evaluateWithMasterAgent(
        problem,
        architectureContext,
        null, // EvaluationModal 질문 없음
        userExplanation.value, // 사용자 설명 전달
        deepDiveQnA
      );
    } catch (error) {
      console.error('Master Agent Evaluation error:', error);
      evaluationResult.value = generateMockEvaluation(problem, droppedComponents);
    } finally {
      isEvaluating.value = false;
    }
  }

  function handleRetry() {
    showResultScreen.value = false;
  }

  /**
   * 평가 상태 초기화
   */
  function resetEvaluationState() {
    evaluationResult.value = null;
    deepDiveQuestions.value = [];
    currentQuestionIndex.value = 0;
    collectedDeepDiveAnswers.value = [];
    chatMessages.value = [];
    evaluationPhase.value = 'idle';
    userExplanation.value = '';
    explanationAnalysis.value = null;
    isJudgingAnswer.value = false;
    deepDiveContext.value = null;
  }

  function isPendingEvaluation() {
    return pendingEvaluationAfterDeepDive.value;
  }

  function clearPendingEvaluation() {
    pendingEvaluationAfterDeepDive.value = false;
  }

  return {
    // Evaluation State
    isEvaluating,
    evaluationResult,
    showResultScreen,

    // Deep Dive State
    isDeepDiveModalActive,
    isGeneratingDeepDive,
    isJudgingAnswer,
    deepDiveQuestion,
    deepDiveQuestions,
    currentQuestionIndex,
    collectedDeepDiveAnswers,

    // 설명 Phase 상태
    evaluationPhase,
    userExplanation,
    explanationAnalysis,

    // 6대 기둥 정보
    sixPillars,
    allQuestionStrategies,

    // Methods
    submitDeepDiveAnswer,
    openEvaluationModal,
    directEvaluate,
    handleRetry,
    resetEvaluationState,
    isPendingEvaluation,
    clearPendingEvaluation,

    // 설명 제출 메서드
    submitUserExplanation
  };
}
