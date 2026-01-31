export const aiQuests = [
    {
        id: 1,
        title: "오염된 뉴스 정화",
        category: "NLP",
        emoji: "🚫",
        desc: "불필요한 광고성 데이터와 노이즈를 제어하는 정화 모듈을 완성하세요.",
        rewardXP: 500,
        subModuleTitle: "DATA_CLEANER",
        // [수정일: 2026-01-31] 캐릭터 메타데이터 분리 (하드코딩 제거)
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        // [수정일: 2026-01-31] 인터랙티브 요구사항 인터뷰 데이터 추가
        interviewQuestions: [
            {
                id: "q1",
                question: "정화 로직을 설계하기 전에, 어떤 데이터를 '오염물'로 정의하면 좋을까요?",
                options: [
                    { text: "단순히 짧은 뉴스 제목", value: "short" },
                    { text: "광고성 문구나 클릭 유도 문구가 포함된 뉴스", value: "ad", correct: true },
                    { text: "오래된 날짜의 뉴스", value: "old" }
                ],
                coduckComment: "맞습니다! '광고'나 '클릭' 같은 키워드가 포함된 데이터는 시스템 성능을 저하시키는 주요 오염원입니다."
            },
            {
                id: "q2",
                question: "정화 과정에서 유효한 정보까지 삭제되는 '과적합'을 피하려면 어떤 기준이 필요할까요?",
                options: [
                    { text: "모든 광고 단어를 무조건 삭제", value: "strict" },
                    { text: "제목의 길이를 고려하여 문맥이 없는 것만 삭제", value: "context", correct: true },
                    { text: "전처리를 하지 않고 내버려둠", value: "none" }
                ],
                coduckComment: "훌륭한 분석입니다. 데이터의 유실을 최소화하면서 노이즈만 걷어내는 보수적인 접근이 엔지니어링의 핵심이죠."
            }
        ],
        quizTitle: "AI 성능을 저하시키는 데이터 오염을 막기 위한 첫 번째 단계는?",
        missionObjective: "리스트에 담긴 뉴스 제목들 중 다음 조건에 해당하는 데이터를 '제거(skip)'하는 로직을 작성하세요: ① 제목이 5자 미만인 경우 ② '광고' 또는 '클릭'이라는 단어가 포함된 경우.",
        pythonSnippets: [
            { label: '조건 제외 (건너뛰기)', code: 'continue', icon: 'RotateCcw' },
            { label: '데이터 저장 (추가)', code: 'cleaned_data.append(news)', icon: 'CodeIcon' },
            { label: '아무것도 안 함 (통과)', code: 'pass', icon: 'X' }
        ],
        pythonTemplate: `def clean_news_data(news_list):
    cleaned_data = []

    for news in news_list:
        # [Step 3-1] 필터 조건: 5자 미만 또는 "광고" 포함
        if len(news) < 5 or "광고" in news:
            # TODO: 여기에 건너뛰기 로직 작성 (힌트: continue)
            
            
        # [Step 3-2] 정화된 데이터 추가
        # TODO: news를 결과에 추가 (힌트: append)
        

    return cleaned_data`,
        sampleData: [
            "삼성전자 주가 급등",
            "광고) 지금 바로 클릭하세요",
            "날씨",
            "AI 모델의 미래 전망",
            "초특가 광고 상품 안내"
        ],
        step4Options: [
            "모든 광고성 단어를 수동으로 검수한다.",
            "문맥을 분석하는 고도화된 AI 필터를 도입한다.",
            "전처리를 생략하고 모델의 성능에 맡긴다.",
            "긴 뉴스는 무조건 삭제한다."
        ],
        cards: [
            { id: 'b1', text: '반복: 뉴스_목록의 뉴스에 대해:', color: 'border-indigo-500', icon: '🔁' },
            { id: 'b2', text: '    만약 뉴스가 "광고"를 포함하면:', color: 'border-amber-500', icon: '❗' },
            { id: 'b3', text: '        건너뛰기(continue)', color: 'border-rose-500', icon: '⏭️' },
            { id: 'b4', text: '    정화된_목록에 뉴스 추가', color: 'border-emerald-500', icon: '✨' },
            { id: 'b5', text: '정화된_목록 반환', color: 'border-emerald-500', icon: '✅' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'news_list', fee1: 'continue', fee2: 'append' },
        quizOptions: [
            { text: "A. 모든 광고 데이터를 수동으로 지운다.", correct: false },
            { text: "B. 반복문과 조건문을 통해 자동화할 수 있다.", correct: true },
            { text: "C. 데이터가 적을 때는 처리하지 않아도 된다.", correct: false }
        ],
        mapPos: { x: 100, y: 450 }
    },
    {
        id: 2,
        title: "라벨링 노이즈 검수",
        category: "Data Quality",
        emoji: "🔎",
        desc: "이미지 태그와 라벨이 일치하지 않는 '노이즈' 데이터를 격리하여 데이터셋의 신뢰도를 높이세요.",
        rewardXP: 300,
        subModuleTitle: "NOISE_DETECTOR",
        // [수정일: 2026-01-31] 퀘스트 2는 사자 캐릭터로 설정
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "이미지는 '개'인데 라벨이 '고양이'로 되어 있다면 모델에 어떤 영향을 줄까요?",
                options: [
                    { text: "모델이 혼란에 빠져 정확도가 떨어진다", value: "drop", correct: true },
                    { text: "모델이 알아서 걸러내므로 상관없다", value: "ignore" }
                ],
                coduckComment: "정답입니다! 'Garbage In, Garbage Out'. 잘못된 정답은 모델을 바보로 만듭니다."
            },
            {
                id: "q2",
                question: "노이즈 데이터를 발견했을 때 가장 전문적인 대처 방법은 무엇입니까?",
                options: [
                    { text: "보이는 대로 즉시 삭제한다", value: "delete" },
                    { text: "노이즈를 격리하고 분포를 분석한다", value: "analyze", correct: true },
                    { text: "더 많은 데이터를 넣어 노이즈를 덮는다", value: "more" }
                ],
                coduckComment: "훌륭합니다. 노이즈의 발생 원인을 알아야 근본적인 데이터 품질을 개선할 수 있죠."
            }
        ],
        quizTitle: "데이터 품질을 결정짓는 라벨링 일관성을 확보하려면?",
        missionObjective: "데이터 리스트를 순회하며 img_tag와 label이 다른 데이터의 인덱스를 찾아 noise_indices 리스트에 추가하세요.",
        pythonSnippets: [
            { label: '인덱스와 값 추출', code: 'enumerate(data_list)', icon: 'List' },
            { label: '불일치 감지 (노이즈)', code: 'data["img_tag"] != data["label"]', icon: 'AlertCircle' },
            { label: '인덱스 저장', code: 'noise_indices.append(i)', icon: 'Hash' }
        ],
        pythonTemplate: `def find_label_noise(data_list):
    noise_indices = []

    for i, data in enumerate(data_list):
        # [Step 3-1] 노이즈 데이터 감지 조건
        if data['img_tag'] != data['label']:
            # TODO: 여기에 인덱스 i를 추가하는 로직 작성 (힌트: append)
            
    
    return noise_indices`,
        sampleData: [
            { "img_tag": "dog", "label": "dog" },
            { "img_tag": "cat", "label": "dog" },
            { "img_tag": "bird", "label": "bird" },
            { "img_tag": "lion", "label": "tiger" },
            { "img_tag": "fish", "label": "fish" }
        ],
        step4Options: [
            "노이즈 데이터를 무작위로 수정한다.",
            "노이즈가 발생한 구간의 센서나 로깅 시스템을 재검토한다.",
            "데이터를 더 많이 수집하여 노이즈 비중을 낮꾼다.",
            "노이즈 데이터를 학습 데이터에 그대로 사용한다."
        ],
        cards: [
            { id: 'b1', text: '반복: 데이터_목록의 (인덱스, 데이터)에 대해:', color: 'border-indigo-500', icon: '🔁' },
            { id: 'b2', text: '    만약 데이터["태그"] != 데이터["라벨"] 이면:', color: 'border-amber-500', icon: '❓' },
            { id: 'b3', text: '        노이즈_목록에 인덱스 추가', color: 'border-rose-500', icon: '📍' },
            { id: 'b4', text: '노이즈_목록 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'data_list', fee1: 'noise_indices', fee2: 'append' },
        quizOptions: [
            { text: "A. 노이즈는 학습에 무조건 해가 된다.", correct: false },
            { text: "B. 규칙 기반 검수로 1차적 노이즈를 제어할 수 있다.", correct: true },
            { text: "C. 데이터가 100만 건 이상이면 노이즈는 무시해도 된다.", correct: false }
        ],
        mapPos: { x: 230, y: 350 }
    },
    {
        id: 3,
        title: "데이터셋 셔플링 프로토콜",
        category: "Bias Control",
        emoji: "🔀",
        desc: "데이터 편향(Bias)을 방지하기 위해 데이터셋의 순서를 무작위로 섞는 셔플러를 설계하세요.",
        rewardXP: 300,
        subModuleTitle: "BIAS_CONTROLLER",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "정렬된 데이터를 그대로 학습시키면 모델은 어떤 문제를 겪게 될까요?",
                options: [
                    { text: "최신 데이터만 기억하는 편향이 생길 수 있다", value: "bias", correct: true },
                    { text: "데이터 순서와 성능은 무관하다", value: "none" }
                ],
                coduckComment: "날카로운 지적입니다. 특정 데이터가 몰려나오면 모델은 그 순서조차 특징으로 학습해버릴 수 있어요."
            }
        ],
        quizTitle: "학습 편향을 방지하기 위한 가장 기본적인 전처리는?",
        missionObjective: "가져온 데이터셋의 인덱스를 무작위로 재배열하여 셔플링된 리스트를 반환하세요.",
        pythonSnippets: [
            { label: '랜덤 인덱스 생성', code: 'list(range(len(data)))', icon: 'List' },
            { label: '무작위 섞기', code: 'random.shuffle(indices)', icon: 'Shuffle' }
        ],
        pythonTemplate: `import random
def shuffle_dataset(data):
    indices = list(range(len(data)))
    
    # [Step 3-1] 인덱스 무작위 섞기
    # TODO: random.shuffle을 사용해 indices를 섞으세요
    
    
    # [Step 3-2] 섞인 인덱스로 데이터 재구성
    return [data[i] for i in indices]`,
        sampleData: ["A", "B", "C", "D", "E"],
        step4Options: [
            "항상 같은 순서로 데이터를 공급한다.",
            "매 에포크(Epoch)마다 데이터를 다시 섞어준다.",
            "데이터를 절반으로 나누어 뒤집는다.",
            "파일 이름 순서대로 정렬하여 공급한다."
        ],
        cards: [
            { id: 'b1', text: '인덱스_목록 생성 (0부터 데이터_길이까지)', color: 'border-indigo-500', icon: '📋' },
            { id: 'b2', text: '인덱스_목록을 무작위로 섞기', color: 'border-amber-500', icon: '🔀' },
            { id: 'b3', text: '섞인_인덱스 순서대로 새 리스트 구성', color: 'border-emerald-500', icon: '✨' },
            { id: 'b4', text: '셔플된_리스트 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'random', fee1: 'shuffle', fee2: 'indices' },
        quizOptions: [
            { text: "A. 데이터는 항상 정렬되어 있어야 한다.", correct: false },
            { text: "B. 셔플링을 통해 모델의 일반화 성능을 높일 수 있다.", correct: true },
            { text: "C. 작은 데이터셋에서는 셔플링이 필요 없다.", correct: false }
        ],
        mapPos: { x: 380, y: 150 }
    },
    {
        id: 4,
        title: "분류 임계값(Threshold) 컨트롤",
        category: "Evaluation",
        emoji: "⚖️",
        desc: "모델의 예측 정확도를 보장하기 위해 확신도 임계값을 조절하는 수문장 로직을 구현하세요.",
        rewardXP: 400,
        subModuleTitle: "THRESHOLD_TUNER",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "임계값(Threshold)을 너무 높게 설정하면 어떤 현상이 발생할까요?",
                options: [
                    { text: "성능은 좋아지지만 통과되는 데이터가 너무 적어진다", value: "strict", correct: true },
                    { text: "예측 속도가 느려진다", value: "slow" }
                ],
                coduckComment: "맞습니다. '정밀도'는 높아지지만 '재현율'이 떨어지는 트레이드오프 상황이죠."
            }
        ],
        quizTitle: "신중한 인공지능을 만들기 위한 필터링 기준은?",
        missionObjective: "Confidence Score가 설정된 threshold(0.8) 이상인 예측값만 선별하여 리스트를 반환하세요.",
        pythonSnippets: [
            { label: '리스트 내포 활용', code: '[p for p in predictions if p["score"] >= threshold]', icon: 'Code' },
            { label: '조건문 필터링', code: 'if p["score"] >= threshold:', icon: 'Check' }
        ],
        pythonTemplate: `def filter_by_threshold(predictions, threshold=0.8):
    filtered_results = []
    
    for p in predictions:
        # [Step 3-1] 확신도 점수가 임계값 이상인지 확인
        if p['score'] >= threshold:
            # TODO: 여기에 통과된 결과 p를 filtered_results에 추가하세요
            
            
    return filtered_results`,
        sampleData: [
            { "id": 1, "score": 0.95 },
            { "id": 2, "score": 0.32 },
            { "id": 3, "score": 0.81 },
            { "id": 4, "score": 0.77 }
        ],
        step4Options: [
            "임계값은 무조건 1.0으로 설정한다.",
            "도메인의 특성에 맞춰 최적의 임계값을 실험적으로 찾는다.",
            "모든 예측을 성공으로 간주한다.",
            "임계값을 계속해서 낮춘다."
        ],
        cards: [
            { id: 'b1', text: '반복: 예측_리스트의 결과물 p에 대해:', color: 'border-indigo-500', icon: '🔁' },
            { id: 'b2', text: '    만약 p의 확신도 >= 임계값 이면:', color: 'border-amber-500', icon: '❓' },
            { id: 'b3', text: '        필터된_리스트에 p 추가', color: 'border-emerald-500', icon: '✅' },
            { id: 'b4', text: '필터된_리스트 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'predictions', fee1: 'threshold', fee2: 'append' },
        quizOptions: [
            { text: "A. 임계값은 고정된 값이다.", correct: false },
            { text: "B. 비즈니스 목적에 따라 임계값을 유연하게 조정한다.", correct: true },
            { text: "C. 점수가 낮아도 일단 다 저장한다.", correct: false }
        ],
        mapPos: { x: 550, y: 300 }
    },
    {
        id: 5,
        title: "손실 함수(MSE) 오디터",
        category: "Training",
        emoji: "📉",
        desc: "모델의 예측값과 실제값 사이의 오차를 계산하는 인공지능의 '나침반', MSE를 구현하세요.",
        rewardXP: 450,
        subModuleTitle: "LOSS_MONITOR",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "오차를 계산할 때 그냥 빼지 않고 '제곱'을 하는 이유는 무엇일까요?",
                options: [
                    { text: "음수 값을 없애고 큰 오차를 더 크게 부각시키기 위해", value: "square", correct: true },
                    { text: "숫자를 크게 만들어 보기 좋게 하려고", value: "big" }
                ],
                coduckComment: "완벽해요! 제곱을 하면 큰 실수는 훨씬 더 아픈 벌이 되어 모델이 더 긴장하게 됩니다."
            }
        ],
        quizTitle: "모델이 잘 배우고 있는지 측정하는 핵심 도구는?",
        missionObjective: "실제값(real)과 예측값(pred) 리스트를 받아 평균 제곱 오차(MSE)를 계산하세요.",
        pythonSnippets: [
            { label: '제곱 오차 계산', code: '(r - p)**2', icon: 'Zap' },
            { label: '오차 합계', code: 'sum(errors) / len(real)', icon: 'Sigma' }
        ],
        pythonTemplate: `def calculate_mse(real, pred):
    errors = []
    
    for r, p in zip(real, pred):
        # [Step 3-1] 오차 제곱 계산
        # TODO: r과 p의 차이를 제곱하여 error 변수에 할당하세요
        error = (r - p)**2
        errors.append(error)
        
    # [Step 3-2] 평균 계산
    return sum(errors) / len(real)`,
        sampleData: [10, 20, 30],
        step4Options: [
            "손실값이 낮을수록 모델이 정답에 가깝다는 뜻이다.",
            "손실값은 학습 중에만 확인하면 된다.",
            "오차는 무조건 0이어야 좋은 모델이다.",
            "제곱 대신 절대값을 사용하면 미분이 불가능하다."
        ],
        cards: [
            { id: 'b1', text: '실제값과 예측값을 순서대로 묶기', color: 'border-indigo-500', icon: '🔗' },
            { id: 'b2', text: '    각 쌍의 차이를 구하고 제곱하기', color: 'border-amber-500', icon: '✖️' },
            { id: 'b3', text: '제곱된 오차들의 합을 전체 개수로 나누기', color: 'border-rose-500', icon: '➗' },
            { id: 'b4', text: '최종 MSE값 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'zip', fee1: '**2', fee2: 'sum' },
        quizOptions: [
            { text: "A. 손실 함수가 0이면 학습을 더 할 필요가 없다.", correct: true },
            { text: "B. MSE는 범주형 분류에 더 유리하다.", correct: false },
            { text: "C. 오차가 작을수록 모델은 과적합된다.", correct: false }
        ],
        mapPos: { x: 720, y: 450 }
    },
    {
        id: 6,
        title: "범주형 데이터 인코더",
        category: "Preprocessing",
        emoji: "🔢",
        desc: "텍스트 카테고리를 숫자로 변환하는 One-hot Encoding 로직을 통해 데이터를 수치화하세요.",
        rewardXP: 400,
        subModuleTitle: "CATEGORY_ENCODER",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "컴퓨터는 'NLP', 'Vision' 같은 글자를 바로 이해할 수 있을까요?",
                options: [
                    { text: "아니오, 오직 숫자(Vector)로만 이해합니다", value: "no", correct: true },
                    { text: "네, 현대 AI는 글자를 그대로 이해합니다", value: "yes" }
                ],
                coduckComment: "빙고! 그래서 우리는 글자에 고유한 번호를 부여하거나 벡터로 바꿔줘야 합니다."
            }
        ],
        quizTitle: "비정형 텍스트 데이터를 정형 데이터로 바꾸는 과정은?",
        missionObjective: "'NLP'는 [1, 0], 'Vision'은 [0, 1]로 매핑하는 인코딩 함수를 작성하세요.",
        pythonSnippets: [
            { label: '딕셔너리 매핑', code: 'mapping = {"NLP": [1, 0], "Vision": [0, 1]}', icon: 'Database' },
            { label: '값 가져오기', code: 'mapping.get(category, [0, 0])', icon: 'Download' }
        ],
        pythonTemplate: `def one_hot_encode(category):
    # [Step 3-1] 매핑 딕셔너리 정의
    # TODO: 'NLP': [1, 0], 'Vision': [0, 1] 로 매핑하세요
    mapping = {
        "NLP": [1, 0],
        "Vision": [0, 1]
    }
    
    # [Step 3-2] 해당하는 벡터 반환 (없으면 [0, 0])
    return mapping.get(category, [0, 0])`,
        sampleData: ["NLP", "Vision", "Other"],
        step4Options: [
            "모든 카테고리에 순서대로 1, 2, 3 번호를 매긴다.",
            "One-hot 표현은 카테고리 간의 순서 관계가 없을 때 유용하다.",
            "단어의 의미를 보존하기 위해 스펠링을 숫자로 바꾼다.",
            "카테고리가 100만 개일 때는 One-hot 인코딩이 비효율적이다."
        ],
        cards: [
            { id: 'b1', text: '카테고리별 벡터 매핑 표 생성', color: 'border-indigo-500', icon: '📑' },
            { id: 'b2', text: '입력된 카테고리가 표에 있는지 확인', color: 'border-amber-500', icon: '❓' },
            { id: 'b3', text: '매칭되는 벡터값 추출', color: 'border-emerald-500', icon: '🎯' },
            { id: 'b4', text: '인코딩된 결과 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'mapping', fee1: 'NLP', fee2: 'get' },
        quizOptions: [
            { text: "A. 원-핫 인코딩은 차원의 저주를 유발할 수 있다.", correct: true },
            { text: "B. 텍스트는 무조건 원-핫 인코딩만 가능하다.", correct: false },
            { text: "C. 순서가 중요한 데이터는 레이블 인코딩을 쓴다.", correct: true }
        ],
        mapPos: { x: 880, y: 320 }
    },
    {
        id: 7,
        title: "소프트맥스 아비터(Arbiter)",
        category: "Inference",
        emoji: "🎯",
        desc: "여러 확률 중 가장 높은 값을 선택하는 Argmax 로직을 통해 AI의 최종 의사결정을 확정하세요.",
        rewardXP: 350,
        subModuleTitle: "FINAL_DECISION_ENGINE",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "소프트맥스 출력 결과가 [0.1, 0.7, 0.2] 라면 어떤 클래스로 판정해야 할까요?",
                options: [
                    { text: "가장 높은 확률인 두 번째(index 1)", value: "max", correct: true },
                    { text: "다 합쳐서 평균을 낸다", value: "avg" }
                ],
                coduckComment: "정확합니다. 인공지능이 가장 자신 있어 하는 후보를 최종 정답으로 채택하는 것이죠."
            }
        ],
        quizTitle: "확률 리스트에서 AI의 최종 선택을 추출하는 방법은?",
        missionObjective: "실수형 확률 리스트에서 최대값의 인덱스를 찾아 반환하는 함수를 완성하세요.",
        pythonSnippets: [
            { label: '최대값 찾기', code: 'max(probs)', icon: 'ArrowUp' },
            { label: '인덱스 추출', code: 'probs.index(max_val)', icon: 'Target' }
        ],
        pythonTemplate: `def get_final_prediction(probs):
    # [Step 3-1] 리스트에서 가장 높은 확률값 찾기
    max_val = max(probs)
    
    # [Step 3-2] 해당 값의 위치(index) 반환
    # TODO: probs.index()를 사용해 max_val의 위치를 반환하세요
    return probs.index(max_val)`,
        sampleData: [0.1, 0.8, 0.1],
        step4Options: [
            "Argmax는 가장 자신 있는 정답 하나만 고른다.",
            "확률이 비슷할 경우 두 개를 모두 선택한다.",
            "확률의 총합은 항상 1이어야 한다.",
            "인덱스는 1부터 시작한다."
        ],
        cards: [
            { id: 'b1', text: '결과 확률 목록 스캔', color: 'border-indigo-500', icon: '🔍' },
            { id: 'b2', text: '목록에서 가장 큰 값(Max Value) 찾기', color: 'border-amber-500', icon: '🔝' },
            { id: 'b3', text: '그 값이 위치한 순번(Index) 기록', color: 'border-emerald-500', icon: '📍' },
            { id: 'b4', text: '최종 인덱스 번호 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'max', fee1: 'probs', fee2: 'index' },
        quizOptions: [
            { text: "A. Argmax는 다중 분류의 마지막 단계다.", correct: true },
            { text: "B. 소프트맥스 결과값은 항상 음수가 섞인다.", correct: false },
            { text: "C. 가장 낮은 값을 찾는 것은 Argmin이다.", correct: true }
        ],
        mapPos: { x: 750, y: 150 }
    },
    {
        id: 8,
        title: "얼리 스토핑 가디언",
        category: "Optimization",
        emoji: "🛑",
        desc: "모델 성능이 더 이상 좋아지지 않을 때 학습을 멈춰 과적합(Overfitting)을 방지하는 똑똑한 중단 로직을 만드세요.",
        rewardXP: 500,
        subModuleTitle: "EARLY_STOP_PROTECTOR",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "학습을 무작정 오래 시키면 어떤 부작용이 생길까요?",
                options: [
                    { text: "모델이 정답만 외우는 '과적합' 상태가 되어 버린다", value: "over", correct: true },
                    { text: "모델의 지능이 무한대로 높아진다", value: "infinite" }
                ],
                coduckComment: "날카롭군요! 융통성 없는 모델이 되지 않으려면 적절한 시점에 멈추는 미덕이 필요합니다."
            }
        ],
        quizTitle: "학습 자원 효율화와 모델 성능 보호를 위한 로직은?",
        missionObjective: "성능 향상이 없는 연속 횟수가 patience(3)에 도달하면 True를 반환하게 하세요.",
        pythonSnippets: [
            { label: '카운트 증가', code: 'no_improve_count += 1', icon: 'PlusSquare' },
            { label: '조건부 중단', code: 'if no_improve_count >= patience:', icon: 'StopCircle' }
        ],
        pythonTemplate: `def check_early_stopping(loss_history, patience=3):
    best_loss = float('inf')
    no_improve_count = 0
    
    for loss in loss_history:
        if loss < best_loss:
            best_loss = loss
            no_improve_count = 0
        else:
            # [Step 3-1] 성능 향상 실패 카운트 증가
            # TODO: no_improve_count를 1 늘리세요
            no_improve_count += 1
            
        # [Step 3-2] 인내심 한계 도달 체크
        if no_improve_count >= patience:
            return True
            
    return False`,
        sampleData: [0.5, 0.4, 0.45, 0.46, 0.47],
        step4Options: [
            "얼리 스토핑은 시간 낭비를 줄여준다.",
            "학습 데이터가 부족할 때만 사용한다.",
            "Patience 값이 너무 작으면 학습이 너무 일찍 끝난다.",
            "검증 손실(Validation Loss)을 기준으로 작동하는 것이 정석이다."
        ],
        cards: [
            { id: 'b1', text: '현재까지의 최저 손실값 기록', color: 'border-indigo-500', icon: '📝' },
            { id: 'b2', text: '새 손실이 이전 최저치보다 낮지 않으면:', color: 'border-amber-500', icon: '❓' },
            { id: 'b3', text: '    연속 정체 횟수 1 증가', color: 'border-rose-500', icon: '➕' },
            { id: 'b4', text: '정체 횟수가 기준치 이상이면 중단 신호(True) 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'loss', fee1: 'count', fee2: 'patience' },
        quizOptions: [
            { text: "A. 얼리 스토핑은 규제(Regularization)의 일종이다.", correct: true },
            { text: "B. 손실이 조금이라도 오르면 즉시 멈춰야 한다.", correct: false },
            { text: "C. Patience는 사용자가 정하는 하이퍼파라미터다.", correct: true }
        ],
        mapPos: { x: 550, y: 480 }
    },
    {
        id: 9,
        title: "앱실론-그리디RL 에이전트",
        category: "Reinforcement Learning",
        emoji: "🤖",
        desc: "에이전트가 알려진 최선의 길을 갈지, 새로운 가능성을 탐험(Exploration)할지 결정하는 RL의 핵심 논리를 설계하세요.",
        rewardXP: 600,
        subModuleTitle: "RL_EXPLORATION_UNIT",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "강화학습 에이전트가 항상 '최선'이라고 아는 길로만 가면 어떻게 될까요?",
                options: [
                    { text: "더 좋은 길을 찾을 기회를 영영 놓칠 수 있다", value: "stuck", correct: true },
                    { text: "가장 빠르고 효율적으로 학습한다", value: "fast" }
                ],
                coduckComment: "정확합니다! 때로는 모험(Exploration)을 해야 지름길을 찾아낼 수 있죠."
            }
        ],
        quizTitle: "지능적인 에이전트의 '모험과 활용' 사이의 균형을 맞추는 방법은?",
        missionObjective: "랜덤값(random.random())이 epsilon보다 작으면 무작위 행동을, 아니면 최적의 행동을 선택하세요.",
        pythonSnippets: [
            { label: '탐험 (랜덤)', code: 'random.randint(0, n-1)', icon: 'Compass' },
            { label: '활용 (최적)', code: 'q_values.index(max(q_values))', icon: 'Target' }
        ],
        pythonTemplate: `import random
def choose_action(epsilon, q_values):
    # [Step 3-1] 탐험 확률 체크
    if random.random() < epsilon:
        # TODO: 리스트 q_values의 길이 내에서 랜덤 인덱스를 반환하세요
        return random.randint(0, len(q_values)-1)
        
    # [Step 3-2] 최적 행동 선택 (가장 높은 Q값의 위치)
    return q_values.index(max(q_values))`,
        sampleData: [0.1, 0.5, 0.4],
        step4Options: [
            "Epsilon 값이 1.0이면 항상 모험만 한다.",
            "학습 후반부로 갈수록 Epsilon을 낮춰 안정성을 높인다.",
            "모험은 초보 에이전트에게만 필요하다.",
            "Q-value는 경험을 통해 업데이트되는 지식 지도다."
        ],
        cards: [
            { id: 'b1', text: '주사위를 굴려 랜덤값 생성', color: 'border-indigo-500', icon: '🎲' },
            { id: 'b2', text: '만약 랜덤값 < 모험_확률 이면:', color: 'border-amber-500', icon: '❓' },
            { id: 'b3', text: '    아무 행동이나 무작위로 선택', color: 'border-rose-500', icon: '🌀' },
            { id: 'b4', text: '아니면: 현재 가장 평가가 좋은 행동 선택', color: 'border-emerald-500', icon: '🎯' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 'random', fee1: 'epsilon', fee2: 'index' },
        quizOptions: [
            { text: "A. RL 에이전트는 경험을 통해 배운다.", correct: true },
            { text: "B. 앱실론은 탐험과 활용의 트레이드오프를 조절한다.", correct: true },
            { text: "C. 랜덤 행동은 학습에 방해만 된다.", correct: false }
        ],
        mapPos: { x: 350, y: 620 }
    },
    {
        id: 10,
        title: "스마트 텍스트 정화기",
        category: "NLP",
        emoji: "✂️",
        desc: "정규표현식을 활용하여 특수문자와 노이즈를 제거하는 고성능 텍스트 전처리 파이프라인을 구축하세요.",
        rewardXP: 400,
        subModuleTitle: "TEXT_PURIFIER",
        character: {
            name: "Coduck",
            image: "/assets/characters/coduck.png"
        },
        interviewQuestions: [
            {
                id: "q1",
                question: "텍스트에 섞인 '!!!', '???' 같은 특수문자를 제거해야 하는 이유는 무엇일까요?",
                options: [
                    { text: "의미 없는 노이즈가 단어로 인식되어 성능을 방해하기 때문", value: "noise", correct: true },
                    { text: "컴퓨터가 특수문자를 읽으면 고장 나기 때문", value: "break" }
                ],
                coduckComment: "정답입니다. 핵심적인 '단어'들만 남겨야 모델이 문맥을 더 명확히 파악할 수 있죠."
            }
        ],
        quizTitle: "비정규적인 언어 데이터를 정규화하기 위한 최적의 도구는?",
        missionObjective: "re.sub를 사용해 특수문자를 제거하고, 공백으로 나눈 뒤 소문자로 변환한 토큰 리스트를 만드세요.",
        pythonSnippets: [
            { label: '특수문자 제거', code: 're.sub(r"[^\\w\\s]", "", text)', icon: 'Scissors' },
            { label: '필터링된 리스트', code: '[t for t in tokens if t.strip()]', icon: 'Filter' }
        ],
        pythonTemplate: `import re
def clean_tokenize(text):
    # [Step 3-1] 특수문자 제거 (알파벳, 숫자, 공백 제외)
    # TODO: re.sub를 사용해 text에서 기호를 빈 문자열로 바꾸세요
    text = re.sub(r'[^\w\s]', '', text)
    
    # [Step 3-2] 소문자 변환 및 분절
    tokens = text.lower().split()
    
    # [Step 3-3] 비어있지 않은 토큰만 선별
    return [t for t in tokens if t.strip()]`,
        sampleData: ["Wait! AI is Great...", "No way???"],
        step4Options: [
            "정규표현식을 익히면 텍스트 정제가 매우 쉬워진다.",
            "불용어(Stopwords)를 제거하면 성능이 더 좋아질 수 있다.",
            "이모지는 데이터 분석에 절대 활용할 수 없다.",
            "토큰화 결과는 형태소 분석기에 따라 달라질 수 있다."
        ],
        cards: [
            { id: 'b1', text: '원본 문장 스캔', color: 'border-indigo-500', icon: '📄' },
            { id: 'b2', text: '정규식을 사용하여 기호/특수문자 걷어내기', color: 'border-amber-500', icon: '🧹' },
            { id: 'b3', text: '모든 글자를 소문자로 바꾸고 공백 기준 분리', color: 'border-emerald-500', icon: '✂️' },
            { id: 'b4', text: '유효한 단어 토큰 리스트 반환', color: 'border-emerald-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4'],
        codeValidation: { price: 're', fee1: 'sub', fee2: 'lower' },
        quizOptions: [
            { text: "A. 전처리는 모델 개발 시간의 80%를 차지하기도 한다.", correct: true },
            { text: "B. 특수문자는 보존하는 것이 항상 좋다.", correct: false },
            { text: "C. 토큰화는 NLP 파이프라인의 입구와 같다.", correct: true }
        ],
        mapPos: { x: 150, y: 530 }
    }
];
