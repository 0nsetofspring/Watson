const express = require('express');
const { PrismaClient } = require('@prisma/client');
const isLoggedIn = require('../isLoggedIn'); // 로그인 미들웨어
const prisma = require('../../lib/prisma');

const router = express.Router();

/**
 * @description POST /api/playthroughs - 새로운 게임 시작 (플레이쓰루 생성)
 * @request (Header) Authorization: Bearer ${accessToken}
 * @request (Body) { scenarioId: number }
 * @response (201 Created) { playthroughId: number }
 */
router.post('/', isLoggedIn, async (req, res) => {
  const { scenarioId } = req.body;
  const userId = req.user.id; // isLoggedIn 미들웨어에서 저장해준 사용자 ID

  if (!scenarioId) {
    return res.status(400).json({ error: 'scenarioId가 필요합니다.' });
  }

  try {
    // 새로운 게임 진행(Playthrough) 정보를 생성
    const newPlaythrough = await prisma.playthrough.create({
      data: {
        status: 'IN_PROGRESS', // 게임 상태: 진행 중
        userId: userId,
        scenarioId: Number(scenarioId),
      },
    });

    // 명세서에 따라 새로 생성된 playthroughId를 응답
    res.status(201).json({ playthroughId: newPlaythrough.id });

  } catch (error) {
    console.error('게임 시작 처리 중 오류:', error);
    res.status(500).json({ error: '게임 시작 처리 중 서버 오류가 발생했습니다.' });
  }
});

// 진행 중인 플레이쓰루 1개 반환
router.get('/active', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  try {
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        scenario: { select: { title: true } }
      }
    });
    if (!playthrough) {
      return res.status(404).json({ error: '진행 중인 게임이 없습니다.' });
    }
    res.json({
      playthroughId: playthrough.id,
      scenarioId: playthrough.scenarioId,
      scenarioTitle: playthrough.scenario.title
    });
  } catch (error) {
    res.status(500).json({ error: '진행 중인 게임을 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;