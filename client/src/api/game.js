// src/api/game.js 
// 게임 관련 API 함수를 모아둘 파일

const API_BASE_URL = 'http://localhost:3000';

export const startGameApi = async (scenarioId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ scenarioId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '게임 시작에 실패했습니다.');
  }

  return response.json(); // { playthroughId } 객체 반환
};

/**
 * 채팅 메시지 전송 (Gemini LLM 응답 포함)
 * @param {number} playthroughId - 진행 중인 게임의 ID
 * @param {string} message - 사용자가 입력한 메시지
 * @param {string} token - 로그인 JWT 토큰
 * @param {number} npcId - 대화할 NPC의 ID (선택사항)
 * @returns {Promise<object>} - { messageText, ... } (서버 응답)
 */
export const sendChatMessage = async (playthroughId, message, token, npcId = null) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs/${playthroughId}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, npcId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '채팅 메시지 전송 실패');
  }
  return data; // { messageText, ... }
}

/**
 * 채팅 기록 조회
 * @param {number} playthroughId - 진행 중인 게임의 ID
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<Array>} - 채팅 기록 배열
 */
export const getChatHistory = async (playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs/${playthroughId}/chats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '채팅 기록 조회 실패');
  }
  return data;
};

/**
 * 하이라이트된 채팅 기록 조회
 * @param {number} playthroughId - 진행 중인 게임의 ID
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<Array>} - 하이라이트된 채팅 기록 배열
 */
export const getHighlightedChatHistory = async (playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs/${playthroughId}/chats/highlighted`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '하이라이트된 채팅 기록 조회 실패');
  }
  return data;
};

/**
 * 채팅 하이라이트 토글
 * @param {number} chatId - 채팅 ID
 * @param {boolean} isHighlighted - 하이라이트 상태
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<object>} - 응답 메시지
 */
export const toggleChatHighlight = async (chatId, isHighlighted, token) => {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/highlight`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ isHighlighted }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '하이라이트 토글 실패');
  }
  return data;
};

// 특정 playthroughId로 게임 정보 가져오기
export const getPlaythroughApi = async (playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs/${playthroughId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '게임 정보를 가져오는 데 실패했습니다.');
  }

  return response.json();
};