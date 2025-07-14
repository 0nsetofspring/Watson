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

/**
 * 상호작용 객체와 상호작용 (채팅 메시지 전송)
 * @param {number} playthroughId - 진행 중인 게임의 ID
 * @param {number} objectId - 상호작용할 객체의 ID
 * @param {string} message - 사용자가 입력한 메시지
 * @param {string} token - 로그인 JWT 토큰
 * @returns {Promise<object>} - 서버 응답
 */
export const interactWithObjectApi = async (playthroughId, objectId, message, token) => {
  // TODO: 서버 API 구현 후 실제 API 호출로 변경
  // 현재는 mockData 사용
  return new Promise((resolve) => {
    setTimeout(() => {
      const object = mockInteractiveObjects.find(obj => obj.id === objectId);
      if (object) {
        const data = JSON.parse(object.data || '{}');
        let responseMessage = '';
        
        switch (object.type) {
          case 'book':
            responseMessage = `${object.name}을 읽어보니: ${data.content}`;
            break;
          case 'notepad':
            responseMessage = `${object.name}을 살펴보니: ${data.content}`;
            break;
          case 'clue':
            responseMessage = `${object.name}을 조사한 결과: ${data.clue}`;
            break;
          case 'evidence':
            responseMessage = `${object.name}을 조사한 결과: ${data.clue}`;
            break;
          case 'item':
            responseMessage = `${object.name}을 획득했습니다. ${data.description}`;
            break;
          case 'door':
            responseMessage = `${object.name}을 열었습니다.`;
            break;
          default:
            responseMessage = `${object.name}과 상호작용했습니다.`;
        }
        
        resolve({
          id: Date.now(),
          messageText: responseMessage,
          isUserMessage: false,
          interactiveObjectId: objectId,
        });
      } else {
        resolve({
          id: Date.now(),
          messageText: '해당 객체를 찾을 수 없습니다.',
          isUserMessage: false,
        });
      }
    }, 1000);
  });
};