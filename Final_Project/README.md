# Engineer-Gym

> 게이미피케이션 기반 AI 엔지니어링 실습 플랫폼

개발자의 **논리적 사고력**과 **실무 역량**을 게임처럼 훈련하는 웹 플랫폼입니다.
JRPG 테마의 캐릭터("Coduck")와 함께 의사코드 작성, 시스템 설계, 디버깅, 운영 실습을 단계별로 수행하고, OpenAI 기반 AI가 사고 과정을 평가해 피드백을 제공합니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Vue 3 (Composition API), Vite, Tailwind CSS, Pinia, Monaco Editor, Mermaid |
| **Backend** | Django, Django REST Framework, drf-spectacular (Swagger) |
| **Database** | PostgreSQL 15 |
| **AI** | OpenAI API (GPT-4o / GPT-4o-mini) |
| **Infra** | Docker Compose |

---

## 프로젝트 구조

```text
Final_Project/
├── backend/
│   ├── config/                # Django 설정 (settings, urls, wsgi)
│   ├── core/
│   │   ├── models/            # 데이터 모델 (User, Practice, Dashboard, Common)
│   │   ├── views/             # API 뷰 (인증, 유저, 실습, AI 평가)
│   │   ├── fixtures/          # 초기 데이터 (common_data, practice_data)
│   │   └── migrations/
│   ├── scripts/               # 데이터 수집·의사코드 생성 스크립트
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── home/          # 랜딩 페이지 (LandingView)
│   │   │   ├── practice/      # 실습 모듈 (핵심 기능)
│   │   │   │   ├── components/    # 공통 실습 컴포넌트
│   │   │   │   ├── composables/   # 재사용 로직 (평가, 힌트, Pyodide 등)
│   │   │   │   ├── services/      # API 호출 서비스
│   │   │   │   └── support/       # 보조 UI (가이드북, 로직미러 등)
│   │   │   ├── board/         # 공지사항
│   │   │   ├── dashboard/     # 관리자 통계
│   │   │   └── user/          # 로그인/회원가입
│   │   ├── stores/            # Pinia 상태 관리 (auth, game, ui)
│   │   ├── data/              # 정적 데이터 (문제, 퀘스트, 아키텍처 원칙)
│   │   ├── utils/             # 유틸리티 (파서, TTS, 스펠엔진)
│   │   ├── App.vue            # 루트 컴포넌트
│   │   └── main.js            # 엔트리 포인트 & 라우터 설정
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 핵심 기능

### Unit 1. 의사코드 훈련 (Pseudo Practice)

스타워즈 풍 시네마틱 인트로와 함께 시작되는 퀘스트 기반 학습입니다.

1. **도메인 인터뷰** — 비즈니스 맥락 이해를 위한 객관식 질문
2. **의사코드 설계** — 자연어로 로직을 설계하고 AI 챗봇과 상호작용
3. **로직 미러 & 구현** — 카드 기반 로직 시각화 + Monaco Editor로 Python 코딩
4. **심화 분석 인터뷰** — 파이프라인 검증을 위한 심화 질문
5. **최종 리포트** — AI가 정합성·추상화·예외처리·구현력·설계력 5개 지표로 평가

### Unit 2. 시스템 아키텍처 설계 (System Architecture)

비주얼 노벨 스타일 인트로 후 드래그 앤 드롭으로 시스템을 설계합니다.

- 컴포넌트 팔레트에서 필요한 요소를 캔버스에 배치
- 제출 시 **6대 아키텍처 원칙**(신뢰성, 성능 최적화, 운영 유용성, 비용, 보안, 지속가능성)으로 평가
- 딥다이브 질문을 통한 추가 검증

### Unit 3. 디버그 훈련 (Bug Hunt)

다단계 미션 형태의 버그 수정 실습입니다.

- 버그가 포함된 코드를 Monaco Editor에서 직접 수정
- 각 단계마다 **수정 이유를 설명**해야 하며, AI가 사고 과정을 평가
- 평가 지표: 사고 방향성, 코드 위험도, 사고 연속성
- XP, 프로틴 셰이크(재화), 레벨업 시스템

### Unit 4. 운영 실습 (Ops Practice)

난이도별(Easy/Medium/Hard) 인시던트 대응 훈련입니다.

- 컴퓨터 모니터 UI로 문제 상황 제시
- 힌트 시스템과 시도 횟수 추적
- 장애 대응 사고력 평가

---

## 시스템 아키텍처 & 코드 흐름

### 전체 흐름

```text
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────────┐
│  Landing     │ ──→ │  유닛 선택     │ ──→ │  실습 진행     │ ──→ │  결과 리포트    │
│  (홈 화면)    │     │  (App.vue)    │     │  (각 Practice) │     │  (AI 평가)     │
└─────────────┘     └──────────────┘     └──────────────┘     └───────────────┘
```

### Frontend ↔ Backend 흐름

```text
[Vue Frontend]                          [Django Backend]                [OpenAI]
     │                                        │                            │
     │── POST /api/core/auth/login/ ─────────→│                            │
     │←──── session cookie ──────────────────│                            │
     │                                        │                            │
     │── GET /api/core/practices/ ───────────→│                            │
     │←──── 유닛·문제 데이터 (JSON) ──────────│                            │
     │                                        │                            │
     │── POST /api/core/ai-evaluate/ ────────→│── GPT-4o 프롬프트 ────────→│
     │                                        │←── 평가 결과 (JSON) ───────│
     │←──── 점수·피드백·꼬리질문 ─────────────│                            │
     │                                        │                            │
     │── POST /api/core/ai-bughunt-evaluate/ →│── GPT-4o 프롬프트 ────────→│
     │                                        │←── 사고력 평가 결과 ────────│
     │←──── 통과 여부·코드 위험도·총평 ───────│                            │
