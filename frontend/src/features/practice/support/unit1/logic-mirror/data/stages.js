export const aiQuests = [
    // LV1 - AI 기초 연산 (순차/선택)
    {
        id: 'quest_ai_01',
        level: 1,
        title: '인공 뉴런 만들기',
        description: 'AI의 가장 기본 단위인 뉴런(Perceptron)은 입력값에 가중치를 곱하고 편향을 더해 계산합니다. 이 수식을 완성하세요.',
        logic_type: '순차 (Weighted Sum)',
        emoji: '🧠',
        rewardXP: 100,
        examples: '● IN: x=2, w=3, b=1\n● OUT: y = 2*3 + 1 = 7',
        cards: [
            {
                id: 'a1',
                text_ko: '입력(x)과 가중치(w)를 곱한다',
                text_py: 'weighted = x * w',
                icon: '✖️',
                color: 'blue',
                action: 'multiply'
            },
            {
                id: 'a2',
                text_ko: '결과에 편향(b)을 더한다',
                text_py: 'y = weighted + b',
                icon: '➕',
                color: 'green',
                action: 'add_bias'
            },
            {
                id: 'a3',
                text_ko: '최종 결과(y)를 다음 층으로 보낸다',
                text_py: 'return y',
                icon: '🚀',
                color: 'purple',
                action: 'return_val'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 0 }],
            execution: {
                function_name: "perceptron",
                test_cases: [{ input: "2, 3, 1", expected: "7", type: "public" }],
                implementation_hint: {
                    main: "일차함수 y = wx + b 랑 똑같다꽥!",
                    sub: "입력에 가중치를 곱하는게 AI 연산의 시작이꽥."
                }
            },
            reasoning: {
                question: '여기서 편향(Bias)을 더하는 이유는 무엇일까요?',
                options: ['입력이 0일 때도 출력을 조절하기 위해', '계산을 어렵게 하기 위해', '메모리를 늘리기 위해', '아무 의미 없음'],
                correctIndex: 0
            },
            feedback: {
                success: '축하합니다! 첫 번째 인공 뉴런이 깨어났습니다.',
                failure: '순서가 꼬였습니다. 곱하기 먼저, 더하기 나중입니다!',
                hint: '기울기(w)를 먼저 적용하고 절편(b)을 더해야 합니다.'
            },
            interviewQuestions: []
        }
    },
    {
        id: 'quest_ai_02',
        level: 1,
        title: '활성화 함수 (ReLU)',
        description: '뉴런의 출력이 0보다 작으면 무시하고, 0보다 크면 그대로 내보내는 ReLU(Rectified Linear Unit) 함수를 구현하세요.',
        logic_type: '선택 (Activation)',
        emoji: '📈',
        rewardXP: 150,
        examples: '● IN: -5 -> OUT: 0\n● IN: 3 -> OUT: 3',
        cards: [
            {
                id: 'a1',
                text_ko: '입력값(x)을 받는다',
                text_py: 'def relu(x):',
                icon: '📥',
                color: 'blue',
                action: 'def'
            },
            {
                id: 'a2',
                text_ko: '만약 x가 0보다 크다면',
                text_py: 'if x > 0:',
                icon: '❓',
                color: 'purple',
                isCondition: true,
                action: 'check_pos'
            },
            {
                id: 'a3',
                text_ko: '    x를 그대로 반환한다',
                text_py: '    return x',
                icon: '✅',
                color: 'green',
                indent: 1,
                action: 'return_x'
            },
            {
                id: 'a4',
                text_ko: '아니라면 (0 이하라면)',
                text_py: 'else:',
                icon: '🛑',
                color: 'orange',
                isCondition: true,
                action: 'else_case'
            },
            {
                id: 'a5',
                text_ko: '    0을 반환한다',
                text_py: '    return 0',
                icon: '0️⃣',
                color: 'red',
                indent: 1,
                action: 'return_zero'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 0 }, { id: 'a5', indent: 1 }],
            execution: {
                function_name: "relu",
                test_cases: [{ input: "-10", expected: "0", type: "public" }, { input: "5", expected: "5", type: "hidden" }],
                implementation_hint: {
                    main: "음수는 죽이고 양수는 살리는게 ReLU의 핵심이꽥!",
                    sub: "if x > 0 조건을 잘 활용해보꽥."
                }
            },
            reasoning: {
                question: 'ReLU 함수를 사용하여 음수를 0으로 만드는 효과는?',
                options: ['데이터를 선형적으로 만든다', '불필요한 신호를 차단하여 비선형성을 확보한다', '계산 속도를 늦춘다', '항상 1을 출력한다'],
                correctIndex: 1
            },
            feedback: {
                success: '비선형성 확보 완료! 딥러닝의 핵심 부품입니다.',
                failure: '음수가 통과되면 안 됩니다. 조건을 확인하세요.',
                hint: '0보다 작은 값은 가차없이 0으로 만들어야 합니다.'
            },
            interviewQuestions: []
        }
    },

    // LV2 - 학습의 원리 (오차와 최적화)
    {
        id: 'quest_ai_03',
        level: 2,
        title: '오차 측정하기 (Loss)',
        description: 'AI가 예측한 값과 실제 정답 사이의 차이(오차)를 구해보세요. 음수가 나오지 않게 제곱을 사용합니다.',
        logic_type: '순차 (MSE 기초)',
        emoji: '📉',
        rewardXP: 200,
        examples: '● IN: predict=10, target=14\n● OUT: diff=-4, loss=16',
        cards: [
            {
                id: 'a1',
                text_ko: '예측값(y)에서 정답(t)을 뺀다',
                text_py: 'diff = y - t',
                icon: '➖',
                color: 'blue',
                action: 'sub'
            },
            {
                id: 'a2',
                text_ko: '차이를 제곱하여 부호를 없앤다',
                text_py: 'loss = diff * diff',
                icon: '✖️',
                color: 'purple',
                action: 'square'
            },
            {
                id: 'a3',
                text_ko: '오차값(loss)을 보고한다',
                text_py: 'return loss',
                icon: '📊',
                color: 'green',
                action: 'return'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 0 }],
            execution: {
                function_name: "calc_loss",
                test_cases: [{ input: "10, 14", expected: "16", type: "public" }],
                implementation_hint: {
                    main: "틀린 만큼 벌점을 주는게 Loss 함수다꽥!",
                    sub: "제곱을 하면(-4 * -4 = 16) 오차가 양수로 변환된다꽥."
                }
            },
            reasoning: {
                question: '오차를 단순히 더하지 않고 제곱하는 이유는?',
                options: ['음수 오차와 양수 오차가 서로 상쇄되는 것을 막기 위해', '숫자를 크게 만들기 위해', '컴퓨터가 제곱을 좋아해서', '랜덤한 값을 얻기 위해'],
                correctIndex: 0
            },
            feedback: {
                success: '오차 계산 완료! 이제 얼마나 틀렸는지 알게 되었습니다.',
                failure: '순서가 중요합니다. 뺀 다음에 제곱해야 합니다.',
                hint: '차이(diff)를 먼저 구해야 제곱할 수 있습니다.'
            },
            interviewQuestions: []
        }
    },
    {
        id: 'quest_ai_04',
        level: 2,
        title: '가중치 업데이트 (경사하강)',
        description: '오차를 줄이기 위해 가중치(w)를 아주 조금 수정하는 "학습" 단계를 구현하세요.',
        logic_type: '순차 (Optimization)',
        emoji: '📉',
        rewardXP: 250,
        examples: '● IN: w=2.0, grad=0.1, lr=0.01\n● OUT: w=1.999',
        cards: [
            {
                id: 'a1',
                text_ko: '현재 기울기(grad)에 학습률(lr)을 곱한다',
                text_py: 'step = grad * lr',
                icon: '👣',
                color: 'blue',
                action: 'calc_step'
            },
            {
                id: 'a2',
                text_ko: '기존 가중치(w)에서 step을 뺀다',
                text_py: 'w = w - step',
                icon: '↘️',
                color: 'green',
                action: 'update'
            },
            {
                id: 'a3',
                text_ko: '업데이트된 가중치를 저장한다',
                text_py: 'save_weight(w)',
                icon: '💾',
                color: 'purple',
                action: 'save'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 0 }],
            execution: {
                function_name: "update_weight",
                test_cases: [{ input: "2.0, 0.1, 0.1", expected: "1.99", type: "public" }],
                implementation_hint: {
                    main: "경사를 따라 조금씩 내려가는게 학습이다꽥!",
                    sub: "너무 많이 이동하면 낭떠러지로 떨어지니 학습률(lr)을 곱해주는거다꽥."
                }
            },
            reasoning: {
                question: '학습률(Learning Rate)이 너무 크면 어떤 문제가 생길까요?',
                options: ['학습 속도가 너무 느려진다', '정답을 건너뛰고 값이 발산(Explode)할 수 있다', '오차가 0이 된다', '메모리가 부족해진다'],
                correctIndex: 1
            },
            feedback: {
                success: '학습 성공! AI가 조금 더 똑똑해졌습니다.',
                failure: '가중치는 기울기 반대 방향(-)으로 이동해야 합니다.',
                hint: '기울기가 양수면 w를 줄이고, 음수면 w를 늘려야 합니다 (w - step).'
            },
            interviewQuestions: []
        }
    },

    // LV3 - 데이터 처리 (리스트/반복)
    {
        id: 'quest_ai_05',
        level: 3,
        title: '학습 반복 (Epochs)',
        description: 'AI는 한 번만 공부해서는 안 됩니다. 지정된 횟수만큼 반복해서 학습(train) 시키세요.',
        logic_type: '반복 (Training Loop)',
        emoji: '🔄',
        rewardXP: 300,
        examples: '● IN: epochs=5\n● OUT: 학습 5회 완료',
        cards: [
            {
                id: 'a1',
                text_ko: '반복 횟수 변수(i)를 0으로 초기화',
                text_py: 'i = 0',
                icon: '0️⃣',
                color: 'blue',
                action: 'init'
            },
            {
                id: 'a2',
                text_ko: 'i가 목표 횟수(epochs)보다 작은 동안',
                text_py: 'while i < epochs:',
                icon: '🔁',
                color: 'purple',
                isLoop: true,
                action: 'loop'
            },
            {
                id: 'a3',
                text_ko: '    모델을 1회 학습시킨다',
                text_py: '    model.train_one_step()',
                icon: '🏋️',
                color: 'green',
                indent: 1,
                action: 'train'
            },
            {
                id: 'a4',
                text_ko: '    반복 횟수(i)를 1 증가시킨다',
                text_py: '    i = i + 1',
                icon: '➕',
                color: 'orange',
                indent: 1,
                action: 'inc'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 1 }],
            execution: {
                function_name: "training_loop",
                test_cases: [{ input: "3", expected: "'Done'", type: "public" }],
                implementation_hint: {
                    main: "데이터셋을 한 번 다 보는걸 1 에폭(Epoch)이라고 한다꽥!",
                    sub: "반복문 안에서 훈련(train)과 카운트 증가(i+1)를 놓치지 마꽥."
                }
            },
            reasoning: {
                question: '에폭(Epoch)을 무조건 많이 늘리면 좋을까요?',
                options: ['무조건 좋다', '시간만 낭비되고 성능은 똑같다', '과적합(Overfitting)되어 새로운 문제에 약해질 수 있다', '컴퓨터가 고장난다'],
                correctIndex: 2
            },
            feedback: {
                success: '끈기 있는 학습! 모델 성능이 향상되고 있습니다.',
                failure: '반복 횟수를 세지 않으면 무한 루프에 빠집니다!',
                hint: 'while 문 안에서 i를 증가시켜야 언젠가 끝납니다.'
            },
            interviewQuestions: []
        }
    },
    {
        id: 'quest_ai_06',
        level: 3,
        title: '배치 처리 (Mini-batch)',
        description: '데이터를 하나씩 처리하면 느립니다. 여러 개(배치)를 한꺼번에 묶어서 예측하세요.',
        logic_type: '리스트 반복 (Batch)',
        emoji: '📦',
        rewardXP: 350,
        examples: '● IN: batch=[1, 2, 3]\n● OUT: results=[2, 4, 6]',
        cards: [
            {
                id: 'a1',
                text_ko: '결과를 담을 빈 리스트 생성',
                text_py: 'results = []',
                icon: '🗑️',
                color: 'blue',
                action: 'init_list'
            },
            {
                id: 'a2',
                text_ko: '배치 안의 각 데이터(x)에 대해',
                text_py: 'for x in batch_data:',
                icon: '🔁',
                color: 'purple',
                isLoop: true,
                action: 'loop'
            },
            {
                id: 'a3',
                text_ko: '    AI 모델로 예측값(y)을 구한다',
                text_py: '    y = model.predict(x)',
                icon: '🤖',
                color: 'green',
                indent: 1,
                action: 'predict'
            },
            {
                id: 'a4',
                text_ko: '    예측값을 결과 리스트에 추가',
                text_py: '    results.append(y)',
                icon: '📥',
                color: 'orange',
                indent: 1,
                action: 'append'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 1 }],
            execution: {
                function_name: "batch_process",
                test_cases: [{ input: "[1,2,3]", expected: "[2,4,6]", type: "public" }],
                implementation_hint: {
                    main: "GPU는 한꺼번에 계산하는걸 좋아한다꽥!",
                    sub: "빈 리스트에 결과를 하나씩 모으는(append) 패턴을 익혀두꽥."
                }
            },
            reasoning: {
                question: '배치(Batch) 처리를 하는 가장 큰 이유는?',
                options: ['코드를 복잡하게 하기 위해', '병렬 연산을 통해 학습 속도를 높이기 위해', '데이터를 섞기 위해', '메모리를 낭비하기 위해'],
                correctIndex: 1
            },
            feedback: {
                success: '고속 처리 완료! 대량의 데이터도 문제없습니다.',
                failure: '결과를 저장하지 않으면 계산한 의미가 없습니다.',
                hint: '리스트에 하나씩 담아두세요(append).'
            },
            interviewQuestions: []
        }
    },

    // LV4 - 모델 평가 및 제어 (조건+반복)
    {
        id: 'quest_ai_07',
        level: 4,
        title: '정확도 계산 (Accuracy)',
        description: '시험 결과가 나왔습니다. 전체 문제 중 정답을 맞힌 비율(정확도)을 계산하는 로직을 구현하세요.',
        logic_type: '리스트 + 조건',
        emoji: '💯',
        rewardXP: 450,
        examples: '● IN: answers=[1,0,1], preds=[1,0,0]\n● OUT: 2/3 = 0.66',
        cards: [
            {
                id: 'a1',
                text_ko: '맞은 개수(correct)를 0으로 설정',
                text_py: 'correct = 0',
                icon: '0️⃣',
                color: 'blue',
                action: 'init'
            },
            {
                id: 'a2',
                text_ko: '모든 데이터(i)에 대해 반복',
                text_py: 'for i in range(len(answers)):',
                icon: '🔁',
                color: 'purple',
                isLoop: true,
                action: 'loop'
            },
            {
                id: 'a3',
                text_ko: '    정답과 예측이 같다면',
                text_py: '    if answers[i] == preds[i]:',
                icon: '❓',
                color: 'orange',
                isCondition: true,
                indent: 1,
                action: 'check'
            },
            {
                id: 'a4',
                text_ko: '        맞은 개수를 1 늘린다',
                text_py: '        correct = correct + 1',
                icon: '⬆️',
                color: 'green',
                indent: 2,
                action: 'inc'
            },
            {
                id: 'a5',
                text_ko: '맞은 개수를 전체 개수로 나눈다',
                text_py: 'acc = correct / len(answers)',
                icon: '➗',
                color: 'red',
                action: 'calc_acc'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 2 }, { id: 'a5', indent: 0 }],
            execution: {
                function_name: "calc_accuracy",
                test_cases: [{ input: "[1,1], [1,0]", expected: "0.5", type: "public" }],
                implementation_hint: {
                    main: "반복문으로 채점하고 마지막에 평균을 내는거다꽥!",
                    sub: "나눗셈(acc 계산)은 반복문이 다 끝난 뒤에 딱 한 번만 해야 한다꽥."
                }
            },
            reasoning: {
                question: '정확도(Accuracy)만 믿으면 안 되는 경우는?',
                options: ['데이터가 너무 적을 때', '데이터의 정답 비율이 불균형할 때 (예: 99%가 정상 데이터)', '항상 정확도는 완벽한 지표다', '컴퓨터가 계산을 틀릴 때'],
                correctIndex: 1
            },
            feedback: {
                success: '채점 완료! 모델의 성능을 숫자로 확인했습니다.',
                failure: '반복문 안에서 나누기를 하면 안 됩니다!',
                hint: '총점을 먼저 다 구한 뒤에(반복문 종료 후) 평균을 내세요.'
            },
            interviewQuestions: []
        }
    },
    {
        id: 'quest_ai_08',
        level: 4,
        title: '조기 종료 (Early Stopping)',
        description: '학습을 해도 성능(Loss)이 더 이상 좋아지지 않는다면, 시간 낭비를 막기 위해 학습을 중단(break)해야 합니다.',
        logic_type: '복합 조건 + 탈출',
        emoji: '🛑',
        rewardXP: 500,
        examples: '● IN: current_loss=0.5, best_loss=0.4\n● OUT: Stop Training!',
        cards: [
            {
                id: 'a1',
                text_ko: '현재 오차가 최선(best)보다 크다면 (성능 하락)',
                text_py: 'if current_loss > best_loss:',
                icon: '📉',
                color: 'purple',
                isCondition: true,
                action: 'check_worse'
            },
            {
                id: 'a2',
                text_ko: '    참을성(patience)을 1 줄인다',
                text_py: '    patience = patience - 1',
                icon: '⬇️',
                color: 'orange',
                indent: 1,
                action: 'dec_patience'
            },
            {
                id: 'a3',
                text_ko: '    참을성이 바닥났다면 (0 이하)',
                text_py: '    if patience <= 0:',
                icon: '💥',
                color: 'red',
                isCondition: true,
                indent: 1,
                action: 'check_stop'
            },
            {
                id: 'a4',
                text_ko: '        반복문을 탈출(중단)한다',
                text_py: '        break',
                icon: '🚪',
                color: 'black',
                indent: 2,
                action: 'break'
            },
            {
                id: 'a5',
                text_ko: '아니라면 (신기록 갱신)',
                text_py: 'else:',
                icon: '🎉',
                color: 'blue',
                isCondition: true,
                action: 'else_better'
            },
            {
                id: 'a6',
                text_ko: '    최선 오차를 업데이트한다',
                text_py: '    best_loss = current_loss',
                icon: '💾',
                color: 'green',
                indent: 1,
                action: 'update_best'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 1 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 2 }, { id: 'a5', indent: 0 }, { id: 'a6', indent: 1 }],
            execution: {
                function_name: "early_stopping",
                test_cases: [{ input: "0.5, 0.4, 0", expected: "'break'", type: "public" }],
                implementation_hint: {
                    main: "더 이상 배울게 없으면 하산(Stop)하는게 현명하다꽥!",
                    sub: "중첩된 if문(참을성 체크)과 break를 이용해 반복을 끊어내야 한다꽥."
                }
            },
            reasoning: {
                question: '조기 종료(Early Stopping)는 무엇을 방지하기 위함일까요?',
                options: ['메모리 부족', '과소적합(Underfitting)', '과적합(Overfitting) 및 자원 낭비', '데이터 손실'],
                correctIndex: 2
            },
            feedback: {
                success: '효율적인 학습 종료! 과적합을 막고 전기를 아꼈습니다.',
                failure: '성능이 나빠졌는데 계속 학습하면 안 됩니다.',
                hint: '참을성(patience)이 다 떨어지면 과감하게 break 하세요.'
            },
            interviewQuestions: []
        }
    },

    // LV5 - 최신 AI 트렌드 (고급 로직)
    {
        id: 'quest_ai_09',
        level: 5,
        title: '토큰화 (Tokenization)',
        description: 'LLM은 글자를 숫자로 이해합니다. 문장을 단어 사전에 있는 ID로 변환하는 토크나이저를 만들어보세요.',
        logic_type: '딕셔너리 조회',
        emoji: '🔤',
        rewardXP: 650,
        examples: '● IN: "hello ai"\n● OUT: [1024, 503]',
        cards: [
            {
                id: 'a1',
                text_ko: '결과 ID 리스트와 단어 사전 준비',
                text_py: 'ids = []\nvocab = {"hello": 1, "ai": 2}',
                icon: '📖',
                color: 'blue',
                action: 'init'
            },
            {
                id: 'a2',
                text_ko: '입력 문장을 공백 기준으로 자른다',
                text_py: 'words = text.split(" ")',
                icon: '✂️',
                color: 'purple',
                action: 'split'
            },
            {
                id: 'a3',
                text_ko: '잘라진 각 단어(w)에 대해 반복',
                text_py: 'for w in words:',
                icon: '🔁',
                color: 'orange',
                isLoop: true,
                action: 'loop'
            },
            {
                id: 'a4',
                text_ko: '    사전에 단어가 있다면',
                text_py: '    if w in vocab:',
                icon: '❓',
                color: 'green',
                isCondition: true,
                indent: 1,
                action: 'check_vocab'
            },
            {
                id: 'a5',
                text_ko: '        해당 ID를 리스트에 추가',
                text_py: '        ids.append(vocab[w])',
                icon: '📥',
                color: 'blue',
                indent: 2,
                action: 'append_id'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 0 }, { id: 'a4', indent: 1 }, { id: 'a5', indent: 2 }],
            execution: {
                function_name: "tokenize",
                test_cases: [{ input: "'hello ai'", expected: "[1, 2]", type: "public" }],
                implementation_hint: {
                    main: "GPT도 결국 글자를 숫자(Token ID)로 바꿔서 처리한다꽥!",
                    sub: "split으로 자르고, 딕셔너리에서 찾아서(vocab[w]) 숫자로 바꾸면 된다꽥."
                }
            },
            reasoning: {
                question: '사전에 없는 단어(OOV)는 보통 어떻게 처리할까요?',
                options: ['프로그램을 종료한다', '무시한다', '특수한 [UNK] 토큰으로 바꾼다', '새로운 사전을 만든다'],
                correctIndex: 2
            },
            feedback: {
                success: '번역 준비 완료! 기계가 이해할 수 있는 숫자로 변했습니다.',
                failure: '사전에 없는 단어를 찾으면 에러가 납니다.',
                hint: 'if w in vocab 조건으로 사전에 있는지 먼저 확인해야 안전합니다.'
            },
            interviewQuestions: []
        }
    },
    {
        id: 'quest_ai_10',
        level: 5,
        title: 'RAG 검색 시스템 (Vector Search)',
        description: '사용자 질문과 유사도가 높은 문서를 데이터베이스에서 찾아내는 RAG(검색 증강 생성)의 핵심 로직을 구현하세요.',
        logic_type: '최대값 찾기 응용',
        emoji: '🔍',
        rewardXP: 800,
        examples: '● IN: query_vec, db_vecs\n● OUT: most_similar_doc',
        cards: [
            {
                id: 'a1',
                text_ko: '최고 점수(-1)와 추천 문서를 초기화',
                text_py: 'max_score = -1\nbest_doc = None',
                icon: '🏁',
                color: 'blue',
                action: 'init'
            },
            {
                id: 'a2',
                text_ko: 'DB의 모든 문서(doc)에 대해 반복',
                text_py: 'for doc in database:',
                icon: '🔁',
                color: 'purple',
                isLoop: true,
                action: 'loop'
            },
            {
                id: 'a3',
                text_ko: '    질문과의 유사도 점수를 계산한다',
                text_py: '    score = calc_similarity(query, doc)',
                icon: '📏',
                color: 'orange',
                indent: 1,
                action: 'calc_sim'
            },
            {
                id: 'a4',
                text_ko: '    만약 현재 점수가 최고 점수보다 높다면',
                text_py: '    if score > max_score:',
                icon: '❓',
                color: 'red',
                isCondition: true,
                indent: 1,
                action: 'check_max'
            },
            {
                id: 'a5',
                text_ko: '        최고 점수와 추천 문서를 갱신한다',
                text_py: '        max_score = score\n        best_doc = doc',
                icon: '✅',
                color: 'green',
                indent: 2,
                action: 'update'
            }
        ],
        correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5'],
        validation: {
            puzzle_solution: [{ id: 'a1', indent: 0 }, { id: 'a2', indent: 0 }, { id: 'a3', indent: 1 }, { id: 'a4', indent: 1 }, { id: 'a5', indent: 2 }],
            execution: {
                function_name: "rag_search",
                test_cases: [{ input: "", expected: "'best_doc'", type: "public" }],
                implementation_hint: {
                    main: "가장 비슷한 문서 하나를 찾는건 '최댓값 찾기' 알고리즘과 똑같다꽥!",
                    sub: "유사도(score)가 더 높은게 나타나면 best_doc을 갈아끼우면 된다꽥."
                }
            },
            reasoning: {
                question: 'RAG 시스템에서 유사도 계산은 주로 무엇을 사용할까요?',
                options: ['문자열 길이 비교', '알파벳 순서', '코사인 유사도(Cosine Similarity)', '랜덤 선택'],
                correctIndex: 2
            },
            feedback: {
                success: '딱 맞는 문서를 찾아냈습니다! 이제 LLM이 답변을 잘 하겠네요.',
                failure: '더 좋은 문서를 찾았는데 갱신을 안 했군요.',
                hint: 'score > max_score 일 때 꼭 변수를 업데이트하세요.'
            },
            interviewQuestions: []
        }
    }
];