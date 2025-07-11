// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'; // useState import
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from '@mantine/core'; // Modal import
import styled, { keyframes } from 'styled-components';
import ScenarioList from '../components/ScenarioList'; // ScenarioList import

// --- 에셋 불러오기 ---
import streetBackground from '../assets/images/street_background.png';
import newspaperImage from '../assets/images/hand_with_newspaper.png';
import logoImage from '../assets/images/logo.png';
// --- 애니메이션 정의 ---

// 신문이 날아오며 회전하는 애니메이션
const slideAndRotate = keyframes`
  from {
    /* translate(-100vw, 50vh): 화면 왼쪽 밖(X축 -100%), 그리고 아래쪽(Y축 +50%)에서 시작
      rotate(45deg): 45도 기울어져서 시작
    */
    transform: translate(-100vw, 50vh) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
`;

// 페이드 아웃 애니메이션
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// ... (fadeIn 애니메이션은 동일)
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;


// --- 스타일 컴포넌트 정의 (수정됨) ---
const FadeFromBlackOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 999; // 다른 모든 요소들보다 위에 있도록 설정
  pointer-events: none; // 클릭 방지

  // isReady가 true가 되면 fadeOut 애니메이션 실행
  animation: ${props => props.$isReady ? fadeOut : 'none'} 1.2s forwards;
`;

const HomePageContainer = styled.div`
  /* ... (이전과 동일) ... */
  width: 100vw;
  height: 100vh;
  background-image: url(${streetBackground});
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
`;

// 신문 래퍼 (크기 및 애니메이션 수정)
const NewspaperWrapper = styled.div`
  position: relative;
  /* top 속성을 10vh -> 25vh로 수정하여 위치를 아래로 내림 */
  top: 0vh; 
  left: 0;
  right: 0;
  margin: auto;
  width: 80vw; 
  max-width: 1000px;
  animation: ${slideAndRotate} 1.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
`;


// 사진 왼쪽으로 옮겨야 함.
const NewspaperImage = styled.img`
  width: 140%;
  position: relative;
  left: -25%;
`;

// 콘텐츠 영역 (크기 및 위치 재조정)
const NewspaperContent = styled.div`
  position: absolute;
  top: 15%;
  left: 50%; // 왼쪽에서 50% 지점
  transform: translateX(-50%); // X축으로 자신의 절반만큼 왼쪽으로 이동해 정중앙 맞춤
  width: 50%; // 래퍼 크기에 비례하여 조정
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-around; // 콘텐츠들을 세로로 고르게 분배
  padding: 20px;

  opacity: 0;
  animation: ${props => props.$show ? fadeIn : 'none'} 0.8s forwards;
  animation-delay: 0.3s;
`;

// 신문 상단 로고와 헤드라인
const NewspaperHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid #ddd;
  margin-bottom: 10px;
`;

const NewspaperLogo = styled.img`
  height: 150px; // 로고 크기 조정
`;

// 기사 한 줄을 의미하는 컴포넌트
const ArticleRow = styled.div`
  display: flex;
  // reverse prop에 따라 자식 요소 순서를 바꿈 (오른쪽, 왼쪽 번갈아 배치)
  flex-direction: ${props => props.$reverse ? 'row-reverse' : 'row'};
  align-items: center;
  gap: 15px; // 이미지와 텍스트 사이 간격
  margin-bottom: -20px;
`;

// 기사 사진(버튼)이 들어갈 자리
const ArticleImagePlaceholder = styled.div`
  flex-shrink: 0; // 줄어들지 않음
  width: 120px;
  height: 120px;
  background-color: transparent;
  // 버튼을 담기 위해 flexbox 사용
  display: flex;s
  justify-content: center;
  align-items: center;
`;

// 기사 텍스트 영역
const ArticleText = styled.div`
  text-align: left;
  /* indent prop이 true일 경우 왼쪽에 2rem의 여백을 추가합니다. */
  padding-left: ${(props) => (props.$indent ? '2rem' : '0')};
  h4 {
    margin: 0 0 5px 0;
  }
  p {
    margin: 0;
    font-size: 12px;
  }
`;

// 버튼들을 감싸고 페이드 인 효과를 줌
const NavButtonContainer = styled.div`
  margin-top: 20px;
  opacity: 0; // 처음엔 투명
  animation: ${props => props.$show ? fadeIn : 'none'} 0.8s forwards;
  animation-delay: 0.2s; // 신문 애니메이션이 끝난 후에 시작
`;

const StyledButton = styled.button`
  background-color: #7d6e60;
  color: #edebe8;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  height: 40px
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5a4d41;
  }
`;

// --- 컴포넌트 본문 ---

const HomePage = () => {
  const { user, logout } = useAuth();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100); // 0.1초

    return () => clearTimeout(readyTimer);
  }, []);

  return (
    <HomePageContainer>
      <FadeFromBlackOverlay $isReady={isReady} />
      <NewspaperWrapper>
        <NewspaperImage src={newspaperImage} alt="Newspaper" />
        <NewspaperContent $show={animationFinished}>
          <NewspaperHeader>
            <NewspaperLogo src={logoImage} alt="Watson Logo" />
          </NewspaperHeader>

          {/* 1번 기사: 이미지 오른쪽 */}
          <ArticleRow>
            <ArticleText $indent>
              <h4>새로운 사건 의뢰</h4>
              <p>탐정, 새로운 사건이 기다리고 있네. 자네의 명석한 두뇌가 필요하네.</p>
            </ArticleText>
            <ArticleImagePlaceholder>
              <Link to="/game/start"><StyledButton>사건 시작</StyledButton></Link>
            </ArticleImagePlaceholder>
          </ArticleRow>

          {/* 2번 기사: 이미지 왼쪽 */}
          <ArticleRow $reverse>
            <ArticleText>
              <h4>미해결 사건 파일</h4>
              <p>자네가 해결하던 사건의 서류가 여기에 있네.다시 한번 살펴보겠나?</p>
            </ArticleText>
            <ArticleImagePlaceholder>
              <Link to="/game/continue"><StyledButton>이어하기</StyledButton></Link>
            </ArticleImagePlaceholder>
          </ArticleRow>

          {/* 3번 기사: 이미지 오른쪽 */}
          <ArticleRow>
            <ArticleText>
              <h4>탐정 정보 교류</h4>
              <p>다른 탐정들의 활약상을 보거나, 자네의 추리를 공유할 수 있는 곳이지.</p>
            </ArticleText>
            <ArticleImagePlaceholder>
              <Link to="/community"><StyledButton>커뮤니티</StyledButton></Link>
            </ArticleImagePlaceholder>
          </ArticleRow>

          {/* 4번 기사: 이미지 왼쪽 */}
          <ArticleRow $reverse>
            <ArticleText>
              <h4>사무소 퇴근</h4>
              <p>오늘 업무는 여기까지인가? 언제든 다시 돌아오게.</p>
            </ArticleText>
            <ArticleImagePlaceholder>
              <StyledButton onClick={logout}>로그아웃</StyledButton>
            </ArticleImagePlaceholder>
          </ArticleRow>
        </NewspaperContent>
      </NewspaperWrapper>
    </HomePageContainer>
  );
};

export default HomePage;