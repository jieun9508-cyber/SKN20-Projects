/**
 * PseudocodeValidator.js - 실용적 규칙 기반 평가
 * 
 * 설계 철학:
 * 1. 치명적 오류만 엄격하게 검증 (블로킹)
 * 2. 나머지는 가이드 제공 (비블로킹)
 * 3. 동의어/표현 변형 허용
 * 4. 교육적 피드백 우선
 * 
 * [2026-02-09] 완전 재설계 (Antigravity + Claude)
 */

export class PseudocodeValidator {
    constructor(problem) {
        this.problem = problem;
        this.rules = this.buildRules(problem);
    }

    /**
     * 메인 검증 함수
     * @returns {
     *   passed: boolean,          // 치명적 오류 없음
     *   score: number,            // 구조 점수 (0-100)
     *   criticalErrors: string[], // 블로킹 오류들
     *   warnings: string[],       // 개선 제안들
     *   details: object           // 상세 분석
     * }
     */
    validate(pseudocode) {
        // 1. 치명적 오류 체크 (블로킹)
        const criticalErrors = this.checkCriticalErrors(pseudocode);

        // 2. 구조 분석 (점수화)
        const structure = this.analyzeStructure(pseudocode);

        // 3. 개선 제안 (교육적)
        const warnings = this.generateWarnings(pseudocode, structure);

        return {
            passed: criticalErrors.length === 0,
            score: structure.score,
            criticalErrors,
            warnings,
            details: {
                structure,
                concepts: this.extractConcepts(pseudocode),
                completeness: this.checkCompleteness(pseudocode)
            }
        };
    }

    /**
     * 1단계: 치명적 오류만 검증 (블로킹)
     * 예: 데이터 누수, 논리적 모순
     */
    checkCriticalErrors(pseudocode) {
        const errors = [];
        const normalized = this.normalize(pseudocode);

        // 문제별 치명적 패턴
        if (this.rules.criticalPatterns) {
            for (const pattern of this.rules.criticalPatterns) {
                if (pattern.test(normalized)) {
                    errors.push({
                        severity: 'CRITICAL',
                        message: pattern.message,
                        example: pattern.correctExample,
                        why: pattern.explanation
                    });
                }
            }
        }

        return errors;
    }

    /**
     * 2단계: 구조 점수 계산 (일관성 있는 점수)
     */
    analyzeStructure(pseudocode) {
        const lines = pseudocode.split('\n').filter(l => l.trim());

        let score = 0;
        const feedback = [];

        // 기본 형식 (20점)
        if (lines.length >= 3) {
            score += 10;
            feedback.push('✅ 적절한 길이');
        } else {
            feedback.push('⚠️ 너무 짧음 (최소 3줄 권장)');
        }

        const hasNumbering = lines.filter(l => /^\d+[\.\):]/.test(l.trim())).length > 0;
        if (hasNumbering) {
            score += 10;
            feedback.push('✅ 번호 매기기 사용');
        } else {
            feedback.push('💡 번호 매기기를 권장합니다');
        }

        // 핵심 개념 포함 여부 (40점)
        const concepts = this.extractConcepts(pseudocode);
        const requiredConcepts = this.rules.requiredConcepts || [];

        let foundConcepts = 0;
        for (const required of requiredConcepts) {
            if (concepts.has(required.id)) {
                foundConcepts++;
            }
        }

        const conceptScore = Math.round(40 * (foundConcepts / requiredConcepts.length));
        score += conceptScore;

        if (foundConcepts === requiredConcepts.length) {
            feedback.push('✅ 모든 핵심 개념 포함');
        } else {
            const missing = requiredConcepts
                .filter(c => !concepts.has(c.id))
                .map(c => c.name);
            feedback.push(`⚠️ 누락된 개념: ${missing.join(', ')}`);
        }

        // 논리적 흐름 (40점)
        const flow = this.analyzeLogicalFlow(pseudocode, concepts);
        score += flow.score;
        feedback.push(...flow.feedback);

