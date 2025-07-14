import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi } from '../api/game';
import styled from 'styled-components';
import ChatBox from '../components/ChatBox';
import ObjectInfo from '../components/ObjectInfo';
import ChatLogModal from '../components/ChatLogModal';
import MemoModal from '../components/MemoModal';

// 게임 배경 이미지 import
import gameBackground from '../assets/images/game_background.png';
import streetBackground from '../assets/images/street_background.png';

// 게임 페이지 컨테이너 (전체 화면)
const GamePageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: 'Crimson Text', serif;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(139, 69, 19, 0.03) 2px,
        rgba(139, 69, 19, 0.03) 4px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

// 상단 네비게이션 바
const TopNavBar = styled.div`
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  border-bottom: 3px solid #daa520;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1000;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 15px;
    right: 15px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.3), transparent);
  }
`;

// 네비게이션 버튼 그룹
const NavButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button`
  background: ${props => props.$primary ? 
    'linear-gradient(135deg, #daa520 0%, #b8860b 100%)' : 
    'linear-gradient(135deg, #8b4513 0%, #654321 100%)'};
  color: ${props => props.$primary ? '#1c1c1c' : '#f4e8d0'};
  border: 2px solid ${props => props.$primary ? '#8b4513' : '#daa520'};
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Cinzel', serif;
  text-shadow: ${props => props.$primary ? 
    '0 1px 0 rgba(255, 255, 255, 0.2)' : 
    '0 1px 0 rgba(0, 0, 0, 0.5)'};
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$primary ? 
      'linear-gradient(135deg, #b8860b 0%, #daa520 100%)' : 
      'linear-gradient(135deg, #654321 0%, #8b4513 100%)'};
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

// 게임 제목 표시
const GameTitle = styled.h2`
  color: #daa520;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  margin: 0;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  position: relative;
  
  &::before,
  &::after {
    content: '◆';
    color: #b8860b;
    font-size: 0.8em;
    margin: 0 10px;
    opacity: 0.7;
  }
