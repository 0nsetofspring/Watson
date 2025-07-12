const express = require('express');
const { PrismaClient } = require('@prisma/client');
const isLoggedIn = require('../isLoggedIn'); // 방금 만든 로그인 확인 미들웨어
const prisma = require('../../lib/prisma');

const router = express.Router();

/**
 * @description GET /api/scenarios - 모든 시나리오 목록 조회 (새 게임)
 * @request (Header) Authorization: Bearer ${accessToken}
 * @response (200 OK) { id: number, title: string }[]
 */
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      // API 명세에 따라 id와 title 필드만 선택
      select: {
        id: true,
        title: true,
      },
    });

    // --- 여기부터 더미 데이터 처리 코드 ---
    // 만약 DB에서 가져온 시나리오가 없다면,
    // 더미 데이터 없이 빈 배열을 그대로 반환합니다.
    console.log('클라이언트로 전송할 시나리오 데이터:', scenarios);
    res.status(200).json(scenarios);
  } catch (error) {
    console.error('시나리오 조회 중 오류:', error);
    res.status(500).json({ error: '시나리오 목록을 가져오는 중 서버에서 오류가 발생했습니다.' });
  }
});

module.exports = router;