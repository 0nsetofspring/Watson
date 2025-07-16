import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi } from '../api/game';
import styled, { keyframes, css } from 'styled-components';
import ChatBox from '../components/ChatBox'; // ChatBox import

// 배경 이미지 import
import gameBackground from '../assets/images/game_background.png';
import paperPlate from '../assets/images/paper_plate.png';
// 룰북 이미지 import (임시로 기존 이미지 사용, 나중에 실제 룰북 이미지로 교체)
import ruleBookImage from '../assets/images/rulebook.png';

// 타이틀 페이드인 애니메이션
const titleFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 타이틀 페이드아웃 애니메이션
const titleFadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

// 배경 이미지 초기 페이드인 애니메이션 (낮은 불투명도)
const backgroundFadeInLow = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 0.3;
  }
`;

// 배경 이미지 불투명도 정상화 애니메이션
const backgroundFadeToNormal = keyframes`
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
`;

// paper_plate 등장 애니메이션 (하단에서 중앙으로)
const paperPlateSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateX(-25%) translateY(100vh);
  }
  to {
    opacity: 1;
    transform: translateX(-25%) translateY(0);
  }
`;

// paper_plate 사라지는 애니메이션 (중앙에서 하단으로)
const paperPlateSlideDown = keyframes`
  from {
    opacity: 1;
    transform: translateX(-25%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-25%) translateY(100vh);
  }
`;

// 배경 확장 및 페이드아웃 애니메이션 (통합)
const backgroundExpansionFadeOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
`;

// 룰북 페이드인 애니메이션
const ruleBookFadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 룰북 페이드아웃 애니메이션
const ruleBookFadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.1);
  }
`;

// 프롤로그 페이지 컨테이너 - 검은 배경
const ProloguePageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

// 배경 이미지 스타일
const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${gameBackground});
  background-size: cover;
  background-position: center;
  opacity: 0;
  z-index: 1;
  transform-origin: 85% 50%; /* 오른쪽 중앙에서 확장 */
  
  ${props => props.$stage === 'initial' && css`
    animation: ${backgroundFadeInLow} 2s ease-out forwards;
    animation-delay: 0.5s;
  `}
  
  ${props => props.$stage === 'normal' && css`
    animation: ${backgroundFadeToNormal} 1.5s ease-out forwards;
  `}
  
  ${props => props.$stage === 'expansion' && css`
    animation: ${backgroundExpansionFadeOut} 3s ease forwards;
  `}
`;

// 시나리오 제목 스타일
const ScenarioTitle = styled.h1`
  color: white;
  font-size: 3rem;
  text-align: center;
  margin: 0;
  padding: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  opacity: 0;
  position: relative;
  z-index: 2;
  
  ${props => props.$stage === 'fadeIn' && css`
    animation: ${titleFadeIn} 2s ease-out forwards;
    animation-delay: 0.5s;
  `}
  
  ${props => props.$stage === 'fadeOut' && css`
    animation: ${titleFadeOut} 1s ease-out forwards;
  `}
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

// Paper Plate 컨테이너 스타일
const PaperPlateContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 38%;
  transform: translateX(-38%);
  width: 80vw;
  max-width: 800px;
  height: 100vh;
  background-image: url(${paperPlate});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 5%; /* 상단 여백 추가 */
  
  ${props => props.$stage === 'slideUp' && css`
    animation: ${paperPlateSlideUp} 1.5s ease-out forwards;
  `}
  
  ${props => props.$stage === 'slideDown' && css`
    animation: ${paperPlateSlideDown} 1s ease-out forwards;
  `}
  
  @media (max-width: 768px) {
    width: 90vw;
    height: 80vh;
    padding-top: 12%;
  }
  
  @media (max-width: 480px) {
    padding-top: 10%;
  }
`;

// 룰북 컨테이너 스타일
const RuleBookContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  opacity: 0;
  cursor: pointer;
  
  ${props => props.$stage === 'fadeIn' && css`
    animation: ${ruleBookFadeIn} 1s ease-out forwards;
  `}
  
  ${props => props.$stage === 'fadeOut' && css`
    animation: ${ruleBookFadeOut} 0.8s ease-out forwards;
  `}
`;

// 룰북 이미지 스타일
const RuleBookImage = styled.img`
  max-height: 90vh;
  max-width: 90vw;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  // border: 3px solid #8b6f47;
  
  @media (max-width: 768px) {
    max-height: 85vh;
    max-width: 95vw;
  }
`;

// 룰북 안내 텍스트 스타일
const RuleBookText = styled.div`
  color: #d4af37;
  font-size: 1.2rem;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-top: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: 10px;
  }
`;

