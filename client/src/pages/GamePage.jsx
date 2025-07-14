import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi, getRoomsApi, getInteractiveObjectsApi } from '../api/game';
import styled from 'styled-components';
import ChatBox from '../components/ChatBox';
import ObjectInfo from '../components/ObjectInfo';

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
  transition: opacity 0.5s ease-in-out;
  opacity: ${props => props.$fadeOut ? 0 : 1};
`;

// 클릭 가능한 요소들을 위한 컨테이너
const InteractiveLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
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

// 오버레이 채팅 인터페이스 영역
const ChatArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: opacity 0.5s ease-in-out;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
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
  
  // 방 전환 애니메이션 상태
  const [isRoomTransitioning, setIsRoomTransitioning] = useState(false);

  // 게임 데이터 로드
  useEffect(() => {
    const switchRoomInitial = async (room) => {
      try {
        setIsLoadingRoom(true);
        setCurrentRoom(room);
        
        // 방 배경 이미지 설정 (초기 로드 시에는 애니메이션 없음)
        if (room.backgroundImageUrl) {
          setCurrentBackground(room.backgroundImageUrl);
        } else {
          setCurrentBackground(gameBackground);
        }
        
        // 해당 방의 상호작용 객체 가져오기
        const objectsData = await getInteractiveObjectsApi(room.id, token);
        setInteractiveObjects(objectsData);
        
      } catch (err) {
        console.error('방 전환 중 에러:', err);
      } finally {
        setIsLoadingRoom(false);
      }
    };

    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const data = await getPlaythroughApi(playthroughId, token);
        setGameData(data);
        
        // 방 목록 가져오기
        const roomsData = await getRoomsApi(data.scenarioId, token);
        setRooms(roomsData);
        
        // 첫 번째 방으로 이동
        if (roomsData.length > 0) {
          await switchRoomInitial(roomsData[0]);
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
      
      // 3. 해당 방의 상호작용 객체 가져오기
      const objectsData = await getInteractiveObjectsApi(room.id, token);
      setInteractiveObjects(objectsData);
      
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
          <NavButton onClick={handleGoBack}>← 뒤로</NavButton>
          <NavButton onClick={handleGoHome}>🏠 홈</NavButton>
        </NavButtonGroup>
        
        <GameTitle>
          {currentRoom ? `${gameData?.scenarioTitle || '탐정 게임'} - ${currentRoom.name}` : gameData?.scenarioTitle || '탐정 게임'}
        </GameTitle>
        
        <NavButtonGroup>
          <NavButton onClick={handleOpenInventory}>🎒 인벤토리</NavButton>
          <NavButton onClick={handleOpenClues}>📋 단서장</NavButton>
          <NavButton $primary onClick={handleShowHint}>💡 힌트</NavButton>
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
    </GamePageContainer>
  );
};

export default GamePage; 