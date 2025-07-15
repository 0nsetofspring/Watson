// server/routes/mainTab/gameStart.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const isLoggedIn = require('../isLoggedIn');
const prisma = require('../../lib/prisma');

const router = express.Router();
const { VertexAI } = require('@google-cloud/vertexai');

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
          include: {
            rooms: {
              include: {
                npcs: true,
                interactiveObjects: true
              }
            },
            endings: true
          }
        },
        chatLogs: true
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
      createdAt: playthrough.createdAt,
      scenario: playthrough.scenario,
      chatLogs: playthrough.chatLogs
    });
  } catch (error) {
    console.error('게임 정보 조회 중 오류:', error);
    res.status(500).json({ error: '게임 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * @description POST /api/playthroughs/:playthroughId/conclude - 최종 추리 제출 및 평가
 */
router.post('/:playthroughId/conclude', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const { culpritName, reasoningText } = req.body; // 프론트에서 보낸 범인 이름과 추리 내용

  if (!culpritName || !reasoningText) {
    return res.status(400).json({ error: '범인 지목과 추리 내용을 모두 입력해야 합니다.' });
  }

  try {
    const playthrough = await prisma.playthrough.findUnique({
      where: { id: Number(playthroughId) },
      include: { scenario: { include: { endings: { where: { name: '진실' }, }, }, }, },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '게임을 찾을 수 없습니다.' });
    }

    const trueEnding = playthrough.scenario.endings[0];
    if (!trueEnding) {
      return res.status(500).json({ error: '시나리오의 진실 정보를 찾을 수 없습니다.' });
    }

    const vertex_ai = new VertexAI({project: process.env.GCP_PROJECT_ID, location: process.env.GCP_LOCATION});
    const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-2.0-flash', // 또는 사용 가능한 다른 모델
    });

    const prompt = `
      당신은 베테랑 사립 탐정 '솔브'입니다. 당신의 후배 탐정(플레이어)이 KAIST 학생 사망 사건에 대한 최종 보고서를 제출했습니다. 
      아래의 '사건의 진실'과 후배 탐정이 제출한 '추리 보고서'를 비교하여, 전문가의 입장에서 냉철하고 상세한 평가를 내려주세요.

      [사건의 진실]
      ${trueEnding.description}

      [후배 탐정의 추리 보고서]
      - 지목한 범인: ${culpritName}
      - 추리 내용: ${reasoningText}

      [당신이 작성해야 할 평가 보고서의 조건]
      1.  보고서는 반드시 JSON 형식으로 출력해야 합니다.
      2.  JSON 객체는 isCorrect(boolean), similarity(number), reportTitle(string), reportBody(string) 네 개의 키를 가져야 합니다.
      3.  isCorrect: 후배가 지목한 범인이 '김지연'이면 true, 아니면 false로 설정하세요.
      4.  similarity: 후배의 추리 내용이 '사건의 진실'과 얼마나 유사한지 0부터 100까지의 숫자로 평가하세요. (범인, 동기, 수법, 핵심 증거를 모두 맞췄을 때 100점에 가깝습니다.)
      5.  reportTitle: isCorrect 값에 따라 "판정 결과: 진실" 또는 "판정 결과: 거짓"으로 설정하세요.
      6.  reportBody: 아래의 분석 내용을 포함하여, 후배의 추리를 상세하고 길게(최소 5문장 이상) 평가하는 보고서 본문을 작성하세요.
          - 칭찬 또는 지적: 후배의 추리가 날카로웠던 점이나, 결정적으로 놓친 부분을 구체적으로 언급하세요.
          - 유사도 분석 상세: 범인 특정, 범행 동기, 범행 수법, 핵심 증거 연결 각 항목에 대해 추리가 얼마나 정확했는지 분석하고 그 이유를 설명하여, 전체 유사도 점수가 어떻게 산출되었는지 플레이어가 납득할 수 있도록 하세요.
    `;

    // 4. AI에게 추리 평가 요청
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const reportJsonText = response.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const reportData = JSON.parse(reportJsonText);

    // 5. 플레이어가 선택한 엔딩의 ID를 찾음
    // Ending 테이블에서 "범인은 OOO이다." 라는 설명으로 엔딩을 찾습니다.
    const chosenEnding = await prisma.ending.findFirst({
      where: {
          scenarioId: playthrough.scenarioId,
          description: {
              contains: `범인은 ${culpritName}이다.`
          }
        }
    });

    if (chosenEnding) {
        // 6. UserEnding 테이블에 새로운 기록 생성
        await prisma.userEnding.create({
            data: {
                userId: req.user.id,
                endingId: chosenEnding.id,
                unlockedAt: new Date() // 기록된 시간
            }
        });
        console.log(`User ${req.user.id} unlocked ending ${chosenEnding.id}`);
    } else {
        console.log(`Could not find an ending for culprit: ${culpritName}`);
    }

    await prisma.playthrough.update({
      where: { id: Number(playthroughId) },
      data: { status: 'COMPLETED' },
    });

    res.status(200).json(reportData);

  } catch (error) {
    console.error('추리 평가 중 오류 발생:', error);
    res.status(500).json({ error: '추리를 평가하는 중 서버에서 오류가 발생했습니다.' });
  }
});

module.exports = router;