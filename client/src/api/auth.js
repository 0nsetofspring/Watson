// src/api/auth.js
const API_BASE_URL = 'http://localhost:3000'; // 백엔드 서버 주소

export const loginWithGoogleApi = async (googleAccessToken) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleToken: googleAccessToken }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '로그인에 실패했습니다.');
  }

  return response.json(); // { accessToken, user } 객체 반환
};