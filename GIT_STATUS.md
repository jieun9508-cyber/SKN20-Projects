# 현재 Git 상태 요약 (2026-02-10)

## 1. 현재 브랜치 (Current Branch)
- **`pseudo_tts`**
  - 현재 원격 저장소(`origin/pseudo_tts`)와 동기화된 상태입니다.

## 2. 최근 커밋 내역 (Recent Commits - Top 5)
1. `11acab9` - 아바타 관련 수정 및 UI 개선 (마스코트 fallback 로직 강화)
2. `7d33a1e` - (Merge) main 브랜치 통합
3. `8795f0e` - Bug Hunt 게임 로직 및 UI 수정
4. `189604d` - Unit 1 학습 기록 저장 로직 추가 (임시)
5. `0f11acb` - 초기 리더보드 및 아바타 연동 기초 작업

## 3. 수정된 파일 (Changes NOT staged for commit)
현재 작업 중이며 아직 커밋되지 않은 수정 사항들입니다:
- **`.gitignore`**: 환경 변수 및 임시 파일 제외 설정 업데이트
- **`backend/config/settings.py`**: 
  - **Supabase** 설정 흔적 제거
  - **AWS RDS/S3** 설정 최적화 (버킷 및 리전 정보 업데이트)
- **`backend/core/nanobanana_utils.py`**:
  - **Supabase** 연동 코드 제거
  - **AWS S3** 업로드 및 이미지 최적화(WebP) 로직 통합
- **`backend/core/views/activity_view.py`**:
  - `LeaderboardView`에서 `default_duck.png`가 의도적으로 차단되던 로직 수정
- **`backend/core/views/user_view.py`**:
  - 소스 코드 주석 내 남아있던 **Supabase** 흔적 정리

## 4. 새로 생성된 파일 (Untracked Files)
디버깅 및 복구를 위해 생성된 스크립트 도구들입니다:
- **루트 디렉토리**:
  - `list_s3.py`: S3 버킷 파일 존재 여부 확인 도구
  - `check_s3_file.py`: 개별 S3 오브젝트 메타데이터 확인 도구
- **`backend/` 디렉토리**:
  - `debug_avatars.py`: 사용자별 아바타 DB 상태 전수 조사 도구
  - `list_s3_urls.py`: DB 내 S3 URL 추출기
  - `repair_avatars_v2.py`: 유실된 아바타 링크를 `default_duck`으로 일괄 수선하는 스크립트
  - `test_pseudo_agent.py`: 신규 프롬프트 에이전트 API 테스트 스크립트

---
**보고사항**: 
현재 모든 기능이 **Supabase**에서 **AWS** 중심으로 전환 완료되었으며, 유실되었던 아바타 링크들도 기본 오리로 안전하게 복구된 상태입니다. 🦆
