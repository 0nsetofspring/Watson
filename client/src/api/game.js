// src/api/game.js 
// 게임 관련 API 함수를 모아둘 파일
import { mockRooms, mockInteractiveObjects, mockNpcs } from './mockData';

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
 * @returns {Promise<object>} - { messageText, ... } (서버 응답)
 */
export const sendChatMessage = async (playthroughId, message, token) => {
  const response = await fetch(`${API_BASE_URL}/api/playthroughs/${playthroughId}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
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

/**
 * 시나리오의 방 목록 가져오기
 * @param {number} scenarioId - 시나리오 ID
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<Array>} - 방 목록
 */
export const getRoomsApi = async (scenarioId, token) => {
  // TODO: 서버 API 구현 후 실제 API 호출로 변경
  // 현재는 mockData 사용
  return new Promise((resolve) => {
    setTimeout(() => {
      // 현재 mockData는 scenarioId 1에만 데이터가 있으므로, 
      // 다른 scenarioId가 와도 기본 방 데이터를 반환
      const rooms = mockRooms.filter(room => room.scenarioId === 1);
      resolve(rooms);
    }, 500);
  });
};

/**
 * 특정 방의 상호작용 객체 목록 가져오기
 * @param {number} roomId - 방 ID
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<Array>} - 상호작용 객체 목록
 */
export const getInteractiveObjectsApi = async (roomId, token) => {
  // TODO: 서버 API 구현 후 실제 API 호출로 변경
  // 현재는 mockData 사용
  return new Promise((resolve) => {
    setTimeout(() => {
      const objects = mockInteractiveObjects.filter(obj => obj.roomId === roomId && obj.isVisible);
      resolve(objects);
    }, 300);
  });
};

/**
 * 특정 방의 NPC 목록 가져오기
 * @param {number} roomId - 방 ID
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<Array>} - NPC 목록
 */
export const getNpcsApi = async (roomId, token) => {
  // TODO: 서버 API 구현 후 실제 API 호출로 변경
  // 현재는 mockData 사용
  return new Promise((resolve) => {
    setTimeout(() => {
      const npcs = mockNpcs.filter(npc => npc.roomId === roomId);
      resolve(npcs);
    }, 300);
  });
};