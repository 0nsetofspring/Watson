import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi } from '../api/game';
import styled, { keyframes, css } from 'styled-components';

// 배경 이미지 import
import gameBackground from '../assets/images/game_background.png';

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

// 게임 페이지 컨테이너 - 검은 배경
const GamePageContainer = styled.div`
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
  
  ${props => props.$stage === 'initial' && css`
    animation: ${backgroundFadeInLow} 2s ease-out forwards;
    animation-delay: 0.5s;
  `}
  
  ${props => props.$stage === 'normal' && css`
    animation: ${backgroundFadeToNormal} 1.5s ease-out forwards;
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

const GamePage = () => {
  const { playthroughId } = useParams();
  const { token } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationStage, setAnimationStage] = useState('initial'); // 'initial', 'titleVisible', 'titleFadeOut', 'gameReady'

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
      // 게임 데이터가 로드되면 애니메이션 시작
      setAnimationStage('titleVisible');
      
      // 3초 후 타이틀 페이드아웃 시작
      const titleTimer = setTimeout(() => {
        setAnimationStage('titleFadeOut');
      }, 3000);

      // 4초 후 게임 준비 완료 (배경 이미지 불투명도 정상화)
      const gameReadyTimer = setTimeout(() => {
        setAnimationStage('gameReady');
      }, 4000);

      return () => {
        clearTimeout(titleTimer);
        clearTimeout(gameReadyTimer);
      };
    }
  }, [isLoading, gameData, error]);

  if (isLoading) {
    return (
      <GamePageContainer>
        <LoadingText>게임 로딩 중...</LoadingText>
      </GamePageContainer>
    );
  }

  if (error) {
    return (
      <GamePageContainer>
        <ErrorText>에러: {error}</ErrorText>
      </GamePageContainer>
    );
  }

  return (
    <GamePageContainer>
      <BackgroundImage 
        $stage={animationStage === 'titleVisible' ? 'initial' : 'normal'}
      />
      {gameData && (
        <ScenarioTitle
          $stage={
            animationStage === 'titleVisible' ? 'fadeIn' : 
            animationStage === 'titleFadeOut' ? 'fadeOut' : 'hidden'
          }
        >
          {gameData.scenarioTitle}
        </ScenarioTitle>
      )}
    </GamePageContainer>
  );
};

export default GamePage;
