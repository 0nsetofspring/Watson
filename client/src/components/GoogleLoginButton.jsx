// src/components/GoogleLoginButton.jsx

import { GoogleLogin } from '@react-oauth/google'; // useGoogleLogin 대신 GoogleLogin을 import
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogleApi } from '../api/auth';

const GoogleLoginButton = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    // credentialResponse 객체 안에 ID 토큰이 들어있습니다.
    console.log('Google ID Token을 받았습니다:', credentialResponse);
    
    try {
      // credentialResponse.credential이 바로 백엔드가 필요한 ID 토큰입니다.
      const data = await loginWithGoogleApi(credentialResponse.credential);
      
      login(data.user, data.accessToken);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('로그인 처리 중 에러 발생:', error);
      alert(error.message);
    }
  };

  const handleError = () => {
    alert('구글 로그인에 실패했습니다.');
  };

  // 기존의 useGoogleLogin 훅과 <button> 대신, <GoogleLogin> 컴포넌트를 사용합니다.
  // 이 컴포넌트가 알아서 버튼 모양까지 만들어줍니다.
  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default GoogleLoginButton;