```

### AI 평가 파이프라인

**의사코드 평가** (`/api/core/ai-evaluate/`)
- 입력: 유저가 작성한 로직 문장 배열, 코드, 자유 답변
- 처리: GPT-4o가 "코드 마법사" 역할로 논리 품질 분석
- 출력: 5개 지표 점수(정합성·추상화·예외처리·구현력·설계력) + 꼬리질문

**버그헌트 평가** (`/api/core/ai-bughunt-evaluate/`)
- 입력: 미션 단계별 버그 코드, 유저 수정 코드, 설명, 퍼포먼스 지표
- 처리: 3개 모델이 각각 사고 방향성 / 코드 위험도 / 사고 연속성 평가
- 출력: 통과 여부, 위험도 점수, 사고력 점수, 단계별 피드백

---

## 주요 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/core/auth/login/` | 로그인 (이메일/비밀번호) |
| `POST` | `/api/core/auth/logout/` | 로그아웃 |
| `GET` | `/api/core/auth/me/` | 세션 확인 |
| `GET/POST` | `/api/core/users/` | 유저 목록 조회 / 회원가입 |
| `GET` | `/api/core/practices/` | 실습 유닛·문제 목록 |
| `GET` | `/api/core/practices/{id}/` | 유닛 상세 (하위 문제 포함) |
| `GET` | `/api/core/commons/` | 공통 코드 조회 |
| `POST` | `/api/core/ai-evaluate/` | 의사코드 AI 평가 |
| `POST` | `/api/core/ai-bughunt-evaluate/` | 버그헌트 AI 평가 |
| `GET` | `/api/docs/` | Swagger API 문서 |

---

## 실행 방법

### Docker Compose (권장)

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일에 DB_PASSWORD, OPENAI_API_KEY 등 입력

# 2. 컨테이너 실행
docker-compose up --build

# 3. DB 마이그레이션 & 초기 데이터
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py loaddata common_data practice_unit_data practice_detail_data
```

접속: 프론트엔드 `http://localhost:5173` / 백엔드 API `http://localhost:8000/api/docs/`

### 로컬 개발

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata common_data practice_unit_data practice_detail_data
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

---

## 환경 변수

### Backend (`backend/.env`)

| 변수명 | 설명 |
|--------|------|
| `SECRET_KEY` | Django 시크릿 키 |
| `DEBUG` | 디버그 모드 (True/False) |
| `DB_ENGINE` | DB 엔진 (`django.db.backends.postgresql`) |
| `DB_NAME` | 데이터베이스 이름 |
| `DB_USER` | DB 사용자 |
| `DB_PASSWORD` | DB 비밀번호 |
| `DB_HOST` | DB 호스트 |
| `DB_PORT` | DB 포트 |
| `OPENAI_API_KEY` | OpenAI API 키 |

### Frontend (`frontend/.env`)

| 변수명 | 설명 |
|--------|------|
| `VITE_OPENAI_API_KEY` | OpenAI API 키 (프론트엔드용) |