        return {
            score: Math.min(100, score),
            feedback,
            concepts: Array.from(concepts),
            flow
        };
    }

    /**
     * 핵심: 동의어를 고려한 개념 추출
     */
    extractConcepts(pseudocode) {
        const normalized = this.normalize(pseudocode);
        const concepts = new Set();

        if (!this.rules.requiredConcepts) return concepts;

        for (const concept of this.rules.requiredConcepts) {
            // 여러 표현 중 하나라도 있으면 인정
            for (const pattern of concept.patterns) {
                if (pattern.test(normalized)) {
                    concepts.add(concept.id);
                    break;
                }
            }
        }

        return concepts;
    }

    /**
     * 논리적 흐름 분석 (의존성 검증)
     */
    analyzeLogicalFlow(pseudocode, concepts) {
        const lines = pseudocode.toLowerCase().split('\n');
        let score = 0;
        const feedback = [];

        // 문제별 의존성 규칙
        if (!this.rules.dependencies) {
            return { score: 40, feedback: ['(흐름 검증 규칙 없음)'] };
        }

        for (const dep of this.rules.dependencies) {
            const beforeIdx = this.findConceptLine(lines, dep.before);
            const afterIdx = this.findConceptLine(lines, dep.after);

            if (beforeIdx === -1 || afterIdx === -1) {
                // 개념 자체가 없으면 이미 감점됨
                continue;
            }

            if (beforeIdx < afterIdx) {
                score += dep.points;
                feedback.push(`✅ ${dep.name} 순서 정확`);
            } else {
                feedback.push(`❌ ${dep.name}: "${dep.before}"가 "${dep.after}"보다 먼저 와야 함`);
            }
        }

        return { score, feedback };
    }

    /**
     * 개념이 등장하는 첫 번째 라인 찾기
     */
    findConceptLine(lines, conceptId) {
        const concept = this.rules.requiredConcepts.find(c => c.id === conceptId);
        if (!concept) return -1;

        for (let i = 0; i < lines.length; i++) {
            for (const pattern of concept.patterns) {
                if (pattern.test(lines[i])) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * 정규화: 동의어/표현 변형을 통일
     */
    normalize(text) {
        let normalized = text.toLowerCase();

        // 공백 정리
        normalized = normalized.replace(/\s+/g, ' ');

        // 불필요한 기호 제거
        normalized = normalized.replace(/[^a-z0-9가-힣\s\.\,\(\)]/g, ' ');

        return normalized;
    }

    /**
     * 완성도 체크
     */
    checkCompleteness(pseudocode) {
        const wordCount = pseudocode.split(/\s+/).length;

        return {
            wordCount,
            adequate: wordCount >= 20,
            message: wordCount < 20
                ? '의사코드가 너무 간략합니다. 각 단계를 더 구체적으로 설명하세요.'
                : wordCount > 200
                    ? '너무 세부적입니다. 핵심 단계만 간결하게 표현하세요.'
                    : '적절한 길이입니다.'
        };
    }

    /**
     * 경고 메시지 생성 (비블로킹, 교육적)
     */
    generateWarnings(pseudocode, structure) {
        const warnings = [];

        // 완성도 경고
        const completeness = this.checkCompleteness(pseudocode);
        if (!completeness.adequate) {
            warnings.push(completeness.message);
        }

        // 예외 처리 권장
        const normalized = this.normalize(pseudocode);
        const hasExceptionHandling = /예외|오류|체크|검증|확인|validation|error|check/.test(normalized);

        if (!hasExceptionHandling && this.rules.recommendExceptionHandling) {
            warnings.push('💡 예외 상황 처리를 추가하면 더 견고한 설계가 됩니다.');
        }

        return warnings;
    }

    /**
     * 문제별 규칙 정의
     */
    buildRules(problem) {
        // Data Leakage 문제 규칙
        if (problem?.type === 'data_leakage' || problem?.title?.includes('누수')) {
            return {
                // 치명적 오류 (블로킹)
                // 치명적 오류 (블로킹)
                criticalPatterns: [
                    {
                        test: (text) => {
                            // "전체 데이터로 fit" 패턴 - 오판 방지 강화
                            // "분리" 또는 "나눈 후" 라는 말이 문장에 있으면 허용
                            const lines = text.split('\n');
                            for (const line of lines) {
                                const lower = line.toLowerCase();
                                const hasFitAll = /(전체|모든|all|entire|whole).*(데이터|data).*(fit|학습|fitting|학습시)/.test(lower) ||
                                    /fit.*(전체|모든|all|entire|whole).*(데이터|data)/.test(lower);

                                // 예외: "분리" 등의 단어가 같은 줄에 있거나, 부정어("않는다")가 있으면 패스
                                const hasSplitReference = /분리|split|divide|after|나눈|따로/.test(lower);
                                const hasNegative = /않는다|not|never|no/.test(lower);

                                if (hasFitAll && !hasSplitReference && !hasNegative) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        message: '🚨 데이터 누수 발생: 전체 데이터로 fit하면 테스트 정보가 학습에 유입됩니다',
                        correctExample: '학습 데이터로만 fit → 두 데이터셋 모두 transform',
                        explanation: '스케일러는 학습 데이터의 통계만 학습해야 합니다. 테스트 데이터의 평균/분산 정보가 들어가면 실전 성능이 하락합니다.'
                    },
                    {
                        test: (text) => {
                            // "test 데이터로 fit" 패턴
                            const lines = text.split('\n');
                            for (const line of lines) {
                                const lower = line.toLowerCase();
                                const hasTestFit = /(test|테스트|검증|평가).*(fit|학습시|fitting)/.test(lower);
                                const hasTransform = /(transform|변환)/.test(lower);
                                const hasNegative = /않는다|not|never|no/.test(lower);

                                // "test 데이터는 fit 하지 않는다"는 문장은 허용해야 함
                                if (hasTestFit && !hasTransform && !hasNegative) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        message: '🚨 데이터 누수 발생: 테스트 데이터로 fit하면 안 됩니다',
                        correctExample: 'train 데이터로 fit → test 데이터는 transform만',
                        explanation: '테스트 데이터는 모델이 한 번도 본 적 없는 "미래의 데이터"를 시뮬레이션합니다.'
                    }
                ],

                // 필수 개념 (동의어 포함)
                requiredConcepts: [
                    {
                        id: 'data_split',
                        name: '데이터 분리',
                        patterns: [
                            /분리|나누|나눔|split|separate|divide/,
                            /train.*test|학습.*테스트|학습.*검증/,
                            /training.*test/
                        ]
                    },
                    {
                        id: 'scaler_create',
                        name: '스케일러 생성',
                        patterns: [
                            /scaler|스케일러|standardscaler/,
                            /정규화.*도구|normalization.*tool/,
                            /변환.*객체|transformer.*object/
                        ]
                    },
                    {
                        id: 'fit_train',
                        name: '학습 데이터로 fit',
                        patterns: [
                            /(train|학습).*(fit|학습시|학습하|fitting)/,
                            /fit.*(train|학습)/,
                            /(학습 데이터|training).*(통계|평균|분산|statistics)/
                        ]
                    },
                    {
                        id: 'transform_train',
                        name: '학습 데이터 변환',
                        patterns: [
                            /(train|학습).*(transform|변환|적용)/,
                            /transform.*(train|학습)/
                        ]
                    },
                    {
                        id: 'transform_test',
                        name: '테스트 데이터 변환',
                        patterns: [
                            /(test|테스트|검증).*(transform|변환|적용)/,
                            /transform.*(test|테스트|검증)/
                        ]
                    }
                ],

                // 논리적 의존성 (순서)
                dependencies: [
                    {
                        name: '분리 → 스케일러 생성',
                        before: 'data_split',
                        after: 'scaler_create',
                        points: 8
                    },
                    {
                        name: '스케일러 생성 → fit',
                        before: 'scaler_create',
                        after: 'fit_train',
                        points: 8
                    },
                    {
                        name: 'fit → train transform',
                        before: 'fit_train',
                        after: 'transform_train',
                        points: 12
                    },
                    {
                        name: 'fit → test transform',
                        before: 'fit_train',
                        after: 'transform_test',
                        points: 12
                    }
                ],

                recommendExceptionHandling: true
            };
        }

        // 기본 규칙 (범용)
        return {
            criticalPatterns: [],
            requiredConcepts: [
                {
                    id: 'input',
                    name: '입력',
                    patterns: [/입력|input|받|receive/]
                },
                {
                    id: 'process',
                    name: '처리',
                    patterns: [/처리|계산|process|compute|calculate/]
                },
                {
                    id: 'output',
                    name: '출력',
                    patterns: [/출력|반환|return|output/]
                }
            ],
            dependencies: [],
            recommendExceptionHandling: false
        };
    }
}