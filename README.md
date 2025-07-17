# 왓슨 (Watson) - LLM 기반 추리 웹게임

**왓슨**은 플레이어가 탐정이 되어 LLM(거대 언어 모델)이 생성하는 NPC들과의 대화를 통해 단서를 수집하고 사건의 진실을 파헤치는 텍스트 기반 추리 웹게임입니다.

## 🎮 주요 기능

  * **LLM 기반의 동적 대화 시스템**: Google의 **Gemini** 모델을 활용하여 NPC들과 실시간으로 대화하며 정보를 얻고, 숨겨진 단서를 찾아낼 수 있습니다.
  * **단서 조사 및 추리 시스템**: 사건 현장에서 증거를 수집하고, NPC와의 대화 중 중요한 내용은 '하이라이트'하여 메모장에 기록할 수 있습니다. 수집한 증거와 증언을 바탕으로 최종 추리를 완성하고 범인을 지목하여 사건을 해결합니다.
  * **로그인 및 플레이 기록**: Google 계정을 이용한 간편 로그인을 지원하며, 플레이어별로 시나리오 클리어 현황과 엔딩 컬렉션을 관리할 수 있습니다.
  * **다양한 시나리오와 멀티 엔딩**: 공식적으로 제공되는 시나리오 외에도, 유저가 직접 시나리오를 제작하고 공유하는 기능을 염두에 두고 설계되었습니다. 플레이어의 선택과 추리에 따라 다양한 엔딩을 경험할 수 있습니다.

## 🛠️ 기술 스택

| 구분 | 기술 |
| --- | --- |
| **프론트엔드** | `React`, `Vite`, `Styled-Components` |
| **백엔드** | `Node.js`, `Express.js` |
| **데이터베이스** | `PostgreSQL`, `Prisma` |
| **LLM** | `Google Gemini` |

## 🚀 시작하기

### 1\. 프로젝트 클론

```bash
git clone https://github.com/onsetofspring/Watson.git
cd Watson
```

### 2\. 환경 변수 설정

`server` 디렉토리 내에 `.env` 파일을 생성하고, 아래와 같이 필요한 환경 변수를 설정합니다.

```env
# .env

# 데이터베이스 연결 정보
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Google OAuth 클라이언트 ID
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"

# JWT 비밀 키
JWT_SECRET="YOUR_JWT_SECRET_KEY"

# Google Cloud Platform (Vertex AI) 정보
GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID"
GCP_LOCATION="YOUR_GCP_LOCATION"
```

### 3\. 백엔드 서버 실행

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 4\. 프론트엔드 서버 실행

별도의 터미널을 열어 아래 명령어를 실행합니다.

```bash
cd client
npm install
npm run dev
```

이제 브라우저에서 `http://localhost:5173`으로 접속하여 게임을 즐길 수 있습니다.

## 📂 프로젝트 구조

```
Watson/
├── client/         # 프론트엔드 (React)
│   ├── src/
│   │   ├── api/        # 백엔드 API 연동 함수
│   │   ├── assets/     # 이미지, 폰트 등 정적 파일
│   │   ├── components/ # 재사용 가능한 UI 컴포넌트
│   │   ├── context/    # 전역 상태 관리 (AuthContext)
│   │   └── pages/      # 라우팅 단위 페이지 컴포넌트
│   └── ...
├── server/         # 백엔드 (Node.js, Express)
│   ├── prisma/
│   │   ├── migrations/ # DB 마이그레이션 기록
│   │   └── seed.js     # 초기 데이터 생성 스크립트
│   ├── routes/       # API 라우팅 로직
│   │   ├── mainTab/    # 메인 화면 관련 API
│   │   └── scenario/   # 게임 시나리오 관련 API
│   ├── lib/          # Prisma, Gemini 클라이언트 설정
│   └── index.js      # 서버 진입점
└── ...
```

## 📝 API 엔드포인트

  - **`POST /api/auth/google`**: 구글 ID 토큰으로 로그인 및 회원가입을 처리합니다.
  - **`GET /api/scenarios`**: 플레이 가능한 모든 시나리오 목록을 조회합니다.
  - **`POST /api/playthroughs`**: 새로운 게임(플레이스루)을 시작합니다.
  - **`POST /api/playthroughs/:playthroughId/chats`**: NPC와 채팅 메시지를 전송하고 LLM의 응답을 받습니다.
  - **`GET /api/playthroughs/:playthroughId/chats`**: 해당 게임의 전체 채팅 기록을 조회합니다.
  - **`PUT /api/chats/:chatId/highlight`**: 특정 채팅 메시지를 하이라이트하거나 해제합니다.
  - **`POST /api/scenario/investigation/start`**: 단서 조사를 시작합니다.
  - **`POST /api/scenario/investigation/complete`**: 단서 조사를 완료합니다.
  - **`POST /api/playthroughs/:playthroughId/conclude`**: 최종 추리를 제출하고 AI의 평가를 받습니다.
