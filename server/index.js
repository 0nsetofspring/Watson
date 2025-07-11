// 파일 위치: Watson/server/index.js

const express = require('express');
const authRouter = require('./routes/auth')
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000; // 백엔드 서버의 포트 설정

app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 서버가 이해할 수 있게 함 (body-parser)

// 반드시 app.use(express.json()) 위나 아래에 추가
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 개발 서버 주소
  credentials: true                // (쿠키 등 인증정보 필요시 true, 아니면 생략 가능)
}));

// '/api/auth' 경로로 들어오는 모든 요청을 authRouter가 처리하도록 설정 (주소 분류 담당자를 지정)
app.use('/api/auth', authRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});