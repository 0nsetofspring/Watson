// server/routes/chats.js

const express = require('express');
const isLoggedIn = require('../isLoggedIn');
const prisma = require('../../lib/prisma');
const { VertexAI } = require('@google-cloud/vertexai');

const vertex_ai = new VertexAI({
    project: 'fiery-tribute-465711-a0',
    location: 'us-central1',
});
const model = 'gemini-2.0-flash';
const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
});

const router = express.Router();

// POST /:playthroughId/chats - 채팅 메시지 전송 및 LLM 응답
router.post('/:playthroughId/chats', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;
  const { message, npcId } = req.body;

  if (!message) {
    return res.status(400).json({ error: '메시지 내용이 필요합니다.' });
  }

  try {
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: Number(playthroughId), userId: userId },
      include: { scenario: {include : {rooms: { include: { npcs: true } } } } },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '진행 중인 게임을 찾을 수 없습니다.' });
    }

    if (playthrough.remainingQuestions <= 0) {
      return res.status(403).json({ error: '질문 기회를 모두 소진했습니다.' });
    }
    // NPC 찾기 - npcId가 제공되면 해당 NPC를, 아니면 첫 번째 NPC 사용
    let currentNpc = null;
    if (npcId) {
      // 모든 방에서 해당 NPC 찾기
      for (const room of playthrough.scenario.rooms) {
        currentNpc = room.npcs.find(npc => npc.id === Number(npcId));
        if (currentNpc) break;
      }
    }
    
    // NPC를 찾지 못했으면 첫 번째 방의 첫 번째 NPC 사용
    if (!currentNpc) {
      const firstRoom = playthrough.scenario.rooms[0];
      currentNpc = firstRoom?.npcs[0];
    }

    if (!currentNpc) {
      return res.status(404).json({ error: '대화할 NPC를 찾을 수 없습니다.' });
    }

    // 현재 NPC가 속한 방 찾기
    let currentRoom = null;
    for (const room of playthrough.scenario.rooms) {
      if (room.npcs.some(npc => npc.id === currentNpc.id)) {
        currentRoom = room;
        break;
      }
    }

    await prisma.chatLog.create({
      data: {
        playthroughId: Number(playthroughId),
        isUserMessage: true,
        messageText: message,
        npcId: currentNpc.id,
      },
    });
    
    // 현재 NPC와 관련된 채팅 기록만 가져오기
    const history = await prisma.chatLog.findMany({
      where: { 
        playthroughId: Number(playthroughId),
        npcId: currentNpc.id // 현재 NPC의 채팅 기록만 필터링
      },
      orderBy: { createdAt: 'asc' },
    });
    
    const systemPrompt = `
      You are a character in a mystery game. Please immerse yourself in the role based on the following information.
      You must answer in no more than two sentences.
      You answers according to his setting prompt, but as the conversation progresses, you gradually leaks information.
    
      **Overall Scenario:**
      ${playthrough.scenario.settingPrompt}
    
      **Current Location (Room):**
      ${currentRoom.description}
    
      **Your Role:**
      ${currentNpc.settingPrompt}
    `;
    
    const chatHistoryForGemini = [
      {
        role: "model",
        parts: [{ text: systemPrompt }],
      },
      ...history.map(log => ({
          role: log.isUserMessage ? "user" : "model",
          parts: [{ text: log.messageText }],
      }))
    ];

    // 3. 재구성된 대화 기록으로 채팅을 시작합니다.
    const chat = generativeModel.startChat({
        history: chatHistoryForGemini,
    });

    const result = await chat.sendMessage(message);
    const llmResponse = result.response;
    const llmMessageText = llmResponse.candidates[0].content.parts[0].text;

    const updatedPlaythrough = await prisma.playthrough.update({
      where: { id: Number(playthroughId) },
      data: {
        remainingQuestions: {
          decrement: 1,
        },
      },
    });

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


// 전체 채팅 기록 불러오기 
router.get('/:playthroughId/chats', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;

  try {
    // 1. 요청한 유저가 해당 게임의 소유자가 맞는지 먼저 확인합니다.
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    // 2. 게임이 존재하지 않거나, 소유자가 아니면 404 에러를 반환합니다.
    if (!playthrough) {
      return res.status(404).json({ error: '해당 게임을 찾을 수 없거나 접근 권한이 없습니다.' });
    }

    // 3. 해당 게임의 모든 채팅 기록을 시간 순으로 불러옵니다.
    const chatHistory = await prisma.chatLog.findMany({
      where: {
        playthroughId: Number(playthroughId),
      },
      orderBy: {
        createdAt: 'asc', // 시간 오름차순으로 정렬
      },
      // 4. API 명세서에 맞게 필요한 필드만 선택합니다.
      select: {
        id: true,
        isUserMessage: true,
        messageText: true,
        isHighlighted: true,
        createdAt: true,
        npcId: true,
        npc: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // 5. 조회된 채팅 기록을 응답합니다.
    res.status(200).json(chatHistory);

  } catch (error) {
    console.error('채팅 기록 조회 중 오류:', error);
    res.status(500).json({ error: '채팅 기록을 불러오는 중 서버 오류가 발생했습니다.' });
  }
});

// 하이라이트된 채팅 기록만 불러오기
router.get('/:playthroughId/chats/highlighted', isLoggedIn, async (req, res) => {
  const { playthroughId } = req.params;
  const userId = req.user.id;

  try {
    const playthrough = await prisma.playthrough.findFirst({
      where: {
        id: Number(playthroughId),
        userId: userId,
      },
    });

    if (!playthrough) {
      return res.status(404).json({ error: '해당 게임을 찾을 수 없거나 접근 권한이 없습니다.' });
    }

    const highlightedChatHistory = await prisma.chatLog.findMany({
      where: {
        playthroughId: Number(playthroughId),
        isHighlighted: true, // 
      },
      orderBy: {
        createdAt: 'asc',
      },

      select: {
        id: true,
        isUserMessage: true,
        messageText: true,
        isHighlighted: true,
        createdAt: true,
        npcId: true,
        npc: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    res.status(200).json(highlightedChatHistory);

  } catch (error) {
    console.error('하이라이트된 채팅 기록 조회 중 오류:', error);
    res.status(500).json({ error: '하이라이트된 채팅 기록을 불러오는 중 서버 오류가 발생했습니다.' });
  }
});

module.exports = router;