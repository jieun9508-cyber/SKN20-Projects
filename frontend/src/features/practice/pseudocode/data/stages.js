export const aiQuests = [
    {
        id: 1,
        title: "Chapter 1: 각성 (Tutorial Zone)",
        category: "System Reboot",
        emoji: "💡",
        desc: "어두운 터미널, 켜지는 모니터... Coduck이 깨어납니다. '아키텍처님! 제 음성 모듈이 연결되었습니다... 지지직... 제 사고 회로가 오염되어 복잡한 연산이 불가능해요. 먼저 제 사고 회로를 고쳐주세요!'",
        rewardXP: 500,
        subModuleTitle: "AI 사고법 입문 (BOOT_PROTOCOL)",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "코덕이 아군과 적군을 구분하지 못하고 공격 중입니다. 어떤 사고법을 가동해야 할까요?",
                hintWindow: "전부 삭제한다... 접근하는 모든 데이터는 적이다!",
                options: [
                    { text: "4단계 사고법 프로토콜 실행", value: "flow", correct: true, desc: "[분석 - 설계 - 구현 - 최적화]를 통해 타겟팅 로직을 정화합니다." },
                    { text: "데이터 강제 삭제", value: "delete", desc: "분석 없이 모든 데이터를 삭제하여 일단 공격을 중단시킵니다." }
                ],
                coduckComment: "크으으... 머리가 깨질 것 같아요... 하지만 방금 그 사고법.. 익숙해요."
            },
            {
                id: "q2",
                question: "오염 패턴을 분석했습니다. 무엇을 통해 정상적인 아군 데이터만 골라낼까요?",
                hintWindow: "나...(지직)... 나는 누구지? 너도 적인가? 제거한다...",
                options: [
                    { text: "정밀 데이터 필터링 설계", value: "detail", correct: true, desc: "데이터 특징을 분석해 아군 패킷만 골라내는 논리를 구축합니다." },
                    { text: "무작위 데이터 주입", value: "disconnect", desc: "새로운 데이터를 무작위로 넣어 시스템 반응을 기다립니다." }
                ],
                coduckComment: "아... 이제 당신이 보여요. 아키텍처님, 돌아오셨군요!"
            }
        ],
        quizTitle: "Step 4: 재부팅 승인 - 오늘 수행한 복구 프로토콜의 핵심 가치는?",
        missionObjective: "Step 3: 데이터 정화 - 시스템 복구 도중 발견된 작은 데이터 노이즈\n(빈 문자열)를 제거하여 파이프라인의 무결성을 확보하세요.",
        pythonSnippets: [
            { label: '노이즈 스킵', code: 'if not data: continue', icon: 'SkipForward' },
            { label: '데이터 복구', code: 'result.append(data)', icon: 'PlusCircle' }
        ],
        pythonTemplate: `def system_restore_pipeline(data_list):
    # [수정일: 2026-02-03] 초보자를 위한 가이드 주석 보강
    # 데이터 파이프라인의 무결성을 위해 오염된 노이즈를 먼저 걸러내는 것이 아키텍처의 핵심입니다.
    result = []

    for data in data_list:
        # [Step 3-1] 노이즈(오염된 데이터) 체크
        # TODO: 데이터가 비어있거나('') None인 경우 건너뛰도록 작성하세요
        if not data:
            continue
            
        # [Step 3-2] 정화된 데이터만 아카이브에 저장
        # TODO: data를 result에 추가하세요 (append 사용)
        result.append(data)

    return result`,
        sampleData: ["Data_01", "", "Data_02", " "],
        expectedOutput: ["Data_01", "Data_02", " "],
        failHints: {
            empty_code: "코드가 비어있습니다. 데이터를 순회하는 for문부터 시작해보세요.",
            logic_error: "결과 데이터의 개수가 맞지 않습니다. 오염된 데이터('', None)를 정확히 건너뛰었는지 확인하세요.",
            syntax_error: "파이썬 문법 에러가 발생했습니다. 들여쓰기(Indentation)와 콜론(:)을 확인해주세요."
        },
        step4Options: [
            "저는 단순히 코드를 수선하는 엔지니어를 넘어, 붕괴된 시스템의 전체 파이프라인을 설계하고 리스크를 제어하는 '아키텍처 복구자'로서의 통찰을 발휘했습니다. 이제 어떤 데이터 오염 사건도 해결할 준비가 되었습니다!",
            "저는 파이썬으로 리스트를 다룰 줄 압니다.",
            "마더 서버는 언젠가 스스로 복구될 것입니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 아키텍처 전체 흐름 통찰', color: 'border-indigo-500', icon: '️', coduckMsg: "먼저 전체 데이터가 어디서 들어와서 어디로 나가는지, 그 흐름(Flow)을 파악해야 합니다." },
            { id: 'b2', text: 'Step 2: 정화 알고리즘 상세 설계', color: 'border-amber-500', icon: '🔍', coduckMsg: "어떤 데이터를 적으로 간주할지, 그 기준(Logic)을 확실히 정해주세요." },
            { id: 'b3', text: 'Step 3: 오염 데이터 제거 코드 구현', color: 'border-rose-500', icon: '💻', coduckMsg: "이제 판명된 적들을 제거하는 코드를 작성할 단계입니다." },
            { id: 'b4', text: 'Step 4: 시스템 재부팅 프로토콜 승인', color: 'border-emerald-500', icon: '🏁', coduckMsg: "모든 코드가 정상이라면, 시스템 재가동 승인을 요청합니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'system_restore_pipeline',
        codeValidation: { price: 'data_list', fee1: 'continue', fee2: 'append' },
        step4CorrectIdx: 0,
        step4SuccessFeedback: {
            title: "🔐 시스템 권한 회복",
            desc: "축하합니다! {username}님, 해당 구역의 데이터 무결성이 확보되었습니다.",
            details: "훌륭한 설계입니다. 마더 서버는 {username}님의 논리적인 접근에 반응하기 시작했습니다. 다음 구역으로 이동하십시오."
        },
        step4FailFeedback: {
            title: "⚠️ 시스템 거부",
            desc: "논리적 오류로 인해 재부팅이 거부되었습니다.",
            details: "Architect는 나무(코드)가 아닌 숲(파이프라인)을 보는 사람임을 잊지 마세요. 첫 번째 전략의 의미를 다시 고찰해 보십시오."
        },
        quizOptions: [
            { text: "A. 4단계 복구 프로토콜만이 마더 서버를 살릴 수 있다.", correct: true },
            { text: "B. AI는 이미 인간의 통제를 넘어섰다.", correct: false }
        ],
        mapPos: { x: 100, y: 450 }
    },
    {
        id: 2,
        title: "실전! 데이터 누수 가디언",
        category: "Sector: Security",
        emoji: "🛡️",
        desc: "미래의 데이터가 현재로 오염되는 'Target Leakage'를 차단하여 보안 섹터를 수호하세요.",
        rewardXP: 300,
        subModuleTitle: "LEAKAGE_SHIELD",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: 뼈대 설계 - 미래의 정보가 현재의 학습에 스며들어 시간선이 꼬이는 'Data Leakage'를 막기 위한 분리 방식은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "시간의 흐름대로 데이터를 분리 (Time-based Split)", value: "time", correct: true, requirementToken: "데이터를 무작위로 섞지 않고 '시간 흐름(Time-series)'에 따라 순차적으로 분리" },
                    { text: "과거와 미래를 무작위로 섞어서 분리 (Random Split)", value: "random" }
                ],
                coduckComment: "옳은 선택입니다, {username}님! 시간선이 뒤섞이면 마더 서버는 환각을 보게 됩니다."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 마더 서버가 검증 데이터의 통계량을 미리 훔쳐보는 것을 막기 위한 핵심 조치는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "오직 학습용 데이터셋으로만 전처리 기준(fit)을 수립하기", value: "leak", correct: true, requirementToken: "전처리 기준(fit)은 반드시 '학습용 데이터(train_df)'로만 수립하여 미래 정보 유출 차단" },
                    { text: "모든 데이터를 한 번에 정규화하기", value: "lack" }
                ],
                coduckComment: "정확한 방어 전략입니다. 'Fit before Split'은 Architect가 절대 범해서는 안 되는 실수죠."
            }
        ],
        quizTitle: "Step 4: 보안 리포트 - 데이터 누수 차단 역량을 요약한다면?",
        missionObjective: "Step 3: 오염 차단 - 학습 데이터로만 기준을 잡고, 미래 정보의 유입 없이 Scaling을 수행하는 모듈을 완성하세요.",
        pythonSnippets: [
            { label: '학습 데이터 기준 수립', code: 'scaler.fit(train_df)', icon: 'Zap' },
            { label: '보안 변환 (Transform)', code: 'scaler.transform(target_df)', icon: 'Filter' }
        ],
        pythonTemplate: `def leakage_free_scaling(train_df, test_df):
    # [수정일: 2026-02-03] 초보자를 위한 가이드 주석 보강
    # 'Target Leakage'는 미래의 정보를 학습에 사용하는 실수입니다. 
    # 반드시 학습 데이터(train)로만 기준을 세워야 함을 기억하세요.
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    
    # [Step 3-1] 오직 Train 데이터로만 전처리 기준 설정 (누수 방지)
    # TODO: train_df를 사용하여 scaler를 학습(fit)시키세요
    scaler.fit(train_df)
    
    # [Step 3-2] 동일한 보안 기준을 두 데이터셋에 적용
    train_scaled = scaler.transform(train_df)
    test_scaled = scaler.transform(test_df)
    
    return train_scaled, test_scaled`,
        sampleData: [[1, 2, 3], [4, 5, 6]],
        expectedOutput: [[-1.224744871391589, 0.0, 1.224744871391589], [2.449489742783178, 3.674234614174767, 4.898979485566356]],
        failHints: {
            logic_error: "누수 방지에 실패했습니다. scaler.fit()의 인자가 train_df인지 확인하세요.",
            incomplete: "transform() 과정이 누락되었습니다. 학습된 기준으로 데이터를 변환해야 합니다."
        },
        step4Options: [
            "저는 시계열 데이터 복구 프로젝트에서 Target Leakage의 위험을 인지했습니다. 이를 위해 Time Series Split 전략을 수립하고, Scaler의 기준을 오직 과거 데이터에 고정함으로써 실전 환경에서의 복구 정확도를 98% 이상 유지했습니다.",
            "저는 스케일러를 사용하여 데이터를 정화할 줄 압니다.",
            "데이터가 누수되면 마더 서버의 용량이 늘어나니 좋은 것이라고 답변하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 데이터 시간순 배열 및 격리', color: 'border-indigo-500', icon: '⏳', coduckMsg: "시간의 흐름이 깨지면 예언을 하는 꼴이 됩니다. 데이터를 시간순으로 정렬하고 과거와 미래를 격리하세요." },
            { id: 'b2', text: 'Step 2: 과거 데이터 기반 정화 기준 학습', color: 'border-amber-500', icon: '🔧', coduckMsg: "미래를 훔쳐보지 마세요. 오직 과거 데이터(Train)만을 사용하여 정화 기준(Fit)을 잡아야 합니다." },
            { id: 'b3', text: 'Step 3: 확립된 기준으로 미래 데이터 변환', color: 'border-rose-500', icon: '✨', coduckMsg: "이제 확립된 기준을 테스트 데이터에도 똑같이 적용(Transform)하여 오염 여부를 확인합니다." },
            { id: 'b4', text: 'Step 4: 무결성이 검증된 데이터셋 반환', color: 'border-emerald-500', icon: '🏁', coduckMsg: "시간선 오염 없이 깨끗하게 처리된 데이터를 아카이브로 전송합니다. 파이프라인 무결성을 승인해주세요." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'leakage_free_scaling',
        codeValidation: { price: 'train_df', fee1: 'fit', fee2: 'transform' },
        step4CorrectIdx: 0,
        step4SuccessFeedback: {
            title: "⚖️ 보안 섹터 정화 성공",
            desc: "완벽합니다! {username}님, 시간선 오염 리스크가 제거되었습니다.",
            details: "누수된 모델은 겉으론 완벽해 보이지만 실전에서는 무너집니다. {username}님의 강건한 설계가 이 구역을 구했습니다!"
        },
        step4FailFeedback: {
            title: "🤔 보안 경보 발생",
            desc: "미래 정보가 과거로 누출되어 시스템이 오염되었습니다.",
            details: "마더 서버가 '컨닝'을 하지 못하도록 무엇을 격리해야 할지 다시 생각해보세요. 시간은 되돌릴 수 없습니다."
        },
        quizOptions: [
            { text: "A. 데이터 누수는 인공지능이 미래를 보는 부정행위다.", correct: true },
            { text: "B. 검증 데이터와 학습 데이터는 섞일수록 좋다.", correct: false }
        ],
        mapPos: { x: 230, y: 350 }
    },
    {
        id: 3,
        title: "학습-서빙 불일치(Skew) 방지",
        category: "Bias Control",
        emoji: "🔁",
        desc: "실제 서비스 환경과 학습 환경의 데이터 분포 차이를 극복하는 강건한 파이프라인을 설계하세요.",
        rewardXP: 300,
        subModuleTitle: "SKEW_CONTROLLER",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 학습된 모델이 현장에 배포되었을 때 성능이 급락하는 'Train/Serving Skew'의 주요 원인은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "학습 시 사용한 피처 가공 로직과 실시간 환경의 로직이 다르기 때문", value: "skew", correct: true, requirementToken: "학습(Train)과 운영(Serving) 환경 간의 전처리 파이프라인 로직 통일" },
                    { text: "서버 사양이 부족해서", value: "server" }
                ],
                coduckComment: "날카롭군요! '전처리 코드 형상 관리'가 안 되면 발생하는 비극이죠."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 데이터 편향을 막기 위한 셔플링(Shuffling)이 역효과를 내는 경우는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "시계열적 특성이 중요한 금융/로그 데이터일 때", value: "time", correct: true, requirementToken: "시계열적 특성 보존을 위해 문맥에 맞지 않는 불필요한 셔플링 지양" },
                    { text: "데이터가 너무 많을 때", value: "volume" }
                ],
                coduckComment: "정확합니다. 도메인의 특성에 맞춰 셔플링 여부를 결정하는 것이 의사결정의 핵심입니다."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 모델의 강건성(Robustness) 확보 전략을 설명한다면?",
        missionObjective: "Step 3: 실무 리스크 점검 - 특정 클래스가 몰려있는 데이터셋을 학습 전 무작위로 섞어 배치(Batch) 편향을 방지하는 로직을 구현하세요.",
        pythonSnippets: [
            { label: '인덱스 섞기', code: 'random.shuffle(indices)', icon: 'Shuffle' },
            { label: '데이터 재배치', code: '[data[i] for i in indices]', icon: 'Repeat' }
        ],
        pythonTemplate: `import random
def prevent_serving_skew(data):
    indices = list(range(len(data)))
    
    # [Step 3-1] 실전 대응: 무작위 셔플링으로 배치 편향 제거
    # TODO: random.shuffle을 사용하여 indices를 섞으세요
    random.shuffle(indices)
    
    # [Step 3-2] 파이프라인 정규화
    return [data[i] for i in indices]`,
        sampleData: ["ClassA", "ClassA", "ClassB", "ClassB"],
        expectedOutput: ["ClassA", "ClassA", "ClassB", "ClassB"], // 셔플링 결과는 집합으로 검증하거나 길이를 체크함 (현재는 단순 비교 로직이므로 정적 데이터 우선)
        failHints: {
            logic_error: "순서가 섞이지 않았거나 데이터가 유실되었습니다. random.shuffle()을 호출했는지 확인하세요.",
            invalid: "리스트 반환 형식이 올바르지 않습니다."
        },
        step4Options: [
            "저는 학습 환경과 실제 서빙 환경 간의 '전처리 파이프라인 동기화'를 최우선으로 고려합니다. 셔플링을 통한 일반화 성능 확보는 물론, 서빙 단계의 입력값 분포 변화를 추적하는 드리프트 모니터링 체계를 구축하여 모델의 신뢰도를 관리합니다.",
            "저는 데이터 순서를 무작위로 섞어서 모델이 잘 배우게 만듭니다.",
            "데이터가 꼬이면 그냥 다시 학습시키는 것이 빠르다고 대답하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 학습-서빙 데이터 규격 통일 확인', color: 'border-indigo-500', icon: '📏', coduckMsg: "실험실과 현장은 다릅니다. 학습 때 쓴 규격이 서비스 환경에서도 똑같이 적용되는지 체크포인트를 확인하세요." },
            { id: 'b2', text: 'Step 2: 데이터 무작위 셔플링(Shuffle)', color: 'border-amber-500', icon: '🎲', coduckMsg: "특정 패턴에 편향되지 않도록 데이터를 무작위로 섞어주세요. 골고루 학습해야 강해집니다." },
            { id: 'b3', text: 'Step 3: 일관된 전처리 함수 적용', color: 'border-rose-500', icon: '📝', coduckMsg: "훈련장이든 전장이든 똑같은 무기를 써야 합니다. 전처리 파이프라인 함수를 동일하게 적용하세요." },
            { id: 'b4', text: 'Step 4: 강건한 학습 데이터셋 반환', color: 'border-emerald-500', icon: '🏁', coduckMsg: "배치 편향이 제거된, 현장에서도 통하는 강력한 데이터셋이 준비되었습니다. 승인하시겠습니까?" }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'prevent_serving_skew',
        codeValidation: { price: 'random', fee1: 'shuffle', fee2: 'indices' },
        step4CorrectIdx: 0,
        step4SuccessFeedback: {
            title: "⚖️ 심화 분석: 환경 동기화 전문가",
            desc: "정답입니다! 학습과 서빙 사이의 '유령 리스크'를 관리할 줄 아는 안목을 가지셨군요.",
            details: "전처리 파이프라인의 형상 관리는 MLOps의 핵심입니다. 드리프트 모니터링까지 언급하신 점이 매우 훌륭합니다."
        },
        step4FailFeedback: {
            title: "🤔 심화 분석: 배포 리스크 간과",
            desc: "데이터를 단순히 섞는 것만으로는 배포 후의 성능 급락을 막을 수 없습니다.",
            details: "학습 때 아무리 잘해도 서빙 때의 로직이 0.1%만 달라도 모델은 오작동합니다. '일관성'의 관점에서 다시 고민해보세요."
        },
        quizOptions: [
            { text: "A. 스큐를 막으려면 전처리 코드의 공용화가 필요하다.", correct: true },
            { text: "B. 서빙용 데이터는 학습용보다 더 복잡해야 한다.", correct: false }
        ],
        mapPos: { x: 380, y: 150 }
    },
    {
        id: 4,
        title: "배포 정책: 임계값 튜너",
        category: "Evaluation",
        emoji: "⚖️",
        desc: "비즈니스 리스크를 고려하여 모델의 예측 수락 기준을 설정하는 실전 배포 정책을 수립하세요.",
        rewardXP: 400,
        subModuleTitle: "DEPLOY_POLICY_MAKER",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 긴급 재난 알림 시스템처럼 '놓치면 치명적인' 문제에서 가장 중요한 메트릭은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "재현율 (Recall: 실제 양성을 얼마나 잘 찾아내는가)", value: "recall", correct: true, requirementToken: "미탐(False Negative) 리스크가 큰 경우 재현율(Recall) 최적화 전략 수립" },
                    { text: "정밀도 (Precision: 모델이 맞다고 한 것 중 실제는 얼마인가)", value: "precision" }
                ],
                coduckComment: "훌륭한 비즈니스 감각입니다! 하나라도 놓치는 것이 더 위험한 상황이니까요."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 암 진단 모델에서 임계값을 0.9로 높게 잡는 '보수적 전략'의 리스크는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "실제 환자를 정상으로 오판(False Negative)하여 골든타임을 놓칠 수 있음", value: "fn", correct: true, requirementToken: "임계값(Threshold) 설정 시 비즈니스 오판 비용(Cost of Error)을 고려" },
                    { text: "학습 시간이 길어짐", value: "slow" }
                ],
                coduckComment: "정답입니다. 기술적 지표 뒤에 숨겨진 '사람의 생명'이나 '비용'을 보는 것이 시니어의 눈이죠."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 비즈니스 요구사항에 따른 임계값(Threshold) 설정 근거를 말한다면?",
        missionObjective: "Step 3: 실무 리스크 점검 - 예측 점수가 0.8 이하인 모호한 케이스는 '수동 검역(Reject)' 대상으로 자동 분류하는 배포 필터를 구현하세요.",
        pythonSnippets: [
            { label: '조건부 필터링', code: 'if p["score"] >= threshold:', icon: 'Check' },
            { label: '결과 리스트 추가', code: 'results.append(p)', icon: 'Download' }
        ],
        pythonTemplate: `def filter_by_threshold(predictions, threshold=0.8):
    filtered_results = []
    
    for p in predictions:
        # [Step 3-1] 실무 대응: 비즈니스 하한선 필터링
        if p['score'] >= threshold:
            # TODO: 통과된 결과 p를 추가하세요
            filtered_results.append(p)
            
            
    return filtered_results`,
        sampleData: [{ "id": 1, "score": 0.95 }, { "id": 2, "score": 0.32 }],
        expectedOutput: [{ "id": 1, "score": 0.95 }],
        failHints: {
            logic_error: "필터링이 제대로 되지 않았습니다. score >= threshold 조건을 확인하세요.",
            empty: "결과가 비어있습니다. append 로직을 확인하세요."
        },
        step4Options: [
            "저는 모델의 F1-Score를 넘어 비즈니스 기대 가치(Expected Value)를 극대화하는 임계값 설계를 지향합니다. 오판 시의 비용(Cost of Error)을 수치화하여, 정밀도가 필요한 스팸 필터와 재현율이 중요한 제어판 등 각 도메인에 최적화된 배포 정책을 적용합니다.",
            "저는 임계값을 조절해서 예측을 정확하게 만듭니다.",
            "임계값은 무조건 0.5로 설정하는 것이 공평하다고 답변하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 비즈니스 오판 비용 산정', color: 'border-indigo-500', icon: '💰', coduckMsg: "이걸 놓쳤을 때의 비용과, 잘못 잡았을 때의 비용... 어느 쪽이 더 치명적인지 계산기를 두드려봐야 합니다." },
            { id: 'b2', text: 'Step 2: 모델 예측 Confidence Score 분석', color: 'border-amber-500', icon: '🔢', coduckMsg: "모델의 확신도(Confidence) 분포를 살펴보세요. 어디까지 믿어줄 수 있을지 구간을 정해야 합니다." },
            { id: 'b3', text: 'Step 3: 도메인 맞춤 임계값(Threshold) 적용', color: 'border-rose-500', icon: '⚖️', coduckMsg: "이제 결단이 필요합니다. 비즈니스 목표에 맞춰 통과 기준(Threshold)을 냉정하게 설정하세요." },
            { id: 'b4', text: 'Step 4: 안전한 최종 예측물만 배포 승인', color: 'border-emerald-500', icon: '🏁', coduckMsg: "엄격한 기준을 통과한 안전한 예측 결과들입니다. 서비스 배포를 승인해주세요." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'filter_by_threshold',
        codeValidation: { price: 'predictions', fee1: 'threshold', fee2: 'append' },
        step4CorrectIdx: 0,
        step4SuccessFeedback: {
            title: "⚖️ 심화 분석: 비즈니스 가치 최적화",
            desc: "최고의 답변입니다! 기술적 수치(F1)를 비즈니스 언어(비용/가치)로 번역할 줄 아는 엔지니어시군요.",
            details: "임계값 튜닝은 모델을 서비스화하는 마지막 단추입니다. 상황에 맞는 트레이드오프 전략이 돋보입니다."
        },
        step4FailFeedback: {
            title: "🤔 심화 분석: 트레이드오프 리스크",
            desc: "모든 상황에 일관된 임계값(0.5나 0.9)을 적용하는 것은 위험합니다.",
            details: "오판했을 때 발생하는 리스크 비용이 도메인마다 다르기 때문입니다. 스팸 정보 보존 리스크를 다시 한번 상기해보세요."
        },
        quizOptions: [
            { text: "A. 임계값 결정은 모델링만큼 중요한 의사결정이다.", correct: true },
            { text: "B. 모든 서비스에는 임계값 0.9가 가장 안전하다.", correct: false }
        ],
        mapPos: { x: 550, y: 300 }
    },
    {
        id: 5,
        title: "개념 드리프트(Drift) 감지",
        category: "Training",
        emoji: "🌊",
        desc: "시간이 지남에 따라 변하는 데이터 분포를 감지하고 모델의 수명을 관리하는 모니터링 시스템을 설계하세요.",
        rewardXP: 450,
        subModuleTitle: "DRIFT_MONITOR",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 학습 데이터의 분포와 실제 서빙 데이터의 분포가 달라지는 현상을 무엇이라 부릅니까?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "개념 드리프트 (Concept Drift) / 데이터 드리프트", value: "drift", correct: true, requirementToken: "데이터 분포 변화를 감지하기 위한 성능 모니터링(Drift Check) 로직 설계" },
                    { text: "메모리 릭 (Memory Leak)", value: "leak" }
                ],
                coduckComment: "맞습니다! 어제의 정답이 오늘의 오답이 될 수 있는 인공지능 세계의 숙명이죠."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 드리프트를 감지했을 때 가장 먼저 실행해야 할 실무적 파이프라인 액션은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "최신 데이터를 포함한 모델 재학습(Retraining) 및 버전 업", value: "retrain", correct: true, requirementToken: "성능 저하 감지 시 최신 데이터 기반 모델 재학습(Retraining) 수행" },
                    { text: "서버를 껐다가 다시 켜기", value: "restart" }
                ],
                coduckComment: "정석적인 답변입니다. 모델도 주기적으로 수혈(데이터)이 필요하답니다."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 모델의 성능 저하(Degradation)를 어떻게 인지하고 해결하시겠습니까?",
        missionObjective: "Step 3: 실무 리스크 점검 - 예측 오차(MSE)를 실시간으로 모니터링하여 평소보다 높아지는 구간을 감지하는 로직을 완성하세요.",
        pythonSnippets: [
            { label: '오차 제곱', code: '(r - p)**2', icon: 'Zap' },
            { label: '오차 평균 산출', code: 'sum(errors) / len(real)', icon: 'Sigma' }
        ],
        pythonTemplate: `def monitor_drift_loss(real, pred):
    errors = []
    
    for r, p in zip(real, pred):
        # [Step 3-1] 모니터링 시스템의 핵심 지표 계산
        # TODO: r과 p의 차이를 제곱하여 error에 할당하세요
        error = (r - p)**2
        errors.append(error)
        
    # [Step 3-2] 드리프트 임계값 체크를 위한 최종 손실값 반환
    return sum(errors) / len(real)`,
        sampleData: [[100, 200, 150], [90, 210, 140]],
        expectedOutput: 100.0,
        failHints: {
            logic_error: "오차 계산 방식이 틀렸습니다. (실제-예측)**2 의 평균을 구해야 합니다.",
            math_error: "나누기(/)를 할 때 데이터의 전체 개수(len)로 나누었는지 확인하세요."
        },
        step4Options: [
            "저는 모델의 정적 정확도에 만족하지 않고, 'Concept Drift'를 추적하는 모니터링 시스템을 구축합니다. 특정 지표(예: MSE)의 이동 평균이 임계값을 상회할 경우 원인 분석 및 자동 재학습 파이프라인이 가동되도록 설계하여 서비스의 지속 가능성을 보장합니다.",
            "저는 오차가 커지면 모델을 다시 만듭니다.",
            "드리프트는 자연스러운 현상이니 무시해도 된다고 답변하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 서빙 로그에서 실제값과 예측값 수집', color: 'border-indigo-500', icon: '📊', coduckMsg: "현장의 목소리를 들어야 합니다. 실제 운영 로그와 모델의 예측 기록을 수집해 비교해보세요." },
            { id: 'b2', text: 'Step 2: 최신 윈도우(Window) 구간의 MSE 계산', color: 'border-amber-500', icon: '📈', coduckMsg: "최근 데이터의 오차율이 심상치 않습니다. 최근 구간(Window)의 평균 제곱 오차를 계산하세요." },
            { id: 'b3', text: 'Step 3: 과거 평균 손실과 현재치 비교', color: 'border-rose-500', icon: '⚖️', coduckMsg: "과거의 평온했던 시절과 비교해보세요. 허용 범위를 넘었다면 그것은 '변화( Drift)'의 신호입니다." },
            { id: 'b4', text: 'Step 4: 드리프트 감지 시 재학습 신호 발송', color: 'border-emerald-500', icon: '🏁', coduckMsg: "변화가 감지되었습니다! 모델 재학습 경보를 발령하고 파이프라인을 갱신합니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'monitor_drift_loss',
        codeValidation: { price: 'zip', fee1: '**2', fee2: 'sum' },
        quizOptions: [
            { text: "A. 드리프트 감지는 모델 수명 연장의 필수 요소다.", correct: true },
            { text: "B. 학습 데이터가 100% 완벽하면 드리프트는 생기지 않는다.", correct: false }
        ],
        mapPos: { x: 720, y: 450 }
    },
    {
        id: 6,
        title: "차원의 저주와 인코딩",
        category: "Preprocessing",
        emoji: "📉",
        desc: "카테고리 변수가 늘어날 때 발생하는 차원의 저주 리스크를 관리하는 효율적인 인코더를 구축하세요.",
        rewardXP: 400,
        subModuleTitle: "DIMENSION_WATCHER",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 카테고리 종류가 수백 개일 때 원-핫 인코딩(One-hot)을 남발하면 파이프라인에 생기는 비극은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "메모리 부족 및 연산 속도 급락 (차원의 저주)", value: "curse", correct: true, requirementToken: "고차원 카테고리 데이터 처리 시 Sparse Matrix 및 메모리 부족 리스크 관리" },
                    { text: "모델 가중치가 모두 0이 됨", value: "zero" }
                ],
                coduckComment: "정확합니다. 불필요하게 늘어난 0(Sparse)이 모델을 멍청하게 만들 수 있죠."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 수백 개의 카테고리를 숫자로 안전하게 바꾸기 위해 실무에서 고려하는 대안은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "차원을 축소하여 정보를 집약하는 임베딩(Embedding) 기법", value: "embed", correct: true, requirementToken: "정보 손실을 줄이면서 차원을 효율적으로 축약하는 인코딩/임베딩 전략 수립" },
                    { text: "모두 무시하고 삭제하기", value: "delete" }
                ],
                coduckComment: "훌륭해요. 복잡도를 제어하면서도 정보를 유지하는 것이 실력입니다."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 대규모 카테고리 데이터 처리 전략을 말한다면?",
        missionObjective: "Step 3: 실무 리스크 점검 - 존재하지 않는 새로운 카테고리가 입력될 경우 예외 처리([0, 0])를 수행하는 강건한 인코더를 작성하세요.",
        pythonSnippets: [
            { label: '안전한 값 조회', code: 'mapping.get(category, [0, 0])', icon: 'Download' },
            { label: '매핑 정의', code: '{"A": [1, 0], "B": [0, 1]}', icon: 'Database' }
        ],
        pythonTemplate: `def robust_encode(category):
    # [Step 3-1] 예외 상황까지 고려한 전략적 맵
    mapping = {
        "NLP": [1, 0],
        "Vision": [0, 1]
    }
    
    # [Step 3-2] 실무 리스크 대응: 처음 보는 값은 예외 처리
    # TODO: mapping.get을 사용하여 category에 대한 벡터를 반환하세요
    return mapping.get(category, [0, 0])`,
        sampleData: "NLP",
        expectedOutput: [1, 0],
        failHints: {
            logic_error: "매핑 결과가 틀렸습니다. mapping.get() 로직을 확인하세요.",
            unknown: "정의되지 않은 값에 대한 기본값([0, 0]) 처리가 되어있는지 확인하세요."
        },
        step4Options: [
            "저는 카테고리의 농도와 데이터 스케일을 종합적으로 판단합니다. 카테고리 수가 적을 땐 원-핫 인코딩의 명확성을 활용하고, '차원의 저주' 위험이 크면 임베딩이나 해싱(Hashing) 기법을 도입하여 연산 효율과 정보 보전의 균형을 맞춥니다.",
            "저는 get 메서드로 에러가 안 나게 코딩합니다.",
            "카테고리가 너무 많으면 그냥 중요한 10개만 남기고 나머지는 버립니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 전체 유니크 카테고리 수 분석', color: 'border-indigo-500', icon: '📑', coduckMsg: "카테고리가 너무 많으면 차원의 폭발이 일어납니다. 먼저 유니크한 항목이 몇 개인지 세어보세요." },
            { id: 'b2', text: 'Step 2: 차원의 저주 발생 리스크 평가', color: 'border-amber-500', icon: '⚠️', coduckMsg: "1만 개의 기둥을 세울 순 없습니다. 원-핫 인코딩의 비효율성을 경계하고 리스크를 측정하세요." },
            { id: 'b3', text: 'Step 3: 적정 인코딩 방식(One-hot/Embed) 선택', color: 'border-rose-500', icon: '🎯', coduckMsg: "안전하게 압축할 방법을 고르세요. 임베딩(Embedding)이나 해싱을 통해 정보를 밀집시켜야 합니다." },
            { id: 'b4', text: 'Step 4: 효율적인 수치화 데이터셋 생성', color: 'border-emerald-500', icon: '🏁', coduckMsg: "차원의 저주를 피했습니다! 효율적으로 압축된 수치 데이터셋으로 학습 효율을 극대화합니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'robust_encode',
        codeValidation: { price: 'mapping', fee1: 'get', fee2: 'NLP' },
        quizOptions: [
            { text: "A. 원-핫 인코딩은 범주 간의 서열을 만들지 않는다.", correct: true },
            { text: "B. 카테고리가 많을수록 0이 많아지는 희소 행렬이 생긴다.", correct: true }
        ],
        mapPos: { x: 880, y: 320 }
    },
    {
        id: 7,
        title: "불확실성(Uncertainty) 관리",
        category: "Inference",
        emoji: "🎲",
        desc: "모델이 '모르는 것'을 인정하게 만드는 신뢰할 수 있는 의사결정 파이프라인을 구축하세요.",
        rewardXP: 350,
        subModuleTitle: "FINAL_DECISION_ENGINE",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 확률 [0.35, 0.3, 0.35]처럼 모델이 갈팡질팡할 때 '자동 배포'를 강행하면 생기는 실무 리스크는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "오판 확률이 매우 높아져 서비스 신뢰도 붕괴", value: "fail", correct: true, requirementToken: "모델 예측의 불확실성이 높을 경우 자동 승인을 반려하는 안전 장치 설계" },
                    { text: "모델 용량이 커짐", value: "size" }
                ],
                coduckComment: "빙고! 이때는 '모름'이라고 인정하고 사람에게 검토를 맡기는 것이 진짜 실력이죠."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 1등 확률만 뽑는 것보다, 2등과의 차이(Margin)를 계산해야 하는 이유는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "모델이 얼마나 압도적으로 확신하는지 측정하기 위해", value: "margin", correct: true, requirementToken: "신뢰도 임계값(Margin/Confidence) 미달 시 수동 검토 프로세스 유도" },
                    { text: "수학을 좋아하는 면접관에게 잘 보이려고", value: "show" }
                ],
                coduckComment: "정확합니다. 압도적인 1위가 아니면 의사결정을 유보하는 전략이 필요하죠."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 인공지능의 의사결정 리스크를 어떻게 제어하시겠습니까?",
        missionObjective: "Step 3: 실무 리스크 점검 - 최댓값의 위치를 정확히 추출하여 최종 레이블을 확정하는 결정 엔진의 기본 로직을 구현하세요.",
        pythonSnippets: [
            { label: '최대값 검색', code: 'max(probs)', icon: 'ArrowUp' },
            { label: '최종 위치 반환', code: 'probs.index(max_val)', icon: 'Target' }
        ],
        pythonTemplate: `def get_final_prediction(probs):
    # [Step 3-1] 실무 대응: 가장 신뢰도 높은 후보 선정
    max_val = max(probs)
    
    # [Step 3-2] 파이프라인 최종 답변 확정
    # TODO: probs.index를 사용하여 max_val의 위치를 반환하세요
    return probs.index(max_val)`,
        sampleData: [0.05, 0.9, 0.05],
        expectedOutput: 1,
        failHints: {
            logic_error: "가장 높은 확률의 인덱스를 찾지 못했습니다. probs.index(max_val)를 확인하세요."
        },
        step4Options: [
            "저는 모델의 예측 결과에 '신뢰 점수(Confidence Score)'를 병행 표기하는 아키텍처를 선호합니다. 확률적 모호함이 발생할 경우 'Human-in-the-loop' 프로세스로 유도하여 시스템 전체의 안전성을 담보하는 협업 파이프라인을 구축합니다.",
            "저는 max 함수를 써서 가장 큰 점수를 고를 수 있습니다.",
            "인공지능은 어차피 틀릴 수도 있으니 다 맞다고 믿어주겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 최종 소프트맥스 확률 데이터 수집', color: 'border-indigo-500', icon: '📊', coduckMsg: "AI가 내놓은 확률분포표를 가져오세요. 숫자들 속에 AI의 망설임이 숨어 있습니다." },
            { id: 'b2', text: 'Step 2: 상위 후보 간의 격차(Entropy) 분석', color: 'border-amber-500', icon: '🔍', coduckMsg: "1등과 2등의 차이가 미미하다면 AI도 헷갈리고 있다는 뜻입니다. 그 격차(Margin)를 분석하세요." },
            { id: 'b3', text: 'Step 3: 확신도 기준 미달 시 수동 검토 분류', color: 'border-rose-500', icon: '🧑‍💻', coduckMsg: "확신이 없다면 인간에게 넘기세요. 억지로 답을 내는 것보다 '모른다'고 하는 것이 안전합니다." },
            { id: 'b4', text: 'Step 4: 기준 통과 항목에 한해 Argmax 정답 반환', color: 'border-emerald-500', icon: '🏁', coduckMsg: "검증된 확실한 정답들만 최종 출력으로 승인합니다. 사고 리스크가 통제되었습니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'get_final_prediction',
        codeValidation: { price: 'max', fee1: 'probs', fee2: 'index' },
        quizOptions: [
            { text: "A. Argmax는 다중 클래스 분류의 입을 완성한다.", correct: true },
            { text: "B. 모든 확률의 합이 1보다 크면 오버피팅된 것이다.", correct: false }
        ],
        mapPos: { x: 750, y: 150 }
    },
    {
        id: 8,
        title: "자원 최적화: 얼리 스토핑",
        category: "Optimization",
        emoji: "⏹️",
        desc: "학습 효율과 모델 수명 사이의 균형을 맞추는 저전력/고효율 가드레일 로직을 설계하세요.",
        rewardXP: 500,
        subModuleTitle: "EARLY_STOP_PROTECTOR",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 학습 세션이 너무 길어져 그래픽 카드(GPU) 자원이 낭비되고 비용이 폭증할 때 필요한 시스템은?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "개선 없을 시 자동 종료하는 얼리 스토핑 (Early Stopping)", value: "stop", correct: true, requirementToken: "자원 낭비 및 오버피팅 전조 현상 발생 시 조기 종료(Early Stopping) 기법 적용" },
                    { text: "컴퓨터 전원 강제로 끄기", value: "power" }
                ],
                coduckComment: "합리적이네요. 에너지와 비용을 아끼는 것도 훌륭한 엔지니어링의 일환입니다."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 얼리 스토핑 기준 손실값이 0.1, 0.11, 0.12처럼 조금씩 '오를 때' 바로 멈추지 않고 좀 더 기다려야 하는 이유는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "모델이 로컬 미니마(Local Minima)를 벗어날 기회를 주기 위해 (인내심)", value: "local", correct: true, requirementToken: "일시적 정체 구간(Patience)을 감안한 유연한 종료 기준 수립" },
                    { text: "내가 코딩을 덜 하고 싶어서", value: "lazy" }
                ],
                coduckComment: "맞습니다. 일시적인 정체를 넘어 진정한 '수렴'인지 판단할 시간을 줘야 하죠."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 대규모 모델 학습 시 자원 관리와 오버피팅 대응 전략은?",
        missionObjective: "Step 3: 실무 리스크 점검 - 손실값 개선이 없는 에포크가 3회(Patience) 지속되면 학습 중단 신호(True)를 보내는 감시 모듈을 완성하세요.",
        pythonSnippets: [
            { label: '실패 카운트 증가', code: 'no_improve_count += 1', icon: 'Plus' },
            { label: '중단 여부 체크', code: 'if no_improve_count >= patience:', icon: 'Stop' }
        ],
        pythonTemplate: `def check_early_stopping(loss_history, patience=3):
    best_loss = float('inf')
    no_improve_count = 0
    
    for loss in loss_history:
        if loss < best_loss:
            best_loss = loss
            no_improve_count = 0
        else:
            # [Step 3-1] 실무 대응: 정체 구간 카운트 개시
            # TODO: no_improve_count를 1 증가시키세요
            no_improve_count += 1
            
        # [Step 3-2] 파이프라인 중단 신호 조건
        if no_improve_count >= patience:
            return True
            
    return False`,
        sampleData: [0.5, 0.4, 0.41, 0.42, 0.43],
        expectedOutput: true,
        failHints: {
            logic_error: "조기 종료 조건이 발동되지 않았습니다. patience 범위를 확인하세요."
        },
        step4Options: [
            "저는 학습 모델이 스스로 학습 종료 시점을 결정하도록 'Early Stopping'과 'Callback' 구조를 설계합니다. 이를 통해 오버피팅을 방지할 뿐만 아니라, 클라우드 컴퓨팅 비용을 약 20% 절감하는 실무적인 가치를 창출합니다.",
            "저는 숫자를 세는 변수를 써서 3이 되면 멈추게 합니다.",
            "학습은 무조건 끝까지 해서 가장 좋은 결과만 남기는 게 최선이라고 답변하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 매 에포크마다 검증 손실(Val Loss) 기록', color: 'border-indigo-500', icon: '📝', coduckMsg: "학습 과정을 꼼꼼히 기록하세요. 손실(Loss) 그래프의 기울기가 어디로 향하는지 지켜봐야 합니다." },
            { id: 'b2', text: 'Step 2: 이전 최저치와의 성능 향상 폭 비교', color: 'border-amber-500', icon: '⚖️', coduckMsg: "어제보다 나아졌나요? 성능이 제자리걸음이라면 자원 낭비의 신호일 수 있습니다." },
            { id: 'b3', text: 'Step 3: 정체 구간 누적 및 인내 한계점(Patience) 체크', color: 'border-rose-500', icon: '⏳', coduckMsg: "조금만 더 기다려줄까요? 하지만 약속된 인내심(Patience)이 바닥나면 과감히 멈춰야 합니다." },
            { id: 'b4', text: 'Step 4: 최적 시점에서 학습 중단 및 모델 덤프', color: 'border-emerald-500', icon: '🏁', coduckMsg: "최적의 순간에 멈췄습니다! 과적합(Overfitting)을 막고 자원을 절약한 현명한 결정입니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'check_early_stopping',
        codeValidation: { price: 'loss', fee1: 'count', fee2: 'patience' },
        quizOptions: [
            { text: "A. 얼리 스토핑은 규제화(Regularization) 기법 중 하나다.", correct: true },
            { text: "B. 손실 함수가 0이 될 때까지 돌리는 게 기본이다.", correct: false }
        ],
        mapPos: { x: 550, y: 480 }
    },
    {
        id: 9,
        title: "강화학습: 동적 최적화",
        category: "Reinforcement Learning",
        emoji: "🕹️",
        desc: "주변 환경과 상호작용하며 스스로 정답을 찾아가는 RL 에이전트의 모험과 활용의 법칙을 설계하세요.",
        rewardXP: 600,
        subModuleTitle: "RL_EXPLORATION_UNIT",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 정해진 라벨 없이 로봇이 행동하고 '보상(Reward)'을 받는 파이프라인을 무엇이라 합니까?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "강화 학습 (Reinforcement Learning)", value: "rl", correct: true, requirementToken: "환경과의 상호작용 및 보상(Reward) 시스템 기반의 최적 정책 학습 엔진 설계" },
                    { text: "지도 학습 (Supervised Learning)", value: "supervised" }
                ],
                coduckComment: "훌륭한 정의입니다. 스스로 시행착오를 겪으며 성장하는 엔진이죠."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 에이전트가 항상 '최선'이라고 판단한 길로만 가지 않고 가끔 랜덤한 길을 가야 하는 이유는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "현재 모르는 더 큰 보석(Global Optimum)이 숨어있을 수 있기 때문에", value: "explore", correct: true, requirementToken: "탐색(Exploration)과 활용(Exploitation)의 균형을 맞추는 메커니즘 구축" },
                    { text: "인공지능도 가끔은 쉬고 싶기 때문", value: "rest" }
                ],
                coduckComment: "멋집니다! 이 '탐험' 없이는 영원히 지역적인 최선(Local Optima)에 갇히게 됩니다."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 불확실한 환경에서 최적의 전략을 찾아가는 과정을 STAR로 말한다면?",
        missionObjective: "Step 3: 실무 리스크 점검 - 에이전트가 매너리즘에 빠지지 않도록 epsilon 확률에 따라 무작위로 모험을 떠나는 로직을 완성하세요.",
        pythonSnippets: [
            { label: '탐험 (무작위)', code: 'random.randint(0, n-1)', icon: 'Compass' },
            { label: '활용 (최적)', code: 'q_values.index(max(q_values))', icon: 'Target' }
        ],
        pythonTemplate: `import random
def choose_smart_action(epsilon, q_values):
    # [Step 3-1] 실무 대응: 확률적 모험(Exploration) 가동
    if random.random() < epsilon:
        # TODO: 리스트 q_values 길이 내에서 랜덤 행동 인덱스 반환
        return random.randint(0, len(q_values)-1)
        
    # [Step 3-2] 축적된 지식 기반 활용(Exploitation)
    return q_values.index(max(q_values))`,
        sampleData: [[0.0, [0.1, 0.7, 0.2]], [1.0, [0.1, 0.7, 0.2]]], // epsilon=0.0(활용), epsilon=1.0(탐험)
        expectedOutput: 1, // epsilon=0.0 일 때의 결과 (q_values[1]이 최대)
        // 실제로는 무작위성이 있어 검증이 어렵지만, epsilon=0일 때를 기준으로 테스트
        failHints: {
            logic_error: "조건부 탐험(Exploration) 로직이 부정확합니다."
        },
        step4Options: [
            "저는 변화하는 환경 속에서 최적의 결정을 도출하기 위해 'Exploration vs Exploitation'의 균형을 중시합니다. 학습 초반엔 탐험 범위를 넓히는 엡실론-그리디 전략을 통해 잠재적 기회를 발견하고, 점진적으로 지식 우위의 결정을 내려 파이프라인의 수익률을 20% 개선했습니다.",
            "저는 랜덤 기능을 써서 모델이 모험하게 만들 수 있습니다.",
            "모험은 초보자만 하는 것이니 학습 후반엔 무조건 최적의 길로만 가라고 답변하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 주변 환경(State) 관찰 및 수집', color: 'border-indigo-500', icon: '👀', coduckMsg: "눈을 크게 뜨고 주변을 살피세요. 현재 상황(State)이 어떤지 파악하는 게 모험의 첫걸음입니다." },
            { id: 'b2', text: 'Step 2: 보상 지형도를 그리는 Q-Network 학습', color: 'border-amber-500', icon: '🗺️', coduckMsg: "어디로 가야 보상을 받을까요? 경험을 통해 마음속에 가치 지도(Q-Table)를 그려나갑니다." },
            { id: 'b3', text: 'Step 3: 엡실론 확률 기반 모험(Explore) 결정', color: 'border-rose-500', icon: '🌀', coduckMsg: "가던 길로만 가면 발전이 없습니다. 주사위를 굴려 가끔은 낯선 길로 모험(Explore)을 떠나세요!" },
            { id: 'b4', text: 'Step 4: 행동 실행 및 보상 피드백 루프 순환', color: 'border-emerald-500', icon: '🏁', coduckMsg: "행동의 결과를 받아들이고 성장했습니다. 끊임없는 시행착오가 당신을 최적의 길로 인도할 것입니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'choose_smart_action',
        codeValidation: { price: 'random', fee1: 'epsilon', fee2: 'index' },
        quizOptions: [
            { text: "A. RL은 경험을 통해 직접 정책을 학습한다.", correct: true },
            { text: "B. 강화학습은 항상 정답 데이터셋이 필요하다.", correct: false }
        ],
        mapPos: { x: 350, y: 620 }
    },
    {
        id: 10,
        title: "개인정보(PII) 정화 토크나이저",
        category: "NLP",
        emoji: "🔒",
        desc: "실습 데이터를 안전하게 전처리하고 핵심 토큰만 추출하는 고성능 텍스트 파이프라인을 완성하세요.",
        rewardXP: 400,
        subModuleTitle: "SECURE_TEXT_PURIFIER",
        character: { name: "Coduck", image: "/assets/characters/coduck.png" },
        interviewQuestions: [
            {
                id: "q1",
                question: "Step 1: E2E 뼈대 - 언어 모델 학습 전, 이메일이나 전화번호 같은 기밀 정보를 처리하는 필수 전처리 단계는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "개인정보 식별 및 마스킹 (De-identification)", value: "masking", correct: true, requirementToken: "민감 정보(PII) 유출 방지를 위한 강력한 데이터 마스킹 전략 수립" },
                    { text: "크게 읽고 암기하기", value: "read" }
                ],
                coduckComment: "훌륭한 보안 의식입니다! 신뢰할 수 있는 데이터 수집이 모델의 토대니까요."
            },
            {
                id: "q2",
                question: "Step 2: 상세화 - 정규표현식으로 기호를 지울 때 '공백'만 남기고 소문자로 통일하는 이유는?",
                options: [
                    /* [수정일: 2026-02-04] 설계 연동을 위한 토큰 추가 */
                    { text: "Apple, apple, APPLE!? 을 하나의 동일한 의미 단위로 묶기 위해", value: "normalize", correct: true, requirementToken: "의미적 일관성 확보를 위한 텍스트 정규화(Normalization) 전처리 수행" },
                    { text: "소문자가 더 귀여워서", value: "cute" }
                ],
                coduckComment: "정확합니다. 의미적 정규화를 통해 모델의 어휘집(Vocabulary) 효율을 극대화하는 것이죠."
            }
        ],
        quizTitle: "Step 4: 면접 답변 정제 - 자연어 처리 파이프라인의 데이터 보안과 품질 관리 경험을 말한다면?",
        missionObjective: "Step 3: 실무 리스크 점검 - 정규식을 사용하여 특수문자 노이즈를 제거하고 유효한 단어 토큰만 추출하는 정화 필터를 구현하세요.",
        pythonSnippets: [
            { label: '정규식 필터', code: 're.sub(r"[^\\w\\s]", "", text)', icon: 'Scissors' },
            { label: '공백 제거 및 토큰화', code: 'text.lower().split()', icon: 'Filter' }
        ],
        pythonTemplate: `import re
def secure_tokenize(text):
    # [Step 3-1] 서비스 노이즈 및 특수기호 일괄 소거
    # TODO: re.sub를 사용하여 text에서 기호를 빈 문자열로 바꾸세요
    text = re.sub(r'[^\w\s]', '', text)
    
    # [Step 3-2] 언어적 정규화(소문자화)
    tokens = text.lower().split()
    
    # [Step 3-3] 최종 무결성 토큰 리스트 반환
    return [t for t in tokens if t.strip()]`,
        sampleData: "Secure AI! 2026...",
        expectedOutput: ["secure", "ai", "2026"],
        failHints: {
            logic_error: "토큰화 결과가 예상과 다릅니다. 정규식과 lower().split()을 확인하세요."
        },
        step4Options: [
            "저는 텍스트 전처리 단계에서 정규표현식을 활용해 데이터 무결성을 확보합니다. 특히 개인정보(PII) 노출 리스크를 원천 차단하는 마스킹 전략을 최우선으로 하며, 정규화된 토큰 추출을 통해 모델의 수렴 속도를 인덱싱 기준 15% 단축시킨 경험이 있습니다.",
            "저는 소문자로 바꾸고 기호를 지우는 코드를 잘 짭니다.",
            "데이터가 지저분하면 모델이 잘 못 배우니까 무조건 깨끗하게 닦는다고 대답하겠습니다."
        ],
        cards: [
            { id: 'b1', text: 'Step 1: 법적 가이드라인에 따른 PII 식별', color: 'border-indigo-500', icon: '📝', coduckMsg: "개인정보는 타협할 수 없는 영역입니다. 이름, 전화번호 같은 민감 정보(PII)를 먼저 식별하세요." },
            { id: 'b2', text: 'Step 2: 정규식 기반 기호 및 기밀 정보 소거', color: 'border-amber-500', icon: '🧹', coduckMsg: "정밀한 규칙(Regex)으로 개인정보를 흔적도 없이 지워버리세요. 보안 사고를 원천 차단해야 합니다." },
            { id: 'b3', text: 'Step 3: 유효 단어별 토큰화 및 어휘집 매핑', color: 'border-rose-500', icon: '✂️', coduckMsg: "이제 남은 텍스트를 의미 단위(Token)로 잘게 쪼개어 AI가 이해할 수 있는 사전으로 만듭니다." },
            { id: 'b4', text: 'Step 4: 보안이 강화된 학습용 코퍼스 배포', color: 'border-emerald-500', icon: '🏁', coduckMsg: "개인정보가 깨끗이 세탁된 안전한 데이터셋입니다! 이제 안심하고 학습을 시작해도 좋습니다." }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        functionName: 'secure_tokenize',
        codeValidation: { price: 're', fee1: 'sub', fee2: 'lower' },
        quizOptions: [
            { text: "A. NLP 전처리는 모델의 언어 이해력을 결정한다.", correct: true },
            { text: "B. 특수문자가 많을수록 감성 분석이 무조건 쉬워진다.", correct: false }
        ],
        mapPos: { x: 150, y: 530 }
    }
];
