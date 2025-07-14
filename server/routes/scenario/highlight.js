const express = require('express');
const isLoggedIn = require('../isLoggedIn');
const prisma = require('../../lib/prisma');

const router = express.Router();

/**
 * @description PUT /api/chats/:chatId/highlight - 특정 채팅 하이라이트 설정/해제
 */

// 주소에 콜론(:)을 붙여 변수 자리를 만들면, Express가 그 자리에 들어온 값을 자동으로 req.params에 넣어줌
router.put('/:chatId/highlight', isLoggedIn, async (req, res) => {
  const { chatId } = req.params;
  const { isHighlighted } = req.body;
  const userId = req.user.id;

  if (typeof isHighlighted !== 'boolean') {
    return res.status(400).json({ error: 'isHighlighted (boolean) 필드가 필요합니다.' });
  }

  try {
    //  다른 사람의 대화 내용을 수정하면 안 되므로, 이 채팅이 "내 것"이 맞는지 확인합니다.
    //  ChatLog -> Playthrough -> User 순으로 주인을 확인
    const chatLog = await prisma.chatLog.findFirst({
      where: {
        id: Number(chatId),
        playthrough: {
          userId: userId, // 현재 로그인한 사용자의 게임에 속한 채팅인지 확인
        },
      },
    });

    if (!chatLog) {
      return res.status(404).json({ error: '메시지를 찾을 수 없거나 권한이 없습니다.' });
    }

    // DB의 값을 수정
    await prisma.chatLog.update({
      where: {
        id: Number(chatId),
      },
      data: {
        isHighlighted: isHighlighted,
      },
    });

    // 5. 성공 메시지를 응답합니다.
    const message = isHighlighted ? '하이라이트로 설정되었습니다.' : '하이라이트가 해제되었습니다.';
    res.status(200).json({ message });

  } catch (error) {
    console.error('하이라이트 처리 중 오류:', error);
    res.status(500).json({ error: '하이라이트 처리 중 서버 오류가 발생했습니다.' });
  }
});

module.exports = router;