// 프롤로그 텍스트 컨테이너 스타일
const PrologueTextContainer = styled.div`
  width: 70%;
  max-width: 600px;
  flex: 1;
  padding: 20px;
  color: #2c2c2c;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  overflow-y: auto;
  opacity: 1;
  margin-bottom: 20px; /* 버튼과의 간격 */
  
  @media (max-width: 768px) {
    width: 80%;
    font-size: 1rem;
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    width: 85%;
    font-size: 0.9rem;
    padding: 10px;
  }

    /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #8b4513, #654321);
    border-radius: 4px;
    border: 1px solid #daa520;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #654321, #8b4513);
  }
`;

// 프롤로그 제목 스타일
const PrologueTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #1a1a1a;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

// 구분선 스타일
const Divider = styled.hr`
  border: none;
  height: 2px;
  background-color: #4a4a4a;
  margin: 20px 0;
  border-radius: 1px;
  width: 100%;
`;

// 프롤로그 내용 스타일
const PrologueContent = styled.div`
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// 완료 버튼 스타일 (PaperPlateContainer 내부의 bottom-center)
const FinishButton = styled.button`
  background-color: ${({ disabled }) => (disabled ? '#bdbdbd' : '#8b6f47')};
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-radius: 5px;
  transition: background-color 0.3s;
  margin-bottom: 5%;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  
  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#bdbdbd' : '#6d5535')};
  }
  
  &:active {
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(0.95)')};
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    margin-bottom: 3%;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
`;

// 로딩 상태 스타일
const LoadingText = styled.div`
  color: white;
  font-size: 1.2rem;
  text-align: center;
  opacity: 0.7;
  position: relative;
  z-index: 2;
`;

// 에러 상태 스타일
const ErrorText = styled.div`
  color: #ff6b6b;
  font-size: 1.2rem;
  text-align: center;
  padding: 20px;
  position: relative;
  z-index: 2;
`;

// 프롤로그 스크립트 파서 함수
const parsePrologueScript = (script) => {
  if (!script) return { title: '', content: [] };
  
  // 백슬래시 n을 실제 줄바꿈으로 치환
  const processedScript = script
    .replace(/\\n/g, '\n')     // \n을 실제 줄바꿈으로 치환
    .replace(/\|\|/g, '\n')    // ||를 줄바꿈으로 치환 (대안)
    .replace(/<br>/g, '\n')    // <br>을 줄바꿈으로 치환 (대안)
    .replace(/<BR>/g, '\n');   // <BR>을 줄바꿈으로 치환 (대안)
  
  const lines = processedScript.split('\n');
  
  // 첫 번째 줄을 제목으로 처리
  const title = lines[0] || '';
  
  // 나머지 줄들을 처리하여 구분선과 내용을 분리
  const contentLines = lines.slice(1);
  const processedContent = [];
  
  let currentTextBlock = '';
  
  contentLines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // 구분선 체크 (--- 또는 ===로 시작하는 줄)
    if (trimmedLine.startsWith('---') || trimmedLine.startsWith('===')) {
      // 현재 텍스트 블록이 있으면 추가
      if (currentTextBlock.trim()) {
        processedContent.push({
          type: 'text',
          content: currentTextBlock.trim()
        });
        currentTextBlock = '';
      }
      
      // 구분선 추가
      processedContent.push({
        type: 'divider'
      });
    } else {
      // 일반 텍스트 라인
      if (currentTextBlock) {
        currentTextBlock += '\n' + line;
      } else {
        currentTextBlock = line;
      }
    }
  });
  
  // 마지막 텍스트 블록 처리
  if (currentTextBlock.trim()) {
    processedContent.push({
      type: 'text',
      content: currentTextBlock.trim()
    });
  }
  
  return {
    title: title.trim(),
    content: processedContent
  };
};

const ProloguePage = () => {
  const { playthroughId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationStage, setAnimationStage] = useState('initial'); // 'initial', 'ruleBook', 'ruleBookFadeOut', 'titleVisible', 'titleFadeOut', 'prologueStart', 'prologueVisible', 'prologueEnd', 'expansion', 'gameReady'
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const prologueTextRef = useRef(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const data = await getPlaythroughApi(playthroughId, token);
        setGameData(data);
      } catch (err) {
        setError(err.message);
        console.error('게임 정보를 가져오는 중 에러:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (playthroughId && token) {
      fetchGameData();
    }
  }, [playthroughId, token]);

  useEffect(() => {
    if (!isLoading && gameData && !error) {
      // 1초 후 룰북 표시
      const ruleBookTimer = setTimeout(() => {
        setAnimationStage('ruleBook');
      }, 1000);

      return () => {
        clearTimeout(ruleBookTimer);
      };
    }
  }, [isLoading, gameData, error]);

  // 룰북 클릭 시 다음 단계로 진행
  const handleRuleBookClick = () => {
    setAnimationStage('ruleBookFadeOut');
    
    // 0.8초 후 시나리오 제목 표시
    setTimeout(() => {
      setAnimationStage('titleVisible');
    }, 800);

    // 4.8초 후 제목 페이드아웃 (0.8 + 4초)
    setTimeout(() => {
      setAnimationStage('titleFadeOut');
    }, 4800);

    // 5.8초 후 프롤로그 시작 (0.8 + 5초)
    setTimeout(() => {
      setAnimationStage('prologueStart');
    }, 5800);

    // 7.3초 후 프롤로그 완전 표시 (0.8 + 6.5초)
    setTimeout(() => {
      setAnimationStage('prologueVisible');
    }, 7300);
  };

  const handleFinishPrologue = () => {
    setAnimationStage('prologueEnd');
    
    // 1초 후 배경 확장 및 페이드아웃 시작
    setTimeout(() => {
      setAnimationStage('expansion');
    }, 1000);
    
    // 4초 후 게임 준비 완료
    setTimeout(() => {
      setAnimationStage('gameReady');
    }, 4000);
  };

  // 게임 준비 완료 시 GamePage로 리디렉션
  useEffect(() => {
    if (animationStage === 'gameReady') {
      // 잠시 후 GamePage로 이동
      const redirectTimer = setTimeout(() => {
        navigate(`/game/${playthroughId}/play`);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [animationStage, navigate, playthroughId]);

  const handleScroll = () => {
    const el = prologueTextRef.current;
    if (!el) return;
    // 스크롤이 맨 아래에 도달했는지 확인
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      setIsScrolledToBottom(true);
    }
  };

  if (isLoading) {
    return (
      <ProloguePageContainer>
        <LoadingText>게임 로딩 중...</LoadingText>
      </ProloguePageContainer>
    );
  }

  if (error) {
    return (
      <ProloguePageContainer>
        <ErrorText>에러: {error}</ErrorText>
      </ProloguePageContainer>
    );
  }

  const parsedPrologue = gameData ? parsePrologueScript(gameData.backgroundScript) : { title: '', content: [] };

  return (
    <ProloguePageContainer>
      <BackgroundImage 
        $stage={
          animationStage === 'titleVisible' ? 'initial' : 
          animationStage === 'expansion' ? 'expansion' : 'normal'
        }
      />
      
      {/* 룰북 표시 */}
      {(animationStage === 'ruleBook' || animationStage === 'ruleBookFadeOut') && (
        <RuleBookContainer 
          $stage={animationStage === 'ruleBookFadeOut' ? 'fadeOut' : 'fadeIn'}
          onClick={handleRuleBookClick}
        >
          <RuleBookImage src={ruleBookImage} alt="게임 룰북" />
          <RuleBookText>클릭하여 계속하기</RuleBookText>
        </RuleBookContainer>
      )}
      
      {gameData && (
        <>
          <ScenarioTitle
            $stage={
              animationStage === 'titleVisible' ? 'fadeIn' : 
              animationStage === 'titleFadeOut' ? 'fadeOut' : 'hidden'
            }
          >
            {gameData.scenarioTitle}
          </ScenarioTitle>
          
          {(animationStage === 'prologueStart' || animationStage === 'prologueVisible' || animationStage === 'prologueEnd') && (
            <PaperPlateContainer
              $stage={animationStage === 'prologueEnd' ? 'slideDown' : 'slideUp'}
            >
              <PrologueTextContainer
                ref={prologueTextRef}
                onScroll={handleScroll}
              >
                {parsedPrologue.title && (
                  <PrologueTitle>{parsedPrologue.title}</PrologueTitle>
                )}
                {parsedPrologue.content.length > 0 ? (
                  parsedPrologue.content.map((item, index) => (
                    item.type === 'divider' ? (
                      <Divider key={index} />
                    ) : (
                      <PrologueContent key={index}>
                        {item.content}
                      </PrologueContent>
                    )
                  ))
                ) : (
                  <PrologueContent>
                    이 시나리오의 프롤로그를 준비 중입니다...
                  </PrologueContent>
                )}
              </PrologueTextContainer>
              
              {(animationStage === 'prologueVisible') && (
                <FinishButton
                  onClick={handleFinishPrologue}
                  disabled={!isScrolledToBottom}
                >
                  읽기 완료
                </FinishButton>
              )}
              {(animationStage === 'prologueVisible') && !isScrolledToBottom && (
                <div style={{ color: '#bdbdbd', fontSize: '0.95rem', marginTop: '8px' }}>
                  아래까지 모두 읽어야 버튼이 활성화됩니다.
                </div>
              )}
            </PaperPlateContainer>
          )}
        </>
      )}
      {/* 애니메이션이 끝나고 게임 준비가 완료되면 GamePage로 리디렉션 */}
      {animationStage === 'gameReady' && (
        <LoadingText>게임으로 이동 중...</LoadingText>
      )}
    </ProloguePageContainer>
  );
};

export default ProloguePage; 