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

    // 해당 객체 정보를 먼저 가져와서 타입 확인
    const targetObject = await prisma.interactiveObject.findUnique({
      where: { id: Number(objectId) },
      include: {
        room: {
          include: {
            scenario: true,
          },
        },
      },
    });

    if (!targetObject) {
      return res.status(404).json({ error: '객체를 찾을 수 없습니다.' });
    }

    // 키 타입이 아닌 경우에만 다른 진행 중인 조사 확인
    if (targetObject.type !== 'key') {
      const activeInvestigation = await prisma.playthroughObjectState.findFirst({
        where: {
          playthroughId: Number(playthroughId),
          isInInspectation: true,
          interactiveObject: {
            type: { not: 'key' }, // 키는 제외하고 조사
          },
        },
        include: {
          interactiveObject: true,
        },
      });

      console.log('현재 진행 중인 조사 (키 제외):', activeInvestigation);
      console.log('요청된 객체 ID:', objectId, '타입:', targetObject.type);

      if (activeInvestigation && activeInvestigation.interactiveObjectId !== Number(objectId)) {
        return res.status(400).json({ 
          error: '이미 진행 중인 조사가 있습니다.',
          activeObjectName: activeInvestigation.interactiveObject.name,
          activeObjectId: activeInvestigation.interactiveObjectId,
          requestedObjectId: Number(objectId)
        });
      }
    } else {
      console.log('키 수집 요청:', objectId, '타입:', targetObject.type);
    }

    // 현재 플레이스루에서 해당 객체의 상태 확인
    const existingState = await prisma.playthroughObjectState.findUnique({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
    });

    if (existingState && existingState.isInInspectation) {
      // 이미 조사 중인 경우, 새로 시작하지 않고 현재 상태 반환
      return res.status(200).json({ 
        message: targetObject.type === 'key' ? '이미 수집한 키입니다.' : '이미 조사 중인 객체입니다.',
        objectName: targetObject.name,
        requiredQuestions: targetObject.requiredQuestions || 3,
        alreadyStarted: true
      });
    }

    // 조사/수집 시작: 상태 생성 또는 업데이트
    const stateData = { 
      isInInspectation: true,
      isCompleted: false,
    };
    
    // 키가 아닌 경우에만 remainingQuestions 설정
    if (targetObject.type !== 'key' && targetObject.requiredQuestions) {
      stateData.remainingQuestions = targetObject.requiredQuestions;
    }
    
    const updatedState = await prisma.playthroughObjectState.upsert({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
      update: stateData,
      create: {
        playthroughId: Number(playthroughId),
        interactiveObjectId: Number(objectId),
        ...stateData,
      },
    });

    res.status(200).json({ 
      message: targetObject.type === 'key' ? '키를 수집했습니다.' : '조사를 시작했습니다.',
      objectName: targetObject.name,
      requiredQuestions: targetObject.requiredQuestions || 3,
      remainingQuestions: targetObject.type !== 'key' ? targetObject.requiredQuestions : null,
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

    // 해당 객체 상태 확인
    const objectState = await prisma.playthroughObjectState.findUnique({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
      include: {
        interactiveObject: true,
      },
    });

    console.log('완료할 객체 상태:', objectState);

    if (!objectState) {
      return res.status(404).json({ error: '객체 상태를 찾을 수 없습니다.' });
    }

    if (!objectState.isInInspectation) {
      console.log('조사 중이 아닌 객체:', objectState.interactiveObject.name);
      return res.status(400).json({ error: '조사 중이 아닌 객체입니다.' });
    }

    // remainingQuestions가 0 이하인지 확인 (키가 아닌 경우에만)
    if (objectState.interactiveObject.type !== 'key' && objectState.remainingQuestions > 0) {
      return res.status(400).json({ 
        error: '아직 조사가 완료되지 않았습니다.',
        remainingQuestions: objectState.remainingQuestions
      });
    }

    // 조사 완료: isInInspectation을 false로 설정하고 isCompleted를 true로 설정
    const updateResult = await prisma.playthroughObjectState.update({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
      data: { 
        isInInspectation: false,
        isCompleted: true,
        remainingQuestions: 0,
      },
    });

    console.log('업데이트 결과:', updateResult);

    res.status(200).json({ 
      message: '조사가 완료되었습니다.',
      objectName: objectState.interactiveObject.name
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

    // 현재 진행 중인 조사 찾기 (키는 제외)
    const activeInvestigation = await prisma.playthroughObjectState.findFirst({
      where: {
        playthroughId: Number(playthroughId),
        isInInspectation: true,
        interactiveObject: {
          type: { not: 'key' }, // 키는 조사 대상이 아니므로 제외
        },
      },
      include: {
        interactiveObject: true,
      },
    });

    res.status(200).json({
      hasActiveInvestigation: !!activeInvestigation,
      activeObject: activeInvestigation ? {
        id: activeInvestigation.interactiveObject.id,
        name: activeInvestigation.interactiveObject.name,
        requiredQuestions: activeInvestigation.interactiveObject.requiredQuestions || 3,
        remainingQuestions: activeInvestigation.remainingQuestions
      } : null
    });

  } catch (error) {
    console.error('조사 상태 확인 중 오류:', error);
    res.status(500).json({ error: '조사 상태 확인 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @description POST /api/scenario/investigation/question - 조사 중인 객체에 질문하여 remainingQuestions 감소
 */
router.post('/question', isLoggedIn, async (req, res) => {
  const { objectId, playthroughId } = req.body;
  const userId = req.user.id;

  if (!objectId || !playthroughId) {
    return res.status(400).json({ error: 'objectId와 playthroughId가 필요합니다.' });
  }

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

    // 해당 객체 상태 확인
    const objectState = await prisma.playthroughObjectState.findUnique({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
      include: {
        interactiveObject: true,
      },
    });

    if (!objectState) {
      return res.status(404).json({ error: '객체 상태를 찾을 수 없습니다.' });
    }

    if (!objectState.isInInspectation) {
      return res.status(400).json({ error: '조사 중이 아닌 객체입니다.' });
    }

    if (!objectState.remainingQuestions || objectState.remainingQuestions <= 0) {
      return res.status(400).json({ error: '더 이상 질문할 수 없습니다.' });
    }

    // remainingQuestions 감소
    const updatedState = await prisma.playthroughObjectState.update({
      where: {
        playthroughId_interactiveObjectId: {
          playthroughId: Number(playthroughId),
          interactiveObjectId: Number(objectId),
        },
      },
      data: { 
        remainingQuestions: {
          decrement: 1
        }
      },
    });

    const canComplete = updatedState.remainingQuestions <= 0;

    res.status(200).json({ 
      message: '질문이 처리되었습니다.',
      objectName: objectState.interactiveObject.name,
      remainingQuestions: updatedState.remainingQuestions,
      requiredQuestions: objectState.interactiveObject.requiredQuestions || 3,
      canComplete: canComplete,
      progress: (objectState.interactiveObject.requiredQuestions || 3) - updatedState.remainingQuestions
    });

  } catch (error) {
    console.error('질문 처리 중 오류:', error);
    res.status(500).json({ error: '질문 처리 중 서버 오류가 발생했습니다.' });
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

    // 현재 방의 객체들과 해당 플레이스루의 상태 정보 가져오기
    const roomObjects = await prisma.interactiveObject.findMany({
      where: {
        roomId: Number(roomId),
        isVisible: true,
      },
      include: {
        playthroughStates: {
          where: {
            playthroughId: Number(playthroughId),
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // 객체 정보에 플레이스루별 상태 정보 병합
    const objectsWithState = roomObjects.map(obj => {
      const state = obj.playthroughStates[0]; // 해당 플레이스루의 상태
      return {
        ...obj,
        isInInspectation: state?.isInInspectation || false,
        remainingQuestions: state?.remainingQuestions || null,
        isCompleted: state?.isCompleted || false,
        playthroughStates: undefined, // 클라이언트에 전송하지 않음
      };
    });

    res.status(200).json({
      objects: objectsWithState
    });

  } catch (error) {
    console.error('방 객체 정보 조회 중 오류:', error);
    res.status(500).json({ error: '방 객체 정보 조회 중 서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 