import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getHighlightedChatHistory } from '../api/game';

// 모달 오버레이
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

// 모달 컨테이너
const ModalContainer = styled.div`
  background: 
    linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  border: 3px solid #8b4513;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  height: 90%;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  font-family: 'Crimson Text', serif;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 1px solid rgba(139, 69, 19, 0.3);
    border-radius: 4px;
    pointer-events: none;
  }
`;

// 모달 헤더
const ModalHeader = styled.div`
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  color: #daa520;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #daa520;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Cinzel', serif;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #cd853f, #a0522d);
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Cinzel', serif;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #a0522d, #cd853f);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

// 컨텐츠 컨테이너
const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  background: 
    radial-gradient(circle at 20% 20%, rgba(218, 165, 32, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
    #f4e8d0;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 20px,
        rgba(139, 69, 19, 0.02) 20px,
        rgba(139, 69, 19, 0.02) 21px
      );
    pointer-events: none;
  }
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.2);
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #8b4513, #654321);
    border-radius: 6px;
    border: 1px solid #daa520;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #654321, #8b4513);
  }
`;

// NPC 프로필 목록 관련 스타일
const NPCProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  position: relative;
  z-index: 1;
`;

const NPCProfileCard = styled.div`
  background: linear-gradient(135deg, #e6d3b0 0%, #d4c2a0 100%);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  
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
        transparent 15px,
        rgba(139, 69, 19, 0.02) 15px,
        rgba(139, 69, 19, 0.02) 17px
      );
    pointer-events: none;
    border-radius: 6px;
  }
  
  &:hover {
    background: linear-gradient(135deg, #d4c2a0 0%, #e6d3b0 100%);
    border-color: #daa520;
    transform: translateY(-3px);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const NPCAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(135deg, #8b4513, #654321)'};
  background-size: cover;
  background-position: top center;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #f4e8d0;
  border: 3px solid #8b4513;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NPCName = styled.h3`
  color: #8b4513;
  margin: 0 0 15px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
`;

const NPCStats = styled.div`
  color: #654321;
  font-size: 14px;
  font-family: 'Crimson Text', serif;
  line-height: 1.4;
`;

// 채팅 메시지 관련 스타일
const ChatMessageItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
  padding: 15px;
  border-radius: 6px;
  background: ${props => props.$isUserMessage 
    ? 'linear-gradient(135deg, #daa520, #b8860b)' 
    : 'linear-gradient(135deg, #e6d3b0, #d4c2a0)'};
  border: 1px solid ${props => props.$isUserMessage ? '#8b4513' : '#c4a67a'};
  color: ${props => props.$isUserMessage ? '#1c1c1c' : '#2c1810'};
  box-shadow: 
    0 0 0 2px #f39c12,
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 20px,
        rgba(139, 69, 19, 0.03) 20px,
        rgba(139, 69, 19, 0.03) 21px
      );
    pointer-events: none;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
`;

const SenderName = styled.span`
  font-weight: 600;
  color: ${props => props.$isUserMessage ? '#1c1c1c' : '#8b4513'};
  font-size: 14px;
  font-family: 'Cinzel', serif;
  text-shadow: ${props => props.$isUserMessage ? 
    '0 1px 0 rgba(255, 255, 255, 0.2)' : 
    '0 1px 0 rgba(0, 0, 0, 0.2)'};
`;

const MessageTime = styled.span`
  color: ${props => props.$isUserMessage ? 'rgba(28, 28, 28, 0.7)' : 'rgba(139, 69, 19, 0.7)'};
  font-size: 12px;
  font-family: 'Crimson Text', serif;
`;

const MessageContent = styled.div`
  color: ${props => props.$isUserMessage ? '#1c1c1c' : '#2c1810'};
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  font-family: 'Crimson Text', serif;
  position: relative;
  z-index: 1;
`;

// 로딩 및 에러 상태
const LoadingText = styled.div`
  color: #8b4513;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  text-align: center;
  padding: 50px;
  text-shadow: 
    0 0 10px rgba(139, 69, 19, 0.3),
    2px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '🔍';
    display: block;
    font-size: 32px;
    margin-bottom: 15px;
    opacity: 0.7;
  }
`;

const ErrorText = styled.div`
  color: #cd853f;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  text-align: center;
  padding: 50px;
  text-shadow: 
    0 0 10px rgba(205, 133, 63, 0.3),
    2px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '⚠';
    display: block;
    font-size: 32px;
    margin-bottom: 15px;
    opacity: 0.7;
  }
`;

// 빈 상태
const EmptyState = styled.div`
  color: #8b4513;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  text-align: center;
  padding: 50px;
  text-shadow: 
    0 0 10px rgba(139, 69, 19, 0.3),
    2px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '📋';
    display: block;
    font-size: 32px;
    margin-bottom: 15px;
    opacity: 0.7;
  }
`;

const MemoModal = ({ playthroughId, token, gameData, onClose }) => {
  const [viewMode, setViewMode] = useState('profiles'); // 'profiles' or 'chats'
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [highlightedChats, setHighlightedChats] = useState([]);
  const [npcProfiles, setNPCProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // NPC 프로필 정보 초기화
  useEffect(() => {
    if (gameData && gameData.scenario && gameData.scenario.rooms) {
      const npcs = [];
      gameData.scenario.rooms.forEach(room => {
        if (room.npcs) {
          room.npcs.forEach(npc => {
            npcs.push({
              ...npc,
              roomName: room.name
            });
          });
        }
      });
      setNPCProfiles(npcs);
    }
  }, [gameData]);

  // 하이라이트된 채팅 기록 가져오기
  const fetchHighlightedChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHighlightedChatHistory(playthroughId, token);
      setHighlightedChats(data);
    } catch (err) {
      setError(err.message);
      console.error('하이라이트된 채팅 기록 조회 에러:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // NPC 프로필 클릭 핸들러
  const handleNPCClick = async (npc) => {
    setSelectedNPC(npc);
    setViewMode('chats');
    await fetchHighlightedChats();
  };

  // 뒤로 가기 핸들러
  const handleBackClick = () => {
    setViewMode('profiles');
    setSelectedNPC(null);
    setHighlightedChats([]);
  };

  // NPC별 하이라이트된 채팅 필터링
  const getFilteredChats = () => {
    if (!selectedNPC) return [];
    return highlightedChats.filter(chat => chat.npcId === selectedNPC.id);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            💡 메모장 
            {viewMode === 'chats' && selectedNPC && ` - ${selectedNPC.name}`}
          </ModalTitle>
          <ButtonGroup>
            {viewMode === 'chats' && (
              <BackButton onClick={handleBackClick}>← 뒤로</BackButton>
            )}
            <CloseButton onClick={onClose}>닫기</CloseButton>
          </ButtonGroup>
        </ModalHeader>
        
        <ContentContainer>
          {viewMode === 'profiles' && (
            <>
              {npcProfiles.length === 0 ? (
                <EmptyState>NPC 정보를 불러오는 중...</EmptyState>
              ) : (
                <NPCProfileGrid>
                  {npcProfiles.map((npc) => (
                    <NPCProfileCard 
                      key={npc.id}
                      onClick={() => handleNPCClick(npc)}
                    >
                      <NPCAvatar $imageUrl={npc.imageUrl}>
                        {!npc.imageUrl && '👤'}
                      </NPCAvatar>
                      <NPCName>{npc.name}</NPCName>
                      <NPCStats>
                        위치: {npc.roomName}
                      </NPCStats>
                    </NPCProfileCard>
                  ))}
                </NPCProfileGrid>
              )}
            </>
          )}

          {viewMode === 'chats' && (
            <>
              {isLoading && <LoadingText>하이라이트된 채팅을 불러오는 중...</LoadingText>}
              
              {error && <ErrorText>에러: {error}</ErrorText>}
              
              {!isLoading && !error && getFilteredChats().length === 0 && (
                <EmptyState>
                  {selectedNPC?.name}와의 하이라이트된 채팅이 없습니다.
                </EmptyState>
              )}
              
              {!isLoading && !error && getFilteredChats().length > 0 && (
                getFilteredChats().map((message) => (
                  <ChatMessageItem 
                    key={message.id} 
                    $isUserMessage={message.isUserMessage}
                  >
                    <MessageHeader>
                      <SenderName $isUserMessage={message.isUserMessage}>
                        {message.isUserMessage ? '플레이어' : (message.npc?.name || 'NPC')}
                      </SenderName>
                      <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                    </MessageHeader>
                    <MessageContent>{message.messageText}</MessageContent>
                  </ChatMessageItem>
                ))
              )}
            </>
          )}
        </ContentContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MemoModal; 