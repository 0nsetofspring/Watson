// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'; // useState import
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from '@mantine/core'; // Modal import
import styled, { keyframes, css } from 'styled-components';
import ScenarioList from '../components/ScenarioList';

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

// 신문 콘텐츠 페이드 아웃 (게임 시작 시)
const contentFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// 신문이 아래로 떨어지는 애니메이션 (점진적 가속 - 물리법칙 기반)
const newspaperDrop = keyframes`
  0% {
    transform: translate(0, 0vh) rotate(0deg);
    opacity: 1;
  }
  5% {
    transform: translate(0, 1vh) rotate(2deg);
    opacity: 0.98;
  }
  10% {
    transform: translate(0, 4vh) rotate(5deg);
    opacity: 0.95;
  }
  15% {
    transform: translate(0, 9vh) rotate(8deg);
    opacity: 0.95;
  }
  20% {
    transform: translate(0, 16vh) rotate(12deg);
    opacity: 0.95;
  }
  25% {
    transform: translate(0, 25vh) rotate(17deg);
    opacity: 0.95;
  }
  30% {
    transform: translate(0, 36vh) rotate(23deg);
    opacity: 0.95;
  }
  40% {
    transform: translate(0, 64vh) rotate(35deg);
    opacity: 0.95;
  }
  50% {
    transform: translate(0, 100vh) rotate(48deg);
    opacity: 0.9;
  }
  60% {
    transform: translate(0, 144vh) rotate(62deg);
    opacity: 0.8;
  }
  70% {
    transform: translate(0, 196vh) rotate(75deg);
    opacity: 0.7;
  }
  80% {
    transform: translate(0, 256vh) rotate(87deg);
    opacity: 0.6;
  }
  90% {
    transform: translate(0, 324vh) rotate(95deg);
    opacity: 0.5;
  }
  100% {
    transform: translate(0, 400vh) rotate(108deg);
    opacity: 0.4;
  }
`;

// 전구 깜빡이는 효과 (점점 빨라지면서 깜빡임)
const flickerEffect = keyframes`
  0% { opacity: 0; }
  10% { opacity: 0.8; }
  20% { opacity: 0.2; }
  30% { opacity: 0.9; }
  40% { opacity: 0.5; }
  70% { opacity: 0.3; }
  75% { opacity: 1; }
  80% { opacity: 0.6; }
  85% { opacity: 1; }
  100% { opacity: 1; }
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
  opacity: 1; // 기본적으로 불투명

  // isReady가 true가 되면 fadeOut 애니메이션 실행
  ${props => props.$isReady && css`
    animation: ${fadeOut} 1.2s forwards;
  `}
`;

// 게임 시작 시 깜빡이는 오버레이
const FlickerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 1000;
  pointer-events: none;
  opacity: 0; // 기본적으로 투명 (보이지 않음)
  
  // 깜빡이는 애니메이션 실행
  ${props => props.$isFlickering && css`
    animation: ${flickerEffect} 2s forwards;
  `}
`;

const HomePageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${streetBackground});
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
`;

const MainContentWrapper = styled.div`
  position: relative; // 자식 요소의 position: absolute 기준점이 됨
  flex: 1; // Header를 제외한 나머지 공간을 모두 차지
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
  
  ${css`
    animation: ${slideAndRotate} 1.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
  `}
`;

// 사진 왼쪽으로 옮겨야 함.
const NewspaperImage = styled.img`
  width: 140%;
  position: relative;
  left: -25%;
  
  // 게임 시작 시 신문이 떨어지는 애니메이션
  ${props => props.$isDropping ? css`
    animation: ${newspaperDrop} 1.8s forwards cubic-bezier(0.1, 0.1, 0.9, 1);
  ` : ''}
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
  
  ${props => props.$isFadingOut && css`
    animation: ${contentFadeOut} 0.5s forwards;
  `}
  
  ${props => props.$show && css`
    animation: ${fadeIn} 1s forwards 1.5s;
  `}
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

const ArticleListContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  // isVisible prop에 따라 애니메이션 적용
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: opacity 0.5s ease-in-out;
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
  display: flex;
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
    font-size: 18px;
  }
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const ScenarioListWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  // props에 따라 투명도와 인터랙션을 제어합니다.
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: opacity 0.5s ease-in-out;
`;

// 버튼들을 감싸고 페이드 인 효과를 줌
const NavButtonContainer = styled.div`
  margin-top: 20px;
  opacity: 0; // 처음엔 투명
  
  ${props => props.$show && css`
    animation: ${fadeIn} 0.8s forwards;
    animation-delay: 0.2s; // 신문 애니메이션이 끝난 후에 시작
  `}
`;