`;

// 메인 게임 화면 (배경 + 클릭 가능한 요소들)
const GameScreen = styled.div`
  flex: 1;
  position: relative;
  background-image: 
    url(${props => props.$backgroundImage || gameBackground}),
    radial-gradient(circle at 20% 20%, rgba(218, 165, 32, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
  background-size: cover, 100% 100%, 100% 100%;
  background-position: center, center, center;
  background-repeat: no-repeat;
  background-blend-mode: overlay, multiply, normal;
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;
  opacity: ${props => props.$fadeOut ? 0 : 1};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 50px,
        rgba(139, 69, 19, 0.02) 50px,
        rgba(139, 69, 19, 0.02) 52px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

// 클릭 가능한 요소들을 위한 컨테이너
const InteractiveLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  transition: opacity 0.5s ease-in-out;
  opacity: ${props => props.$fadeOut ? 0 : 1};
  pointer-events: ${props => props.$fadeOut ? 'none' : 'auto'};
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
  background: radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%);
  border: 2px solid rgba(218, 165, 32, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(218, 165, 32, 0.4),
    inset 0 0 20px rgba(218, 165, 32, 0.2);
  z-index: 10;
  
  &:hover {
    background: radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, transparent 70%);
    border-color: rgba(218, 165, 32, 0.8);
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 
      0 0 30px rgba(218, 165, 32, 0.6),
      inset 0 0 30px rgba(218, 165, 32, 0.3);
    animation: vintageGlow 2s ease-in-out infinite alternate;
  }
  
  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
  
  @keyframes vintageGlow {
    from { box-shadow: 0 0 20px rgba(218, 165, 32, 0.4); }
    to { box-shadow: 0 0 40px rgba(218, 165, 32, 0.8); }
  }
`;

// 요소 이름 표시 (호버 시)
const ElementLabel = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  color: #1c1c1c;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #8b4513;
  font-size: 12px;
  font-family: 'Cinzel', serif;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  ${InteractiveElement}:hover & {
    opacity: 1;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #8b4513;
  }
`;

// 오버레이 채팅 인터페이스 영역
const ChatArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at center, rgba(44, 24, 16, 0.8) 0%, rgba(26, 15, 10, 0.9) 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(139, 69, 19, 0.1) 2px,
      rgba(139, 69, 19, 0.1) 4px
    );
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: opacity 0.5s ease-in-out;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
`;

// 로딩 및 에러 처리
const LoadingText = styled.div`
  color: #daa520;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  text-align: center;
  margin-top: 50px;
  text-shadow: 
    0 0 10px rgba(218, 165, 32, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 10;
  position: relative;
  
  &::before {
    content: '◇';
    display: block;
    font-size: 24px;
    margin-bottom: 10px;
    opacity: 0.7;
  }
`;

const ErrorText = styled.div`
  color: #cd853f;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  text-align: center;
  margin-top: 50px;
  text-shadow: 
    0 0 10px rgba(205, 133, 63, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 10;
  position: relative;
  
  &::before {
    content: '⚠';
    display: block;
    font-size: 24px;
    margin-bottom: 10px;
    opacity: 0.7;
  }
`;

const GamePage = () => {
  const { playthroughId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(gameBackground);
  const [selectedElement, setSelectedElement] = useState(null);
  
  // 새로운 Room 기반 상태 관리
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [interactiveObjects, setInteractiveObjects] = useState([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  
  // 채팅박스 상태 관리 (NPC 전용)
  const [showChatBox, setShowChatBox] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState(null);
  
  // 객체 정보 상태 관리 (객체 전용)
  const [showObjectInfo, setShowObjectInfo] = useState(false);
  const [currentObject, setCurrentObject] = useState(null);
  
  // 채팅 로그 모달 상태 관리
  const [showChatLogModal, setShowChatLogModal] = useState(false);
  
  // 메모장 모달 상태 관리
  const [showMemoModal, setShowMemoModal] = useState(false);
  
  // 방 전환 애니메이션 상태
  const [isRoomTransitioning, setIsRoomTransitioning] = useState(false);

  // 게임 데이터 로드
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        
        // 단일 API 호출로 모든 게임 데이터 가져오기
        const data = await getPlaythroughApi(playthroughId, token);
        setGameData(data);
        
        // API 응답에서 rooms 데이터 추출
        const roomsData = data.scenario?.rooms || [];
        setRooms(roomsData);
        
        // 첫 번째 방으로 초기 설정
        if (roomsData.length > 0) {
          const firstRoom = roomsData[0];
          setCurrentRoom(firstRoom);
          
          // 방 배경 이미지 설정
          if (firstRoom.backgroundImageUrl) {
            setCurrentBackground(firstRoom.backgroundImageUrl);
          } else {
            setCurrentBackground(gameBackground);
          }
          
          // 첫 번째 방의 상호작용 객체 설정
          const visibleObjects = (firstRoom.interactiveObjects || []).filter(obj => obj.isVisible);
          setInteractiveObjects(visibleObjects);
        }
        
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

  // 방 전환 함수 (컴포넌트 내 다른 곳에서 사용)
  const switchRoom = async (room) => {
    try {
      setIsLoadingRoom(true);
      setIsRoomTransitioning(true);
      
      // 1. 페이드 아웃 (0.5초 대기)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. 방 정보 및 배경 이미지 변경
      setCurrentRoom(room);
      if (room.backgroundImageUrl) {
        setCurrentBackground(room.backgroundImageUrl);
      } else {
        setCurrentBackground(gameBackground);
      }
      
      // 3. 해당 방의 상호작용 객체 설정 (이미 로드된 데이터 사용)
      const visibleObjects = (room.interactiveObjects || []).filter(obj => obj.isVisible);
      setInteractiveObjects(visibleObjects);
      
      // 4. 짧은 대기 후 페이드 인 시작
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsRoomTransitioning(false);
      
    } catch (err) {
      console.error('방 전환 중 에러:', err);
      setIsRoomTransitioning(false);
    } finally {
      setIsLoadingRoom(false);
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 홈으로 가기
  const handleGoHome = () => {
    navigate('/');
  };

  // 채팅 로그 열기
  const handleOpenChatLog = () => {
    console.log('채팅 로그 열기');
    setShowChatLogModal(true);
  };

  // 메모장 열기
  const handleOpenMemo = () => {
    console.log('메모장 열기');
    setShowMemoModal(true);
  };

  // 클릭 가능한 요소 상호작용
  const handleElementClick = async (element) => {
    console.log('요소 클릭:', element);
    setSelectedElement(element);
    
    // 요소 타입에 따른 처리
    switch (element.type) {
      case 'npc':
        // NPC와 대화 시작 (채팅창 표시)
        setCurrentInteraction(element);
        setShowChatBox(true);
        break;
      case 'door':
        // 문 열기/방 이동
        try {
          const data = JSON.parse(element.data || '{}');
          if (data.targetRoomId) {
            const targetRoom = rooms.find(room => room.id === data.targetRoomId);
            if (targetRoom) {
              await switchRoom(targetRoom);
            }
          }
        } catch (err) {
          console.error('방 이동 중 에러:', err);
        }
        break;
      case 'book':
      case 'notepad':
      case 'evidence':
      case 'clue':
      case 'item':
        // 객체들은 정보 패널 표시
        setCurrentObject(element);
        setShowObjectInfo(true);
        break;
      default:
        console.log('알 수 없는 요소:', element);
    }
  };

  // 채팅박스 닫기
  const handleCloseChatBox = () => {
    setShowChatBox(false);
    setCurrentInteraction(null);
  };

  // 객체 정보 닫기
  const handleCloseObjectInfo = () => {
    setShowObjectInfo(false);
    setCurrentObject(null);
  };

  // 채팅 로그 모달 닫기
  const handleCloseChatLogModal = () => {
    setShowChatLogModal(false);
  };

  // 메모장 모달 닫기
  const handleCloseMemoModal = () => {
    setShowMemoModal(false);
  };

  // 아이템 획득 처리
  const handleItemAcquired = (itemData) => {
    console.log('아이템 획득:', itemData);
    // 아이템을 화면에서 제거
    setInteractiveObjects(prev => prev.filter(obj => obj.id !== itemData.id));
    // TODO: 인벤토리에 아이템 추가 API 호출
  };

  // 단서 추가 처리
  const handleClueAdded = (clueData) => {
    console.log('단서 추가:', clueData);
    // TODO: 단서장에 단서 추가 API 호출
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
          <NavButton onClick={handleGoBack}>🎭 뒤로</NavButton>
          <NavButton onClick={handleGoHome}>🏛️ 홈</NavButton>
        </NavButtonGroup>
        
        <GameTitle>
          {currentRoom ? `${gameData?.scenarioTitle || '탐정 게임'} - ${currentRoom.name}` : gameData?.scenarioTitle || '탐정 게임'}
        </GameTitle>
        
        <NavButtonGroup>
          <NavButton onClick={handleOpenChatLog}>📜 채팅 로그</NavButton>
          <NavButton $primary onClick={handleOpenMemo}>🔍 메모장</NavButton>
        </NavButtonGroup>
      </TopNavBar>

      {/* 메인 게임 화면 */}
      <GameScreen $backgroundImage={currentBackground} $fadeOut={isRoomTransitioning}>
        <InteractiveLayer $fadeOut={showChatBox || showObjectInfo || isRoomTransitioning}>
          {isLoadingRoom ? (
            <LoadingText>방 로딩 중...</LoadingText>
          ) : (
            interactiveObjects.map(element => (
              <InteractiveElement
                key={element.id}
                $x={element.x}
                $y={element.y}
                $width={element.width}
                $height={element.height}
                onClick={() => handleElementClick(element)}
              >
                {element.icon}
                <ElementLabel>{element.name}</ElementLabel>
              </InteractiveElement>
            ))
          )}
        </InteractiveLayer>

        {/* 오버레이 채팅 인터페이스 (NPC 전용) */}
        <ChatArea $show={showChatBox}>
          <ChatBox 
            playthroughId={playthroughId}
            currentInteraction={currentInteraction}
            onClose={handleCloseChatBox}
          />
        </ChatArea>

        {/* 오버레이 객체 정보 인터페이스 */}
        <ChatArea $show={showObjectInfo}>
          <ObjectInfo 
            objectData={currentObject}
            onClose={handleCloseObjectInfo}
            onItemAcquired={handleItemAcquired}
            onClueAdded={handleClueAdded}
          />
        </ChatArea>
      </GameScreen>

      {/* 채팅 로그 모달 */}
      {showChatLogModal && (
        <ChatLogModal 
          playthroughId={playthroughId}
          token={token}
          onClose={handleCloseChatLogModal}
        />
      )}

      {/* 메모장 모달 */}
      {showMemoModal && (
        <MemoModal 
          playthroughId={playthroughId}
          token={token}
          gameData={gameData}
          onClose={handleCloseMemoModal}
        />
      )}
    </GamePageContainer>
  );
};

export default GamePage; 