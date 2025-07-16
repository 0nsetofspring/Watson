// src/api/investigation.js
const API_BASE_URL = 'http://localhost:3000';

/**
 * 조사 시작 API
 * @param {number} objectId - 조사할 객체 ID
 * @param {number} playthroughId - 플레이스루 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise} API 응답
 */
export const startInvestigationApi = async (objectId, playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenario/investigation/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      objectId: objectId,
      playthroughId: playthroughId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '조사 시작에 실패했습니다.');
  }

  return response.json();
};

/**
 * 조사 완료 API
 * @param {number} objectId - 조사 완료할 객체 ID
 * @param {number} playthroughId - 플레이스루 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise} API 응답
 */
export const completeInvestigationApi = async (objectId, playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenario/investigation/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      objectId: objectId,
      playthroughId: playthroughId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '조사 완료에 실패했습니다.');
  }

  return response.json();
};

/**
 * 조사 상태 확인 API
 * @param {number} playthroughId - 플레이스루 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise} API 응답
 */
export const getInvestigationStatusApi = async (playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenario/investigation/status/${playthroughId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '조사 상태 확인에 실패했습니다.');
  }

  return response.json();
};

/**
 * 조사 중인 객체에 질문하여 remainingQuestions 감소 API
 * @param {number} objectId - 질문할 객체 ID
 * @param {number} playthroughId - 플레이스루 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise} API 응답
 */
export const submitQuestionApi = async (objectId, playthroughId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenario/investigation/question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      objectId: objectId,
      playthroughId: playthroughId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '질문 처리에 실패했습니다.');
  }

  return response.json();
};

/**
 * 현재 방의 최신 객체 정보 가져오기 API
 * @param {number} playthroughId - 플레이스루 ID
 * @param {number} roomId - 방 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise} API 응답
 */
export const getRoomObjectsApi = async (playthroughId, roomId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenario/investigation/room-objects/${playthroughId}/${roomId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '방 객체 정보 조회에 실패했습니다.');
  }

  return response.json();
}; 