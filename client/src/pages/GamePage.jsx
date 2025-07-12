import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi } from '../api/game';
import styled from 'styled-components';
import ChatBox from '../components/ChatBox';

// 게임 배경 이미지 import
import gameBackground from '../assets/images/game_background.png';
import streetBackground from '../assets/images/street_background.png';

// 게임 페이지 컨테이너 (전체 화면)
const GamePageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// 상단 네비게이션 바
const TopNavBar = styled.div`
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

// 네비게이션 버튼 그룹
const NavButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button`
  background: ${props => props.$primary ? '#e74c3c' : '#34495e'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$primary ? '#c0392b' : '#2c3e50'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 게임 제목 표시
const GameTitle = styled.h2`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

// 메인 게임 화면 (배경 + 클릭 가능한 요소들)
const GameScreen = styled.div`
  flex: 1;
  position: relative;
  background-image: url(${props => props.$backgroundImage || gameBackground});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

// 클릭 가능한 요소들을 위한 컨테이너
const InteractiveLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

// 클릭 가능한 요소 (NPC, 물건, 단서 등)
const InteractiveElement = styled.div`
  position: absolute;
  width: ${props => props.$width || '80px'};
  height: ${props => props.$height || '80px'};
  left: ${props => props.$x || '50%'};
  top: ${props => props.$y || '50%'};
  transform: translate(-50%, -50%);
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
`;

// 요소 이름 표시 (호버 시)
const ElementLabel = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${InteractiveElement}:hover & {
    opacity: 1;
  }
`;

// 하단 채팅 인터페이스 영역
const ChatArea = styled.div`
  height: 300px;
  background: rgba(0, 0, 0, 0.9);
  border-top: 3px solid #34495e;
  position: relative;
  z-index: 100;
`;

// 로딩 및 에러 처리
const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
`;

// 게임 상태를 위한 기본 interactive elements 데이터
const DEFAULT_INTERACTIVE_ELEMENTS = [
  { id: 'npc1', type: 'npc', x: '20%', y: '60%', icon: '👤', label: '수상한 남자' },
  { id: 'evidence1', type: 'evidence', x: '70%', y: '40%', icon: '🔍', label: '증거물' },
  { id: 'clue1', type: 'clue', x: '50%', y: '30%', icon: '📋', label: '단서' },
  { id: 'door1', type: 'door', x: '90%', y: '50%', icon: '🚪', label: '문' },
  { id: 'item1', type: 'item', x: '30%', y: '80%', icon: '🔑', label: '열쇠' },
];

const GamePage = () => {
  const { playthroughId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(gameBackground);
  const [interactiveElements, setInteractiveElements] = useState(DEFAULT_INTERACTIVE_ELEMENTS);
  const [selectedElement, setSelectedElement] = useState(null);

  // 게임 데이터 로드
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

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 홈으로 가기
  const handleGoHome = () => {
    navigate('/');
  };

  // 인벤토리 열기
  const handleOpenInventory = () => {
    console.log('인벤토리 열기');
    // TODO: 인벤토리 모달 구현
  };

  // 단서장 열기
  const handleOpenClues = () => {
    console.log('단서장 열기');
    // TODO: 단서장 모달 구현
  };

  // 힌트 보기
  const handleShowHint = () => {
    console.log('힌트 보기');
    // TODO: 힌트 시스템 구현
  };

  // 클릭 가능한 요소 상호작용
  const handleElementClick = (element) => {
    console.log('요소 클릭:', element);
    setSelectedElement(element);
    
    // 요소 타입에 따른 처리
    switch (element.type) {
      case 'npc':
        // NPC와 대화 시작
        console.log('NPC와 대화 시작:', element.label);
        break;
      case 'evidence':
        // 증거물 조사
        console.log('증거물 조사:', element.label);
        break;
      case 'clue':
        // 단서 획득
        console.log('단서 획득:', element.label);
        break;
      case 'door':
        // 문 열기/이동
        console.log('문 열기:', element.label);
        break;
      case 'item':
        // 아이템 획득
        console.log('아이템 획득:', element.label);
        break;
      default:
        console.log('알 수 없는 요소:', element);
    }
  };

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
      {/* 상단 네비게이션 바 */}
      <TopNavBar>
        <NavButtonGroup>
          <NavButton onClick={handleGoBack}>← 뒤로</NavButton>
          <NavButton onClick={handleGoHome}>🏠 홈</NavButton>
        </NavButtonGroup>
        
        <GameTitle>
          {gameData?.scenarioTitle || '탐정 게임'}
        </GameTitle>
        
        <NavButtonGroup>
          <NavButton onClick={handleOpenInventory}>🎒 인벤토리</NavButton>
          <NavButton onClick={handleOpenClues}>📋 단서장</NavButton>
          <NavButton $primary onClick={handleShowHint}>💡 힌트</NavButton>
        </NavButtonGroup>
      </TopNavBar>

      {/* 메인 게임 화면 */}
      <GameScreen $backgroundImage={currentBackground}>
        <InteractiveLayer>
          {interactiveElements.map(element => (
            <InteractiveElement
              key={element.id}
              $x={element.x}
              $y={element.y}
              $width={element.width}
              $height={element.height}
              onClick={() => handleElementClick(element)}
            >
              {element.icon}
              <ElementLabel>{element.label}</ElementLabel>
            </InteractiveElement>
          ))}
        </InteractiveLayer>
      </GameScreen>

      {/* 하단 채팅 인터페이스 */}
      <ChatArea>
        <ChatBox 
          playthroughId={playthroughId}
        />
      </ChatArea>
    </GamePageContainer>
  );
};

export default GamePage; 