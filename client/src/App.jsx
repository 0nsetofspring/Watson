import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // 구글에서 받은 토큰을 서버로 전송
      const res = await axios.post('http://localhost:3000/api/auth/google', {
        googleToken: credentialResponse.credential,
      });
      setUser(res.data.user); // 로그인 성공 시 사용자 정보 저장
      localStorage.setItem('accessToken', res.data.accessToken); // 토큰 저장(필요시)
    } catch (err) {
      alert('로그인 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h1>구글 로그인 테스트</h1>
      {user ? (
        <div>
          <p>환영합니다, {user.nickname}!</p>
          <p>사용자 ID: {user.id}</p>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => alert('구글 로그인 실패')}
        />
      )}
    </div>
  );
}

export default App;
