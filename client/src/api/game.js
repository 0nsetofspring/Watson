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