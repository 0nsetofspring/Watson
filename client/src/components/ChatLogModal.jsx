import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getChatHistory } from '../api/game';

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

// 채팅 목록 컨테이너
const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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

// 채팅 메시지 아이템
const ChatMessageItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 15px;
  border-radius: 6px;
  background: ${props => props.$isUserMessage 
    ? 'linear-gradient(135deg, #daa520, #b8860b)' 
    : 'linear-gradient(135deg, #e6d3b0, #d4c2a0)'};
  border: 1px solid ${props => props.$isUserMessage ? '#8b4513' : '#c4a67a'};
  color: ${props => props.$isUserMessage ? '#1c1c1c' : '#2c1810'};
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  ${props => props.$isHighlighted && `
    box-shadow: 
      0 0 0 2px #f39c12,
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `}
  
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

// 메시지 헤더 (발신자 정보)
const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
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

const HighlightIndicator = styled.span`
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: #1c1c1c;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #8b4513;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
`;

// 메시지 내용
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
    content: '📜';
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
    content: '📝';
    display: block;
    font-size: 32px;
    margin-bottom: 15px;
    opacity: 0.7;
  }
`;

const ChatLogModal = ({ playthroughId, token, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getChatHistory(playthroughId, token);
        setChatHistory(data);
      } catch (err) {
        setError(err.message);
        console.error('채팅 기록 조회 에러:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (playthroughId && token) {
      fetchChatHistory();
    }
  }, [playthroughId, token]);

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
          <ModalTitle>📋 채팅 로그</ModalTitle>
          <CloseButton onClick={onClose}>닫기</CloseButton>
        </ModalHeader>
        
        <ChatListContainer>
          {isLoading && <LoadingText>채팅 기록을 불러오는 중...</LoadingText>}
          
          {error && <ErrorText>에러: {error}</ErrorText>}
          
          {!isLoading && !error && chatHistory.length === 0 && (
            <EmptyState>아직 채팅 기록이 없습니다.</EmptyState>
          )}
          
          {!isLoading && !error && chatHistory.length > 0 && (
            chatHistory.map((message) => (
              <ChatMessageItem 
                key={message.id} 
                $isUserMessage={message.isUserMessage}
                $isHighlighted={message.isHighlighted}
              >
                <MessageHeader>
                  <SenderName $isUserMessage={message.isUserMessage}>
                    {message.isUserMessage ? '플레이어' : (message.npc?.name || 'NPC')}
                  </SenderName>
                  <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                  {message.isHighlighted && (
                    <HighlightIndicator>하이라이트</HighlightIndicator>
                  )}
                </MessageHeader>
                <MessageContent>{message.messageText}</MessageContent>
              </ChatMessageItem>
            ))
          )}
        </ChatListContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ChatLogModal; 