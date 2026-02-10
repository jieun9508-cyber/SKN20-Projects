/**
 * Interview Data Validation Script
 *
 * Node.js 환경에서 면접 데이터 검증 실행
 */

const fs = require('fs');
const path = require('path');

// 면접 데이터 디렉토리
const INTERVIEW_DIR = path.join(__dirname, '../../../../../data/interview');

/**
 * 모든 면접 JSON 파일 로드
 */
function loadAllInterviews() {
  const files = fs.readdirSync(INTERVIEW_DIR).filter(f => f.endsWith('.json'));

  return files.map(filename => {
    const filePath = path.join(INTERVIEW_DIR, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return {
      filename: filename.replace('.json', ''),
      title: data.title || '',
      summary: data.summary || '',
      transcript: data.transcript || '',
      url: data.url || ''
    };
  });
}

/**
 * 품질 점수 계산
 */
function calculateQualityScore(interview) {
  let score = 0;

  // 1. Title (10점)
  if (interview.title && interview.title.length > 5) {
    score += 10;
  }

  // 2. Summary (30점)
  if (interview.summary) {
    if (interview.summary.length > 100) score += 15;
    if (interview.summary.length > 300) score += 15;
  }

  // 3. Transcript (40점)
  if (interview.transcript) {
    if (interview.transcript.length > 500) score += 20;
    if (interview.transcript.length > 2000) score += 20;
  }

  // 4. 대화 횟수 (20점)
  const interviewerCount = (interview.transcript?.match(/Interviewer:/g) || []).length;
  const candidateCount = (interview.transcript?.match(/Candidate:/g) || []).length;
  const totalExchanges = interviewerCount + candidateCount;

  if (totalExchanges > 10) score += 10;
  if (totalExchanges > 30) score += 10;

  return {
    score,
    metadata: {
      titleLength: interview.title?.length || 0,
      summaryLength: interview.summary?.length || 0,
      transcriptLength: interview.transcript?.length || 0,
      interviewerCount,
      candidateCount,
      totalExchanges
    }
  };
}

/**
 * 품질 등급
 */
function getQualityGrade(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * 편향 감지
 */
function detectBias(interviews) {
  const keywordCounts = {};
  const totalInterviews = interviews.length;

  const keywords = [
    'cdn', 'cache', 'redis', 'database', 'sql', 'nosql',
    'load balancer', 'redundancy', 'failover', 'monitoring',
    'kubernetes', 'docker', 'microservice', 'api',
    'latency', 'throughput', 'scalability', 'availability'
  ];

  interviews.forEach(interview => {
    const text = `${interview.summary} ${interview.transcript}`.toLowerCase();

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const count = (text.match(regex) || []).length;
      if (count > 0) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      }
    });
  });

  // 편향 (80% 이상)
  const biasThreshold = totalInterviews * 0.8;
  const biasedKeywords = Object.entries(keywordCounts)
    .filter(([_, count]) => count >= biasThreshold)
    .map(([keyword, count]) => ({
      keyword,
      frequency: count,
      percentage: ((count / totalInterviews) * 100).toFixed(1)
    }));

  // 희소 (5% 미만)
  const rarityThreshold = totalInterviews * 0.05;
  const rareKeywords = Object.entries(keywordCounts)
    .filter(([_, count]) => count < rarityThreshold && count > 0)
    .map(([keyword, count]) => ({
      keyword,
      frequency: count,
      percentage: ((count / totalInterviews) * 100).toFixed(1)
    }));

  return {
    totalInterviews,
    biasedKeywords,
    rareKeywords,
    warning: biasedKeywords.length > 3 ? 'HIGH_BIAS' : rareKeywords.length > 10 ? 'LOW_COVERAGE' : 'OK'
  };
}

/**
 * 검증 실행
 */
