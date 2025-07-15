const express = require('express');
const isLoggedIn = require('../isLoggedIn');
const prisma = require('../../lib/prisma');

const router = express.Router();

/**
 * @description POST /api/scenario/investigation/start - 단서 조사 시작
 */
router.post('/start', isLoggedIn, async (req, res) => {
  const { objectId, playthroughId } = req.body;
  const userId = req.user.id;

  if (!objectId || !playthroughId) {
    return res.status(400).json({ error: 'objectId와 playthroughId가 필요합니다.' });
  }

  try {
    // 권한 확인: 해당 플레이스루가 현재 사용자의 것인지 확인
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '플레이스루를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 현재 진행 중인 다른 조사가 있는지 확인
    const activeInvestigation = await prisma.interactiveObject.findFirst({
      where: {
        isInInspectation: true,
        room: {
          scenario: {
            playthroughs: {
              some: {
                id: Number(playthroughId),
                userId: userId,
              },
            },
          },
        },
      },
    });

    console.log('현재 진행 중인 조사:', activeInvestigation);
    console.log('요청된 객체 ID:', objectId);

    if (activeInvestigation && activeInvestigation.id !== Number(objectId)) {
      return res.status(400).json({ 
        error: '이미 진행 중인 조사가 있습니다.',
        activeObjectName: activeInvestigation.name,
        activeObjectId: activeInvestigation.id,
        requestedObjectId: Number(objectId)
      });
    }

    // 해당 객체가 존재하고 조사 가능한지 확인
    const object = await prisma.interactiveObject.findUnique({
      where: { id: Number(objectId) },
      include: {
        room: {
          include: {
            scenario: true,
          },
        },
      },
    });

    if (!object) {
      return res.status(404).json({ error: '객체를 찾을 수 없습니다.' });
    }

    if (object.isInInspectation) {
      // 이미 조사 중인 경우, 새로 시작하지 않고 현재 상태 반환
      return res.status(200).json({ 
        message: '이미 조사 중인 객체입니다.',
        objectName: object.name,
        requiredQuestions: object.requiredQuestions || 3,
        alreadyStarted: true
      });
    }

    // 조사 시작: isInInspectation을 true로 설정
    await prisma.interactiveObject.update({
      where: { id: Number(objectId) },
      data: { isInInspectation: true },
    });

    res.status(200).json({ 
      message: '조사를 시작했습니다.',
      objectName: object.name,
      requiredQuestions: object.requiredQuestions || 3,
      alreadyStarted: false
    });

  } catch (error) {
    console.error('조사 시작 중 오류:', error);
    res.status(500).json({ error: '조사 시작 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @description POST /api/scenario/investigation/complete - 단서 조사 완료
 */
router.post('/complete', isLoggedIn, async (req, res) => {
  const { objectId, playthroughId } = req.body;
  const userId = req.user.id;

  if (!objectId || !playthroughId) {
    return res.status(400).json({ error: 'objectId와 playthroughId가 필요합니다.' });
  }

  try {
    console.log('조사 완료 요청:', { objectId, playthroughId, userId });
    
    // 권한 확인
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '플레이스루를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 해당 객체 확인
    const object = await prisma.interactiveObject.findUnique({
      where: { id: Number(objectId) },
    });

    console.log('완료할 객체 정보:', object);

    if (!object) {
      return res.status(404).json({ error: '객체를 찾을 수 없습니다.' });
    }

    if (!object.isInInspectation) {
      console.log('조사 중이 아닌 객체:', object.name);
      return res.status(400).json({ error: '조사 중이 아닌 객체입니다.' });
    }

    // 조사 완료: isInInspectation을 false로 설정
    const updateResult = await prisma.interactiveObject.update({
      where: { id: Number(objectId) },
      data: { isInInspectation: false },
    });

    console.log('업데이트 결과:', updateResult);

    res.status(200).json({ 
      message: '조사를 완료했습니다.',
      objectName: object.name,
      detailContent: object.data || '상세 정보가 없습니다.'
    });

  } catch (error) {
    console.error('조사 완료 중 오류:', error);
    res.status(500).json({ error: '조사 완료 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @description GET /api/scenario/investigation/status/:playthroughId - 현재 조사 상태 확인
 */
router.get('/status/:playthroughId', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;

  try {
    // 권한 확인
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '플레이스루를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 현재 진행 중인 조사 찾기
    const activeInvestigation = await prisma.interactiveObject.findFirst({
      where: {
        isInInspectation: true,
        room: {
          scenario: {
            playthroughs: {
              some: {
                id: Number(playthroughId),
                userId: userId,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      hasActiveInvestigation: !!activeInvestigation,
      activeObject: activeInvestigation ? {
        id: activeInvestigation.id,
        name: activeInvestigation.name,
        requiredQuestions: activeInvestigation.requiredQuestions || 3
      } : null
    });

  } catch (error) {
    console.error('조사 상태 확인 중 오류:', error);
    res.status(500).json({ error: '조사 상태 확인 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @description GET /api/scenario/investigation/room-objects/:playthroughId/:roomId - 현재 방의 최신 객체 정보 가져오기
 */
router.get('/room-objects/:playthroughId/:roomId', isLoggedIn, async (req, res) => {
  const { playthroughId, roomId } = req.params;
  const userId = req.user.id;

  try {
    // 권한 확인
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '플레이스루를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 현재 방의 최신 객체 정보 가져오기
    const roomObjects = await prisma.interactiveObject.findMany({
      where: {
        roomId: Number(roomId),
        isVisible: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json({
      objects: roomObjects
    });

  } catch (error) {
    console.error('방 객체 정보 조회 중 오류:', error);
    res.status(500).json({ error: '방 객체 정보 조회 중 서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 