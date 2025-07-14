// server/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library'); // 구글 인증 라이브러리
const prisma = require('../lib/prisma');

const router = express.Router();

const { GOOGLE_CLIENT_ID, JWT_SECRET } = process.env;

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * @description POST /api/auth/google
 * 프론트엔드에서 받은 구글 ID 토큰으로 로그인/회원가입 처리
 */
router.post('/google', async (req, res) => {
  // 1. 요청 본문에서 'googleToken' 필드명의 값을 받습니다.
  const { googleToken } = req.body;
  if (!googleToken) {
    return res.status(400).json({ error: 'Google ID 토큰이 필요합니다.' });
  }

  try {
    // 2. 바로 ID 토큰을 검증합니다.
    const ticket = await oAuth2Client.verifyIdToken({ //구글에서 제공하는 토큰 검증 함수
        idToken: googleToken, //검증할 토큰 (프론트엔드에서 받은 것)
        audience: GOOGLE_CLIENT_ID, //이 토큰이 우리 앱을 위한 것인지 확인
    });

    const payload = ticket.getPayload(); //검증된 토큰에서 실제 사용자 정보를 추출
    if (!payload) {
        return res.status(400).json({ error: '유효하지 않은 토큰입니다.' });
    }
    const { email, name } = payload;

    // 3. DB에서 사용자를 찾거나 없으면 새로 생성합니다.
    const user = await prisma.user.upsert({ //upsert: 이메일이 이미 있으면 기존 user를 사용, 없으면 새로 생성
      where: { email }, //이메일로 사용자를 찾음
      update: {},
      create: {
        email,
        nickname: `${name.substring(0, 8)}-${Math.random().toString(16).substring(2, 6)}`,
      },
    });

    // 4. 우리 서비스의 JWT 발급
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' }); //JWT 토큰을 생성
    res.json({
      accessToken: accessToken, //다른 API 요청할 때 인증 헤더에 포함
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    });

  } catch (error) {
    console.error('Google 로그인 처리 중 오류:', error);
    res.status(500).json({ error: '로그인 처리 중 서버에서 오류가 발생했습니다.' });
  }
});

module.exports = router;