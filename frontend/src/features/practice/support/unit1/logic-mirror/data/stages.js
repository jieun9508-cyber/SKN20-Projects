export const aiQuests = [
    {
        id: 1,
        title: "오염된 뉴스 정화",
        category: "NLP",
        emoji: "🚫",
        desc: "불필요한 광고성 데이터와 노이즈를 제어하는 정화 모듈을 완성하세요.",
        rewardXP: 500,
        subModuleTitle: "DATA_CLEANER",
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
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
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
        title: "로그인 인증 시스템",
        category: "Auth",
        emoji: "🔐",
        desc: "아이디와 비밀번호가 일치하는지 확인하는 로직을 조립하세요.",
        rewardXP: 100,
        // [수정일: 2026-01-31] 인터랙티브 요구사항 인터뷰 데이터 추가
        interviewQuestions: [
            {
                id: "q1",
                question: "안전한 로그인 시스템을 위해 가장 먼저 정의해야 할 정책은 무엇일까요?",
                options: [
                    { text: "아이디와 비밀번호의 일치 여부 검증", value: "auth", correct: true },
                    { text: "화려한 로그인 화면 디자인", value: "ui" },
                    { text: "모든 사용자의 비밀번호 공개", value: "leak" }
                ],
                coduckComment: "정확합니다. 인증(Authentication)의 핵심은 등록된 정보와 입력된 정보가 일치하는지 논리적으로 판별하는 것입니다."
            },
            {
                id: "q2",
                question: "만약 아이디는 맞는데 비밀번호가 틀리다면 어떻게 처리해야 할까요?",
                options: [
                    { text: "아이디가 맞으니 로그인 성공", value: "pass" },
                    { text: "둘 다 맞아야 하므로 로그인 거부", value: "reject", correct: true },
                    { text: "비밀번호를 새로 만들어줌", value: "reset" }
                ],
                coduckComment: "논리가 완벽하시네요! 보안 시스템에서는 모든 조건이 '참(True)'일 때만 관문을 열어주어야 합니다."
            }
        ],
        quizTitle: "보안 시스템의 논리 구조 중 가장 적절한 것은?",
        missionObjective: "사용자 로그인 인증 로직의 핵심 규칙을 설계하세요: ① 아이디가 'lion'이어야 함 ② 비밀번호가 '1234'여야 함 (두 조건이 모두 충족될 때만 성공).",
        pythonTemplate: `def login_check(user_id, user_pw):
    # TODO: 아이디가 'lion'이고 비밀번호가 '1234'인지 확인하는 조건문 작성
    # 힌트: user_id == "lion" and user_pw == "1234"
    
    return False`,
        pythonSnippets: [
            { label: '아이디 확인', code: 'user_id == "lion"', icon: 'Cpu' },
            { label: '비밀번호 확인', code: 'user_pw == "1234"', icon: 'Award' },
            { label: '로그인 성공', code: 'return True', icon: 'CodeIcon' }
        ],
        step4Options: [
            "보안을 위해 모든 접속 시도를 무조건 차단한다.",
            "잘못된 입력이 반복될 경우 일시적으로 계정을 잠금 처리한다.",
            "비밀번호를 화면에 그대로 노출시킨다.",
            "아무나 로그인할 수 있게 로직을 삭제한다."
        ],
        cards: [
            { id: 'b1', text: '만약 아이디 == "lion" 이면:', color: 'border-indigo-500', icon: '❓' },
            { id: 'b2', text: '    만약 비밀번호 == "1234" 이면:', color: 'border-indigo-500', icon: '❓' },
            { id: 'b3', text: '        반환 "성공"', color: 'border-emerald-500', icon: '✅' },
            { id: 'b4', text: '    아니면:', color: 'border-indigo-500', icon: '🔄' },
            { id: 'b5', text: '        반환 "실패"', color: 'border-rose-500', icon: '❌' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: 'lion', fee1: '1234', fee2: 'Success' },
        quizOptions: [
            { text: "A. 비밀번호가 틀려도 성공 처리한다.", correct: false },
            { text: "B. and 연산자를 사용하여 한 줄로 합칠 수 있다.", correct: true },
            { text: "C. 아이디 확인은 생략한다.", correct: false }
        ],
        mapPos: { x: 200, y: 150 }
    },
    {
        id: 3,
        title: "재고 관리 알림",
        category: "Inventory",
        emoji: "📦",
        desc: "재고가 부족할 때 주문 알림을 보내는 로직을 만듭니다.",
        rewardXP: 120,
        cards: [
            { id: 'b1', text: '만약 현재_수량 <= 10 이면:', color: 'border-indigo-500', icon: '❓' },
            { id: 'b2', text: '    알림_보내기("재고 부족")', color: 'border-amber-500', icon: '🔔' },
            { id: 'b3', text: '    반환 "주문 필요"', color: 'border-emerald-500', icon: '🛒' },
            { id: 'b4', text: '아니면:', color: 'border-indigo-500', icon: '🔄' },
            { id: 'b5', text: '    반환 "재고 충분"', color: 'border-emerald-500', icon: '✨' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '10', fee1: 'Alert', fee2: 'Safe' },
        quizOptions: [
            { text: "A. 수량이 0일 때만 주문한다.", correct: false },
            { text: "B. 최소 기준값을 상수로 관리하면 유지보수가 쉽다.", correct: true },
            { text: "C. 알림은 항상 보낸다.", correct: false }
        ],
        mapPos: { x: 350, y: 250 }
    },
    {
        id: 4,
        title: "기온별 옷차림 추천",
        category: "Service",
        emoji: "🌡️",
        desc: "날씨에 따라 적절한 의상을 추천하는 AI입니다.",
        rewardXP: 150,
        cards: [
            { id: 'b1', text: '만약 기온 >= 28 이면:', color: 'border-indigo-500', icon: '☀️' },
            { id: 'b2', text: '    추천 = "반팔"', color: 'border-emerald-500', icon: '👕' },
            { id: 'b3', text: '아니고_만약 기온 >= 15 이면:', color: 'border-indigo-500', icon: '☁️' },
            { id: 'b4', text: '    추천 = "맨투맨"', color: 'border-emerald-500', icon: '🧥' },
            { id: 'b5', text: '그외: 추천 = "패딩"', color: 'border-rose-500', icon: '❄️' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '28', fee1: 'Shorts', fee2: 'Coat' },
        quizOptions: [
            { text: "A. 모든 기온에서 반팔만 추천한다.", correct: false },
            { text: "B. elif(아니고 만약)를 사용해 여러 구간을 나눈다.", correct: true },
            { text: "C. 조건의 순서는 상관없다.", correct: false }
        ],
        mapPos: { x: 500, y: 350 }
    },
    {
        id: 5,
        title: "평균 제곱 오차 (MSE)",
        category: "AI Basic",
        emoji: "📈",
        desc: "예측값과 실제값의 차이를 계산하는 인공지능 기초입니다.",
        rewardXP: 180,
        cards: [
            { id: 'b1', text: '오차 = 실제 - 예측', color: 'border-indigo-500', icon: '➖' },
            { id: 'b2', text: '제곱_오차 = 오차 ** 2', color: 'border-amber-500', icon: '✖️' },
            { id: 'b3', text: '오차_총합에 더하기', color: 'border-emerald-500', icon: '➕' },
            { id: 'b4', text: '전체 개수로 나누기', color: 'border-indigo-500', icon: '➗' },
            { id: 'b5', text: '최종 MSE 반환', color: 'border-amber-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '10', fee1: '8', fee2: '4' },
        quizOptions: [
            { text: "A. 음수 오차를 없애기 위해 제곱을 사용한다.", correct: true },
            { text: "B. 오차는 항상 0이어야 한다.", correct: false },
            { text: "C. 제곱 대신 절대값을 써도 되지만 미분은 어렵다.", correct: true }
        ],
        mapPos: { x: 650, y: 250 }
    },
    {
        id: 6,
        title: "배달비 자동 계산",
        category: "Logistics",
        emoji: "🚚",
        desc: "주문 금액이 5만원 이상이면 배달비가 무료입니다.",
        rewardXP: 200,
        cards: [
            { id: 'b1', text: '만약 주문_금액 >= 50000 이면:', color: 'border-indigo-500', icon: '❓' },
            { id: 'b2', text: '    배달비 = 0', color: 'border-emerald-500', icon: '💰' },
            { id: 'b3', text: '아니면:', color: 'border-indigo-500', icon: '🔄' },
            { id: 'b4', text: '    배달비 = 2500', color: 'border-emerald-500', icon: '💰' },
            { id: 'b5', text: '최종 배달비 반환', color: 'border-amber-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '50000', fee1: '0', fee2: '2500' },
        quizOptions: [
            { text: "A. 거리에 따른 할증을 고려하지 않았다.", correct: true },
            { text: "B. 5만원 미만도 무료로 해준다.", correct: false },
            { text: "C. 배달비 변수를 먼저 선언하면 더 깔끔하다.", correct: true }
        ],
        mapPos: { x: 800, y: 150 }
    },
    {
        id: 7,
        title: "최대값 찾기",
        category: "Algorithm",
        emoji: "🔝",
        desc: "숫자 리스트에서 가장 큰 값을 찾는 기본 알고리즘입니다.",
        rewardXP: 220,
        cards: [
            { id: 'b1', text: '최댓값 = 목록[0]', color: 'border-indigo-500', icon: '0️⃣' },
            { id: 'b2', text: '반복: 목록의 단일_값에 대해:', color: 'border-indigo-500', icon: '🔁' },
            { id: 'b3', text: '    만약 단일_값 > 최댓값 이면:', color: 'border-amber-500', icon: '❓' },
            { id: 'b4', text: '        최댓값 = 단일_값', color: 'border-emerald-500', icon: '✅' },
            { id: 'b5', text: '최종 최댓값 반환', color: 'border-amber-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: 'lists', fee1: 'compare', fee2: 'max' },
        quizOptions: [
            { text: "A. 처음 값을 최댓값으로 가정하고 시작한다.", correct: true },
            { text: "B. 모든 정렬 알고리즘은 최댓값을 찾는다.", correct: false },
            { text: "C. 빈 리스트일 경우 에러가 날 수 있다.", correct: true }
        ],
        mapPos: { x: 700, y: 450 }
    },
    {
        id: 8,
        title: "연속 출석 체크",
        category: "Service",
        emoji: "📅",
        desc: "하루라도 빠지면 초기화되는 스트릭 시스템을 만듭니다.",
        rewardXP: 250,
        cards: [
            { id: 'b1', text: '만약 오늘_방문 == 참 이면:', color: 'border-indigo-500', icon: '✅' },
            { id: 'b2', text: '    연속_일수 += 1', color: 'border-emerald-500', icon: '🔥' },
            { id: 'b3', text: '아니면:', color: 'border-indigo-500', icon: '❌' },
            { id: 'b4', text: '    연속_일수 = 0', color: 'border-rose-500', icon: '❄️' },
            { id: 'b5', text: '연속_일수 반환', color: 'border-amber-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: 'True', fee1: 'streak+1', fee2: '0' },
        quizOptions: [
            { text: "A. 방문하지 않아도 일수를 늘린다.", correct: false },
            { text: "B. '그외(else)' 섹션이 초기화의 핵심이다.", correct: true },
            { text: "C. 데이터베이스 저장 로직이 추가로 필요하다.", correct: true }
        ],
        mapPos: { x: 550, y: 550 }
    },
    {
        id: 9,
        title: "스마트 점등 제어",
        category: "IoT",
        emoji: "💡",
        desc: "주변 밝기에 따라 전등을 자동으로 켜고 끕니다.",
        rewardXP: 280,
        cards: [
            { id: 'b1', text: '만약 조도_센서 < 100 이면:', color: 'border-indigo-500', icon: '🌑' },
            { id: 'b2', text: '    전등.상태 = "ON"', color: 'border-emerald-500', icon: '💡' },
            { id: 'b3', text: '아니고_만약 조도_센서 > 500 이면:', color: 'border-indigo-500', icon: '☀️' },
            { id: 'b4', text: '    전등.상태 = "OFF"', color: 'border-rose-500', icon: '🌑' },
            { id: 'b5', text: '상태 메시지 반환', color: 'border-amber-500', icon: '🏁' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '100', fee1: 'ON', fee2: 'OFF' },
        quizOptions: [
            { text: "A. 100~500 사이일 때는 이전 상태를 유지한다.", correct: true },
            { text: "B. 센서 값이 600이면 등이 켜진다.", correct: false },
            { text: "C. 센서 오차를 줄이기 위해 평균값을 쓸 수 있다.", correct: true }
        ],
        mapPos: { x: 400, y: 650 }
    },
    {
        id: 10,
        title: "비밀번호 안전성",
        category: "Security",
        emoji: "🛡️",
        desc: "길이가 너무 짧은 비밀번호를 거르는 보안 로직입니다.",
        rewardXP: 300,
        cards: [
            { id: 'b1', text: '길이 = 문자열_길이(비번)', color: 'border-indigo-500', icon: '📏' },
            { id: 'b2', text: '만약 길이 < 8 이면:', color: 'border-indigo-500', icon: '❓' },
            { id: 'b3', text: '    반환 "위험(Security Low)"', color: 'border-rose-500', icon: '🚨' },
            { id: 'b4', text: '아니면:', color: 'border-indigo-500', icon: '🔄' },
            { id: 'b5', text: '    반환 "안전(Security High)"', color: 'border-emerald-500', icon: '✅' }
        ],
        solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
        codeValidation: { price: '8', fee1: 'Low', fee2: 'High' },
        quizOptions: [
            { text: "A. 길이만 체크하는 것은 충분하지 않다.", correct: true },
            { text: "B. 특수문자 포함 여부도 체크하면 더 좋다.", correct: true },
            { text: "C. 짧은 비밀번호가 더 기억하기 쉽고 안전하다.", correct: false }
        ],
        mapPos: { x: 250, y: 550 }
    }
];
