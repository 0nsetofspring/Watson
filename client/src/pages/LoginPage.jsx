import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogleApi } from '../api/auth';

// --- 이미지 에셋 불러오기 ---
import logoImage from '../assets/images/logo.png';
import backgroundImage from '../assets/images/background.png';

// --- 애니메이션 정의 ---

// 페이드 아웃 애니메이션
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// 페이드 인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// --- 스타일 컴포넌트 정의 ---
const FadeOutOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0; // 처음엔 투명
  pointer-events: none; // 클릭되지 않도록
  z-index: 9999;
  
  // isFadingOut prop이 true일 때만 fadeIn 애니메이션을 적용
  animation: ${props => props.isFadingOut ? fadeIn : 'none'} 1s forwards;
`;

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  // 배경 이미지 설정
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
`;

// 스플래시 화면 로고를 위한 컨테이너 (화면 전체를 덮음)
const SplashContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); // 약간 어두운 배경
  // isVisible 값에 따라 애니메이션 적용
  animation: ${props => props.isVisible ? 'none' : fadeOut} 1s forwards;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'}; // 사라진 후 클릭 방지
`;

const SplashLogo = styled.img`
  width: 300px; // 스플래시 로고 크기
`;

// 로그인 박스 (페이드 인 효과 추가)
const LoginBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 1);

  opacity: 0;
  
  // 2. isSplashVisible 값에 따라 애니메이션만 제어합니다.
  animation: ${props => props.isSplashVisible ? 'none' : fadeIn} 1s forwards;
  animation-delay: 0.5s; // 스플래시가 좀 사라진 후에 나타나도록
`;

// 로그인 화면의 작은 로고
const LoginLogo = styled.img`
  width: 200px;
  margin-bottom: 30px;
`;


// --- 컴포넌트 본문 ---

const LoginPage = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  // 스플래시 화면 표시 여부를 관리하는 상태
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false); 

  // 컴포넌트가 처음 로드될 때 스플래시 효과를 위한 타이머 설정
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000); // 2초 후에 스플래시 화면 사라짐

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearTimeout(splashTimer);
  }, []);

  // 로그인 상태이면 홈으로 이동
//   useEffect(() => {
//     if (token) {
//       navigate('/home');
//     }
//   }, [token, navigate]);

  // ... (handleSuccess, handleError 함수는 이전과 동일)
  const handleSuccess = async (credentialResponse) => {
    try {
      const data = await loginWithGoogleApi(credentialResponse.credential);
      login(data.user, data.accessToken);
      setIsFadingOut(true);

      // 2. 1초(애니메이션 시간) 후에 홈 페이지로 이동
      setTimeout(() => {
        navigate('/home');
      }, 2000); // 1000ms = 1초
    } catch (error) {
      console.error('로그인 처리 중 에러 발생:', error);
      alert(error.message);
    }
  };

  const handleError = () => {
    alert('구글 로그인에 실패했습니다.');
  };

  return (
    <LoginPageContainer>
      <FadeOutOverlay isFadingOut={isFadingOut} />
      <SplashContainer isVisible={isSplashVisible}>
        <SplashLogo src={logoImage} alt="Watson Splash Logo" />
      </SplashContainer>

      <LoginBox isSplashVisible={isSplashVisible}>
        <LoginLogo src={logoImage} alt="Watson Logo" />
            <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black" // 어두운 테마 적용
            shape="pill"         // 둥근 알약 모양
            width="300px"        // 너비 지정
            />
      </LoginBox>
    </LoginPageContainer>
  );
};

export default LoginPage;