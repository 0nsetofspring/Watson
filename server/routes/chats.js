// server/routes/chats.js

const express = require('express');
const isLoggedIn = require('./isLoggedIn');
const prisma = require('../lib/prisma');

// 1. @google-cloud/vertexai 라이브러리를 사용하도록 변경
const { VertexAI } = require('@google-cloud/vertexai');

// 2. Vertex AI 클라이언트 초기화 (API 키 대신 프로젝트 정보 사용)
const vertex_ai = new VertexAI({
    project: 'fiery-tribute-465711-a0', // <<-- 여기에 본인의 Google Cloud 프로젝트 ID를 입력하세요!
    location: 'us-central1',
});

// 3. 사용할 모델 설정
const model = 'gemini-2.0-flash';

// 4. 생성 모델 인스턴스화
const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
});

const router = express.Router();

router.post('/:playthroughId/chats', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '메시지 내용이 필요합니다.' });
  }

  try {
    // --- 이 부분은 기존 코드와 동일합니다 ---
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: Number(playthroughId), userId: userId },
      include: { scenario: { include: { npcs: true } } },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '진행 중인 게임을 찾을 수 없습니다.' });
    }
    const currentNpc = playthrough.scenario.npcs[0];
    if (!currentNpc) {
      return res.status(404).json({ error: '대화할 NPC를 찾을 수 없습니다.' });
    }
    await prisma.chatLog.create({
      data: {
        playthroughId: Number(playthroughId),
        isUserMessage: true,
        messageText: message,
        npcId: currentNpc.id,
      },
    });
    const history = await prisma.chatLog.findMany({
      where: { playthroughId: Number(playthroughId) },
      orderBy: { createdAt: 'asc' },
    });
    // --- 여기까지 동일 ---

    // 5. Vertex AI 형식에 맞게 채팅 시작 및 메시지 전송
    const chat = generativeModel.startChat({
        history: history.map(log => ({
            role: log.isUserMessage ? "user" : "model",
            parts: [{ text: log.messageText }],
        })),
    });
    
    const result = await chat.sendMessage(message);
    const llmResponse = result.response;
    
    // 6. 응답에서 텍스트를 추출하는 방식이 약간 변경됨
    const llmMessageText = llmResponse.candidates[0].content.parts[0].text;
    
    const newNpcMessage = await prisma.chatLog.create({
      data: {
        playthroughId: Number(playthroughId),
        isUserMessage: false,
        messageText: llmMessageText,
        npcId: currentNpc.id,
      },
    });
    
    res.status(200).json({
      id: newNpcMessage.id,
      isUserMessage: newNpcMessage.isUserMessage,
      messageText: newNpcMessage.messageText,
      isHighlighted: newNpcMessage.isHighlighted,
      createdAt: newNpcMessage.createdAt,
      npcId: newNpcMessage.npcId,
    });

  } catch (error) {
    console.error('채팅 처리 중 오류:', error);
    res.status(500).json({ error: '채팅 처리 중 서버 오류가 발생했습니다.' });
  }
});

module.exports = router;