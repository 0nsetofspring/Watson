// src/pages/LoginPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 상태라면 메인 페이지로 리디렉션
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div>
      <h1>로그인</h1>
      <p>Watson의 세계에 오신 것을 환영합니다.</p>
      <GoogleLoginButton />
    </div>
  );
};

export default LoginPage;