import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlaythroughApi } from '../api/game';
import styled from 'styled-components';
import ChatBox from '../components/ChatBox';
import ObjectInfo from '../components/ObjectInfo';
import ChatLogModal from '../components/ChatLogModal';
import MemoModal from '../components/MemoModal';
import Submit from '../components/Submit';

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
  left: ${props => `calc(${props.$x} - (${props.$width} / 2))`};
  top: ${props => `calc(${props.$y} - (${props.$height} / 2))`};
  width: ${props => props.$width || '80px'};
  height: ${props => props.$height || '80px'};
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  z-index: 10;
  /* 중앙 빛나는 점 스타일 */
  .glow-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 14px;
    height: 14px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, #fffbe6 60%, #ffd700 100%);
    box-shadow: 0 0 12px 4px #ffd700, 0 0 24px 8px #fffbe6;
    animation: glowPulse 1.6s infinite alternate;
    pointer-events: none;
    z-index: 2;
  }
  @keyframes glowPulse {
    from { opacity: 0.7; box-shadow: 0 0 8px 2px #ffd700, 0 0 16px 4px #fffbe6; }
    to   { opacity: 1;   box-shadow: 0 0 18px 8px #ffd700, 0 0 32px 12px #fffbe6; }
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

  // Room, NPC, Object 상태
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [interactiveObjects, setInteractiveObjects] = useState([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [npcs, setNpcs] = useState([]);

  // 채팅박스, 오브젝트 정보, 모달 상태
  const [showChatBox, setShowChatBox] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [showObjectInfo, setShowObjectInfo] = useState(false);
  const [currentObject, setCurrentObject] = useState(null);
  const [showChatLogModal, setShowChatLogModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [isRoomTransitioning, setIsRoomTransitioning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 게임 데이터 로드
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const data = await getPlaythroughApi(playthroughId, token);
        setGameData(data);
        const roomsData = data.scenario?.rooms || [];
        setRooms(roomsData);
        const allNpcs = [];
        roomsData.forEach(room => {
          if (room.npcs) allNpcs.push(...room.npcs);
        });
        setNpcs(allNpcs);
        if (roomsData.length > 0) {
          const firstRoom = roomsData[0];
          setCurrentRoom(firstRoom);
          setCurrentBackground(firstRoom.backgroundImageUrl || gameBackground);
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
    if (playthroughId && token) fetchGameData();
  }, [playthroughId, token]);

  // 방 전환 함수
  const switchRoom = async (room) => {
    try {
      setIsLoadingRoom(true);
      setIsRoomTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentRoom(room);
      setCurrentBackground(room.backgroundImageUrl || gameBackground);
      const visibleObjects = (room.interactiveObjects || []).filter(obj => obj.isVisible);
      setInteractiveObjects(visibleObjects);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsRoomTransitioning(false);
    } catch (err) {
      console.error('방 전환 중 에러:', err);
      setIsRoomTransitioning(false);
    } finally {
      setIsLoadingRoom(false);
    }
  };

  // 뒤로 가기/홈
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');

  // 채팅 로그/메모장
  const handleOpenChatLog = () => setShowChatLogModal(true);
  const handleOpenMemoModal = () => setShowMemoModal(true);
  const handleCloseChatLogModal = () => setShowChatLogModal(false);
  const handleCloseMemoModal = () => setShowMemoModal(false);

  // 제출 모달 열기 (모든 NPC와 대화했는지 체크)
  const handleOpenSubmitModal = () => {
    if (!gameData || !gameData.chatLogs || !npcs.length) {
      alert('게임 데이터가 완전히 로드되지 않았습니다.');
      return;
    }
    const allNpcsConversed = npcs.every(npc =>
      gameData.chatLogs.some(log => log.npcId === npc.id)
    );
    if (!allNpcsConversed) {
      alert('모든 용의자와 한 번 이상 대화해야 합니다.');
      return;
    }
    setShowSubmitModal(true);
  };
  const handleCloseSubmitModal = () => setShowSubmitModal(false);
  const handleSubmissionComplete = (report) => {
    console.log('게임이 종료되었습니다.', report);
    // 필요시 추가 후처리
  };

  // 클릭 가능한 요소 상호작용
  const handleElementClick = async (element) => {
    setSelectedElement(element);
    switch (element.type) {
      case 'npc': {
        try {
          const npcData = JSON.parse(element.data || '{}');
          const actualNpc = npcs.find(npc => npc.id === npcData.npcId);
          const npcInteraction = {
            ...element,
            npcId: npcData.npcId,
            npcName: npcData.npcName,
            npcImageUrl: actualNpc?.imageUrl || element.imageUrl,
            npcInfo: actualNpc
          };
          setCurrentInteraction(npcInteraction);
          setShowChatBox(true);
        } catch (err) {
          alert('NPC와 대화를 시작할 수 없습니다.');
        }
        break;
      }
      case 'door': {
        try {
          const data = JSON.parse(element.data || '{}');
          if (data.requiresKey && data.requiredKeyName) {
            const hasKey = localStorage.getItem(`hasKey_${data.requiredKeyName}`) === 'true';
            if (!hasKey) {
              alert(data.lockedMessage || `${data.requiredKeyName}가 필요합니다.`);
              return;
            }
          }
          if (data.targetRoomName) {
            const targetRoom = rooms.find(room => room.name === data.targetRoomName);
            if (targetRoom) await switchRoom(targetRoom);
            else alert('해당 방을 찾을 수 없습니다.');
          }
        } catch (err) {
          alert('방 이동 중 오류가 발생했습니다.');
        }
        break;
      }
      case 'key': {
        const keyName = element.name;
        const hasKeyAlready = localStorage.getItem(`hasKey_${keyName}`) === 'true';
        if (!hasKeyAlready) {
          localStorage.setItem(`hasKey_${keyName}`, 'true');
          handleItemAcquired(element);
          alert(`${keyName}을(를) 획득했습니다!`);
        } else {
          alert('이미 보유하고 있는 키입니다.');
        }
        break;
      }
      case 'book':
      case 'notepad':
      case 'evidence':
      case 'clue':
      case 'item':
        setCurrentObject(element);
        setShowObjectInfo(true);
        break;
      default:
        break;
    }
  };

  // 채팅박스/오브젝트 정보 닫기
  const handleCloseChatBox = () => { setShowChatBox(false); setCurrentInteraction(null); };
  const handleCloseObjectInfo = () => { setShowObjectInfo(false); setCurrentObject(null); };
  const handleItemAcquired = (itemData) => {
    setInteractiveObjects(prev => prev.filter(obj => obj.id !== itemData.id));
  };
  const handleClueAdded = (clueData) => {
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
          <NavButton $primary onClick={handleOpenSubmitModal}>🚨 범인 지목</NavButton>
          <NavButton onClick={handleOpenChatLog}>📜 채팅 로그</NavButton>
          <NavButton onClick={handleOpenMemoModal}>🔍 메모장</NavButton>
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
                {element.type === 'npc' ? (
                  <img
                    src={(() => {
                      if (element.imageUrl) return element.imageUrl;
                      if (element.npcInfo && element.npcInfo.imageUrl) return element.npcInfo.imageUrl;
                      return '';
                    })()}
                    alt={element.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      display: 'block',
                    }}
                  />
                ) : (
                  <span className="glow-dot" />
                )}
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
      {/* 제출 모달 */}
      {showSubmitModal && (
        <Submit
          playthroughId={playthroughId}
          gameData={gameData}
          onClose={handleCloseSubmitModal}
          onSubmissionComplete={handleSubmissionComplete}
        />
      )}
    </GamePageContainer>
  );
};

export default GamePage; 