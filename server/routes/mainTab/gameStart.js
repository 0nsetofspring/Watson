// server/routes/mainTab/gameStart.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const isLoggedIn = require('../isLoggedIn');
const prisma = require('../../lib/prisma');

const router = express.Router();

/**
 * @description POST /api/playthroughs - 새로운 게임 시작 (플레이쓰루 생성)
 */
router.post('/', isLoggedIn, async (req, res) => {
  const { scenarioId } = req.body;
  const userId = req.user.id;

  if (!scenarioId) {
    return res.status(400).json({ error: 'scenarioId가 필요합니다.' });
  }

  try {
    // await는 항상 async 라는 키워드가 붙은 함수 안에서만 사용
    await prisma.playthrough.updateMany({
      where: {
        userId: userId,
        status: 'IN_PROGRESS', // 상태가 'IN_PROGRESS'인 게임들을 찾아서
      },
      data: {
        status: 'ABANDONED', // 상태를 'ABANDONED'(포기함)으로 모두 변경합니다.
      },
    });

    const newPlaythrough = await prisma.playthrough.create({
      data: {
        status: 'IN_PROGRESS',
        userId: userId,
        scenarioId: Number(scenarioId),
        playTimeInSeconds: 0,
      },
    });

    res.status(201).json({ playthroughId: newPlaythrough.id });

  } catch (error) {
    console.error('게임 시작 처리 중 오류:', error);
    res.status(500).json({ error: '게임 시작 처리 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @description GET /api/playthroughs/active - 진행 중인 플레이쓰루 1개 반환
 */
router.get('/active', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  try {
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        scenario: { select: { title: true } },
      },
    });
    if (!playthrough) {
      return res.status(404).json({ error: '진행 중인 게임이 없습니다.' });
    }
    res.json({
      playthroughId: playthrough.id,
      scenarioId: playthrough.scenarioId,
      scenarioTitle: playthrough.scenario.title,
    });
  } catch (error) {
    res.status(500).json({ error: '진행 중인 게임을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 특정 playthroughId로 게임 정보 가져오기
router.get('/:playthroughId', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;
  
  try {
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId, // 본인의 게임만 접근 가능
      },
      include: {
        scenario: { 
          select: { 
            title: true, 
            backgroundScript: true 
          } 
        }
      }
    });
    
    if (!playthrough) {
      return res.status(404).json({ error: '게임을 찾을 수 없습니다.' });
    }
    
    res.json({
      playthroughId: playthrough.id,
      scenarioId: playthrough.scenarioId,
      scenarioTitle: playthrough.scenario.title,
      backgroundScript: playthrough.scenario.backgroundScript,
      status: playthrough.status,
      createdAt: playthrough.createdAt
    });
  } catch (error) {
    console.error('게임 정보 조회 중 오류:', error);
    res.status(500).json({ error: '게임 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;