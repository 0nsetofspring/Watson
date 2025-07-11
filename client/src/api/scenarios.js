// src/api/scenarios.js
const API_BASE_URL = 'http://localhost:3000';

// import { mockScenarios } from './mockData'; // 임시~!!!!!!!!!

// export const getScenariosApi = (token) => {
//   console.log("임시 Mock API 호출: getScenariosApi, 전달받은 토큰:", token);

//   return new Promise((resolve, reject) => {
//     // 2. 실제 네트워크 통신처럼 보이게 하려고 0.5초 딜레이를 줍니다.
//     setTimeout(() => {
//       // 3. 인증 토큰이 있는 것처럼 간단히 흉내 냅니다.
//       if (token) {
//         console.log("임시 API: 성공 응답을 보냅니다.");
//         // 4. 성공 시, 미리 만들어둔 가짜 데이터를 응답으로 보냅니다.
//         resolve(mockScenarios);
//       } else {
//         // 5. 실패 시, 에러를 보냅니다.
//         reject(new Error('인증 토큰이 없습니다. (Mock Error)'));
//       }
//     }, 500); // 500ms = 0.5초
//   });
// };

export const getScenariosApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/scenarios`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // 요청 헤더에 인증 토큰 추가
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '시나리오 목록을 불러오는 데 실패했습니다.');
  }

  return response.json();
};