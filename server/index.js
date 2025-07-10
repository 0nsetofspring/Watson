// 파일 위치: Watson/server/index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = 3000; // 백엔드 서버가 실행될 포트

app.use(cors()); // 모든 도메인에서의 요청을 허용 (개발 초기 단계)
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 서버가 이해할 수 있게 함

// 테스트용 API: 서버가 잘 켜졌는지 확인
app.get('/', (req, res) => {
  res.send('안녕하세요, 백엔드 서버입니다! 👋');
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});