const StyledButton = styled.button`
  background-color: #584d43ff;
  color: #edebe8;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  height: 40px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #41382fff;
  }
`;

// --- 컴포넌트 본문 ---

const HomePage = () => {
  const { user, logout } = useAuth();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSelectingScenario, setIsSelectingScenario] = useState(false);
  
  // 게임 시작 애니메이션 상태들
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isContentFadingOut, setIsContentFadingOut] = useState(false);
  const [isNewspaperDropping, setIsNewspaperDropping] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [pendingPlaythroughId, setPendingPlaythroughId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100); // 0.1초

    return () => clearTimeout(readyTimer);
  }, []);

  const handleStartNewGameClick = () => {
    setIsSelectingScenario(true);
  };

  const handleScenarioSelect = (playthroughId) => {
    setPendingPlaythroughId(playthroughId);
    setIsStartingGame(true);
    
    // 1단계: 콘텐츠 페이드 아웃
    setIsContentFadingOut(true);
    
    // 2단계: 신문 떨어뜨리기 (0.5초 후)
    setTimeout(() => {
      setIsNewspaperDropping(true);
    }, 400);
    
    // 3단계: 깜빡이는 효과 (2.3초 후)
    setTimeout(() => {
      setIsFlickering(true);
    }, 1600);
    
    // 4단계: 게임 페이지로 이동 (4.3초 후)
    setTimeout(() => {
      navigate(`/game/${playthroughId}`);
    }, 3600);
  };

  return (
    <HomePageContainer>
      <FadeFromBlackOverlay $isReady={isReady} />
      <FlickerOverlay $isFlickering={isFlickering} />
      <NewspaperWrapper>
        <NewspaperImage 
          src={newspaperImage} 
          alt="Newspaper" 
          $isDropping={isNewspaperDropping}
        />
        <NewspaperContent 
          $show={animationFinished && !isStartingGame}
          $isFadingOut={isContentFadingOut}
        >
          <NewspaperHeader>
            <NewspaperLogo src={logoImage} alt="Watson Logo" />
          </NewspaperHeader>
          <MainContentWrapper>
            <ArticleListContainer $show={!isSelectingScenario}>
              <ArticleRow>
                <ArticleText $indent>
                  <h4>새로운 사건 의뢰</h4>
                  <p>탐정, 새로운 사건이 기다리고 있네. 자네의 명석한 두뇌가 필요하네.</p>
                </ArticleText>
                <ArticleImagePlaceholder>
                  <StyledButton onClick={handleStartNewGameClick}>사건 시작</StyledButton>
                </ArticleImagePlaceholder>
              </ArticleRow>
              <ArticleRow $reverse>
                <ArticleText>
                  <h4>미해결 사건 파일</h4>
                  <p>자네가 해결하던 사건의 서류가 여기에 있네.다시 한번 살펴보겠나?</p>
                </ArticleText>
                <ArticleImagePlaceholder>
                  <Link to="/game/continue"><StyledButton>이어하기</StyledButton></Link>
                </ArticleImagePlaceholder>
              </ArticleRow>
              <ArticleRow>
                <ArticleText>
                  <h4>탐정 정보 교류</h4>
                  <p>다른 탐정들의 활약상을 보거나, 자네의 추리를 공유할 수 있는 곳이지.</p>
                </ArticleText>
                <ArticleImagePlaceholder>
                  <Link to="/community"><StyledButton>커뮤니티</StyledButton></Link>
                </ArticleImagePlaceholder>
              </ArticleRow>
              <ArticleRow $reverse>
                <ArticleText>
                  <h4>사무소 퇴근</h4>
                  <p>오늘 업무는 여기까지인가? 언제든 다시 돌아오게.</p>
                </ArticleText>
                <ArticleImagePlaceholder>
                  <StyledButton onClick={logout}>로그아웃</StyledButton>
                </ArticleImagePlaceholder>
              </ArticleRow>
            </ArticleListContainer>
            <ScenarioListWrapper $show={isSelectingScenario}>
              <ScenarioList
                onBack={() => setIsSelectingScenario(false)}
                onScenarioSelect={handleScenarioSelect}
              />
            </ScenarioListWrapper>
          </MainContentWrapper>
        </NewspaperContent>
      </NewspaperWrapper>
    </HomePageContainer>
  );
};

export default HomePage;