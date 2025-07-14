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

// Act 카운트 표시 컨테이너 스타일 추가
const ActCounterContainer = styled.div`
  min-width: 54px;
  padding: 4px 10px 1px 10px;
  margin: 0 0 0 16px;
  background: linear-gradient(135deg, #fffbe6 0%, #ffe4a1 100%);
  color: #8b4513;
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: bold;
  border: 2px solid #daa520;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(218,165,32,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
  position: relative;
  transition: box-shadow 0.4s, border-color 0.4s, transform 0.4s;
  z-index: 2;
  ${props => props.$highlight && `
    box-shadow: 0 0 16px 4px #ffd700, 0 0 32px 8px #fffbe6;
    border-color: #ffb700;
    transform: scale(1.12);
    animation: actHighlightPulse 1.2s cubic-bezier(.4,0,.2,1) 0s 2 alternate;
  `}
  @keyframes actHighlightPulse {
    0% { box-shadow: 0 0 8px 2px #ffd700; border-color: #daa520; }
    100% { box-shadow: 0 0 24px 8px #ffd700; border-color: #ffb700; }
  }
`;

// Act 카운트 설명 텍스트 스타일 추가
const ActDescription = styled.div`
  font-size: 10px;
  color: #b8860b;
  font-family: 'Crimson Text', serif;
  font-weight: 400;
  margin-top: 1px;
  text-align: center;
  opacity: 0.85;
`;

// 네비게이션 바 레이아웃 개선: 타이틀 중앙 고정
const TopNavBarLayout = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const CenteredTitle = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
`;

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
  
  // 새로운 Room 기반 상태 관리
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [interactiveObjects, setInteractiveObjects] = useState([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  
  // NPC 정보 관리를 위한 새로운 상태 추가
  const [npcs, setNpcs] = useState([]);
  
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

  // Act 카운트 상태 및 애니메이션 상태 추가
  const [actCount, setActCount] = useState(30); // 기본값 예시
  const [actLimit, setActLimit] = useState(30); // 기본값 예시
  const [showActHighlight, setShowActHighlight] = useState(false);

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
        
        // 모든 NPC 정보를 추출하여 저장
        const allNpcs = [];
        roomsData.forEach(room => {
          if (room.npcs) {
            allNpcs.push(...room.npcs);
          }
        });
        setNpcs(allNpcs);
        
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

  // (가정된) 백엔드 API에서 actCount, actLimit을 받아오는 함수
  const fetchActInfo = async () => {
    // 실제 API에서 remainingQuestions를 actCount로 사용
    if (gameData) {
      // gameData에서 remainingQuestions를 actCount로, actLimit은 기본값 30 사용
      setActCount(gameData.remainingQuestions ?? 30);
      setActLimit(30); // 시나리오의 초기 행동력 제한을 30으로 설정
    }
  };

  // 게임 데이터 로드 후 act 정보 세팅 및 하이라이트 애니메이션
  useEffect(() => {
    if (gameData) {
      fetchActInfo();
      setShowActHighlight(true);
      const timer = setTimeout(() => setShowActHighlight(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [gameData]);

  // Act 카운트 감소 함수 (예: 채팅 등에서 호출)
  const decreaseActCount = () => {
    setActCount(prev => Math.max(0, prev - 1));
    // TODO: 백엔드 API 연동 필요
  };

  // 실제 API에서 행동력 업데이트 후 상태 반영
  const handleActCountDecrease = () => {
    setActCount(prev => Math.max(0, prev - 1));
  };

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
        console.log('NPC 클릭:', element);
        try {
          const npcData = JSON.parse(element.data || '{}');
          console.log('NPC 데이터:', npcData);
          
          // 실제 NPC 정보를 npcs 배열에서 찾기
          const actualNpc = npcs.find(npc => npc.id === npcData.npcId);
          console.log('실제 NPC 정보:', actualNpc);
          
          // NPC 정보를 포함한 상호작용 객체 생성
          const npcInteraction = {
            ...element,
            npcId: npcData.npcId,
            npcName: npcData.npcName,
            npcImageUrl: actualNpc?.imageUrl || element.imageUrl, // 실제 NPC imageUrl 사용
            npcInfo: actualNpc // 전체 NPC 정보 포함
          };
          
          setCurrentInteraction(npcInteraction);
          setShowChatBox(true);
        } catch (err) {
          console.error('NPC 데이터 파싱 에러:', err);
          alert('NPC와 대화를 시작할 수 없습니다.');
        }
        break;
      case 'door':
        console.log('문 클릭:', element);
        // 문 열기/방 이동
        try {
          const data = JSON.parse(element.data || '{}');
          console.log('문 데이터:', data);
          
          // 키가 필요한 문인지 확인
          if (data.requiresKey && data.requiredKeyName) {
            // 키를 보유하고 있는지 확인 (현재는 간단히 localStorage 사용)
            const hasKey = localStorage.getItem(`hasKey_${data.requiredKeyName}`) === 'true';
            if (!hasKey) {
              alert(data.lockedMessage || `${data.requiredKeyName}가 필요합니다.`);
              return;
            }
          }
          
          // 방 이름으로 대상 방 찾기
          if (data.targetRoomName) {
            console.log('대상 방 이름:', data.targetRoomName);
            const targetRoom = rooms.find(room => room.name === data.targetRoomName);
            console.log('찾은 방:', targetRoom);
            if (targetRoom) {
              await switchRoom(targetRoom);
            } else {
              console.error('대상 방을 찾을 수 없음:', data.targetRoomName);
              alert('해당 방을 찾을 수 없습니다.');
            }
          }
        } catch (err) {
          console.error('방 이동 중 에러:', err);
          alert('방 이동 중 오류가 발생했습니다.');
        }
        break;
      case 'key':
        // 키 획득 처리
        console.log('키 획득:', element);
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
        <TopNavBarLayout>
          <NavButtonGroup>
            <NavButton onClick={handleGoBack}>🎭 뒤로</NavButton>
            <NavButton onClick={handleGoHome}>🏛️ 홈</NavButton>
          </NavButtonGroup>

          <CenteredTitle>
            <GameTitle>
              {currentRoom ? `${gameData?.scenarioTitle || '탐정 게임'} - ${currentRoom.name}` : gameData?.scenarioTitle || '탐정 게임'}
            </GameTitle>
          </CenteredTitle>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NavButtonGroup>
              <NavButton onClick={handleOpenChatLog}>📜 채팅 로그</NavButton>
              <NavButton $primary onClick={handleOpenMemo}>🔍 메모장</NavButton>
            </NavButtonGroup>
            <ActCounterContainer $highlight={showActHighlight}>
              {actCount} / {actLimit}
              <ActDescription>가능한 총 질의응답 횟수</ActDescription>
            </ActCounterContainer>
          </div>
        </TopNavBarLayout>
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
                {/* NPC만 이미지 표시, 그 외에는 중앙에 빛나는 점 */}
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
            onActCountDecrease={handleActCountDecrease}
            currentActCount={actCount}
          />
        </ChatArea>

        {/* 오버레이 객체 정보 인터페이스 */}
        <ChatArea $show={showObjectInfo}>
          <ObjectInfo 
            objectData={currentObject}
            onClose={handleCloseObjectInfo}
            onItemAcquired={handleItemAcquired}
            onClueAdded={handleClueAdded}
            currentActCount={actCount}
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