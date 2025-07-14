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
  background: #2c3e50;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  height: 70%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

// 모달 헤더
const ModalHeader = styled.div`
  background: #34495e;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #4a5568;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const BackButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #2980b9;
  }
`;

const CloseButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #c0392b;
  }
`;

// 컨텐츠 컨테이너
const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #34495e;
`;

// NPC 프로필 목록 관련 스타일
const NPCProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const NPCProfileCard = styled.div`
  background: #2c3e50;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    background: #34495e;
    border-color: #3498db;
    transform: translateY(-2px);
  }
`;

const NPCAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#7f8c8d'};
  background-size: cover;
  background-position: center;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  ${props => !props.$imageUrl && `
    background-color: #7f8c8d;
  `}
`;

const NPCName = styled.h3`
  color: white;
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
`;

const NPCStats = styled.div`
  color: #bdc3c7;
  font-size: 14px;
`;

// 채팅 메시지 관련 스타일
const ChatMessageItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$isUserMessage ? '#3498db' : '#2c3e50'};
  border-left: 4px solid ${props => props.$isUserMessage ? '#2980b9' : '#f39c12'};
  box-shadow: 0 0 0 2px #f39c12;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const SenderName = styled.span`
  font-weight: 600;
  color: ${props => props.$isUserMessage ? '#ecf0f1' : '#f39c12'};
  font-size: 14px;
`;

const MessageTime = styled.span`
  color: #bdc3c7;
  font-size: 12px;
`;

const MessageContent = styled.div`
  color: #ecf0f1;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

// 로딩 및 에러 상태
const LoadingText = styled.div`
  color: #bdc3c7;
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

// 빈 상태
const EmptyState = styled.div`
  color: #bdc3c7;
  text-align: center;
  padding: 40px;
  font-size: 16px;
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