function validateInterviews(minQualityScore = 60) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Phase 0: 면접 데이터 품질 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const interviews = loadAllInterviews();
  console.log(`📂 로드 완료: ${interviews.length}개 파일\n`);

  // 품질 평가
  const scored = interviews.map(interview => {
    const quality = calculateQualityScore(interview);
    const grade = getQualityGrade(quality.score);

    return {
      ...interview,
      qualityScore: quality.score,
      grade,
      metadata: quality.metadata,
      passed: quality.score >= minQualityScore
    };
  });

  // 정렬
  scored.sort((a, b) => b.qualityScore - a.qualityScore);

  // 등급별 분류
  const passed = scored.filter(s => s.passed);
  const failed = scored.filter(s => !s.passed);
  const excellent = scored.filter(s => s.grade === 'Excellent');
  const good = scored.filter(s => s.grade === 'Good');
  const fair = scored.filter(s => s.grade === 'Fair');
  const poor = scored.filter(s => s.grade === 'Poor');

  // 편향 감지
  const biasReport = detectBias(interviews);

  // 통계
  const avgScore = (scored.reduce((sum, s) => sum + s.qualityScore, 0) / scored.length).toFixed(1);
  const avgPassedScore = passed.length > 0
    ? (passed.reduce((sum, s) => sum + s.qualityScore, 0) / passed.length).toFixed(1)
    : 0;

  const report = {
    total: interviews.length,
    passed: passed.length,
    failed: failed.length,
    passRate: ((passed.length / interviews.length) * 100).toFixed(1),
    avgScore,
    avgPassedScore,
    minQualityScore,
    qualityDistribution: {
      excellent: excellent.length,
      good: good.length,
      fair: fair.length,
      poor: poor.length
    },
    biasReport,
    passedInterviews: passed,
    failedInterviews: failed
  };

  // 콘솔 출력
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 검증 결과');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`총 데이터: ${report.total}개`);
  console.log(`✅ 통과: ${report.passed}개 (${report.passRate}%)`);
  console.log(`❌ 실패: ${report.failed}개\n`);

  console.log('품질 분포:');
  console.log(`  ⭐ Excellent (80+): ${report.qualityDistribution.excellent}개`);
  console.log(`  ✅ Good (60-79):    ${report.qualityDistribution.good}개`);
  console.log(`  ⚠️  Fair (40-59):    ${report.qualityDistribution.fair}개`);
  console.log(`  ❌ Poor (0-39):     ${report.qualityDistribution.poor}개\n`);

  console.log(`평균 점수: ${report.avgScore}점`);
  console.log(`통과 데이터 평균: ${report.avgPassedScore}점\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 검증 완료!\n');

  return report;
}

/**
 * MD 파일 생성
 */
function generateMarkdownReport(report) {
  const lines = [];

  lines.push('# Phase 0: 면접 데이터 품질 검증 리포트');
  lines.push('');
  lines.push(`**검증일:** ${new Date().toISOString().split('T')[0]}`);
  lines.push(`**최소 품질 기준:** ${report.minQualityScore}점`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 요약
  lines.push('## 📊 검증 요약');
  lines.push('');
  lines.push('| 항목 | 값 |');
  lines.push('|------|------|');
  lines.push(`| 총 데이터 | ${report.total}개 |`);
  lines.push(`| ✅ 통과 | ${report.passed}개 |`);
  lines.push(`| ❌ 실패 | ${report.failed}개 |`);
  lines.push(`| 통과율 | ${report.passRate}% |`);
  lines.push(`| 평균 점수 | ${report.avgScore}점 |`);
  lines.push(`| 통과 데이터 평균 | ${report.avgPassedScore}점 |`);
  lines.push('');

  // 품질 분포
  lines.push('## 📈 품질 분포');
  lines.push('');
  lines.push('| 등급 | 개수 | 비율 |');
  lines.push('|------|------|------|');
  lines.push(`| ⭐ Excellent (80+) | ${report.qualityDistribution.excellent}개 | ${((report.qualityDistribution.excellent / report.total) * 100).toFixed(1)}% |`);
  lines.push(`| ✅ Good (60-79) | ${report.qualityDistribution.good}개 | ${((report.qualityDistribution.good / report.total) * 100).toFixed(1)}% |`);
  lines.push(`| ⚠️ Fair (40-59) | ${report.qualityDistribution.fair}개 | ${((report.qualityDistribution.fair / report.total) * 100).toFixed(1)}% |`);
  lines.push(`| ❌ Poor (0-39) | ${report.qualityDistribution.poor}개 | ${((report.qualityDistribution.poor / report.total) * 100).toFixed(1)}% |`);
  lines.push('');

  // 편향 리포트
  lines.push('## ⚠️ 편향 감지');
  lines.push('');
  lines.push(`**상태:** ${report.biasReport.warning}`);
  lines.push('');

  if (report.biasReport.biasedKeywords.length > 0) {
    lines.push('### 과다 출현 키워드 (80% 이상)');
    lines.push('');
    lines.push('| 키워드 | 출현 횟수 | 비율 |');
    lines.push('|--------|----------|------|');
    report.biasReport.biasedKeywords.forEach(kw => {
      lines.push(`| ${kw.keyword} | ${kw.frequency}개 면접 | ${kw.percentage}% |`);
    });
    lines.push('');
  }

  if (report.biasReport.rareKeywords.length > 0) {
    lines.push('### 희소 키워드 (5% 미만)');
    lines.push('');
    lines.push('| 키워드 | 출현 횟수 | 비율 |');
    lines.push('|--------|----------|------|');
    report.biasReport.rareKeywords.slice(0, 10).forEach(kw => {
      lines.push(`| ${kw.keyword} | ${kw.frequency}개 면접 | ${kw.percentage}% |`);
    });
    if (report.biasReport.rareKeywords.length > 10) {
      lines.push(`| ... | ... | ... |`);
    }
    lines.push('');
  }

  // 통과 데이터
  lines.push('## ✅ 사용 가능 데이터 (통과)');
  lines.push('');
  lines.push(`**총 ${report.passed}개** - 이 데이터를 Phase 1에서 사용합니다.`);
  lines.push('');
  lines.push('| 순위 | 제목 | 점수 | 등급 | 상세 정보 |');
  lines.push('|------|------|------|------|----------|');

  report.passedInterviews.forEach((interview, idx) => {
    const info = `Summary: ${interview.metadata.summaryLength}자, Transcript: ${interview.metadata.transcriptLength}자, 대화: ${interview.metadata.totalExchanges}회`;
    lines.push(`| ${idx + 1} | ${interview.title} | ${interview.qualityScore}점 | ${interview.grade} | ${info} |`);
  });
  lines.push('');

  // 실패 데이터
  if (report.failed > 0) {
    lines.push('## ❌ 제외될 데이터 (실패)');
    lines.push('');
    lines.push(`**총 ${report.failed}개** - 품질 기준 미달로 사용하지 않습니다.`);
    lines.push('');
    lines.push('| 제목 | 점수 | 등급 | 상세 정보 |');
    lines.push('|------|------|------|----------|');

    report.failedInterviews.forEach(interview => {
      const info = `Summary: ${interview.metadata.summaryLength}자, Transcript: ${interview.metadata.transcriptLength}자, 대화: ${interview.metadata.totalExchanges}회`;
      lines.push(`| ${interview.title} | ${interview.qualityScore}점 | ${interview.grade} | ${info} |`);
    });
    lines.push('');
  }

  // 결론
  lines.push('## 💡 결론');
  lines.push('');

  if (report.passed >= 20) {
    lines.push(`✅ **성공!** ${report.passed}개의 품질 좋은 데이터를 확보했습니다.`);
    lines.push('');
    lines.push('**다음 단계:** Phase 1 (질문 생성 개선)을 진행할 수 있습니다.');
  } else if (report.passed >= 15) {
    lines.push(`⚠️ **주의!** ${report.passed}개의 데이터가 있지만, 20개 이상 권장됩니다.`);
    lines.push('');
    lines.push('**권장 사항:**');
    lines.push('- 진행은 가능하나 인사이트 품질이 다소 낮을 수 있습니다.');
    lines.push('- 가능하면 추가 데이터 수집을 고려하세요.');
    lines.push('- 또는 최소 품질 기준을 50점으로 낮추는 것도 방법입니다.');
  } else {
    lines.push(`❌ **부족!** ${report.passed}개는 너무 적습니다 (최소 15개 필요).`);
    lines.push('');
    lines.push('**조치 필요:**');
    lines.push('1. 추가 면접 데이터 수집');
    lines.push('2. 또는 최소 품질 기준을 40-50점으로 낮추기');
    lines.push('3. 기존 데이터의 품질을 개선 (summary/transcript 보완)');
  }
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('**생성일:** ' + new Date().toLocaleString('ko-KR'));
  lines.push('**검증 스크립트:** `scripts/validateInterviewData.js`');

  return lines.join('\n');
}

// 실행
try {
  const report = validateInterviews(60);
  const markdown = generateMarkdownReport(report);

  const outputPath = path.join(__dirname, '../docs/PHASE0_VALIDATION_REPORT.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`\n📄 리포트 생성 완료: ${outputPath}`);
  console.log('\n다음 명령어로 확인하세요:');
  console.log(`  cat docs/PHASE0_VALIDATION_REPORT.md`);
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  process.exit(1);
}
