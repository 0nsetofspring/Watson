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

// 채팅 목록 컨테이너
const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #34495e;
`;

// 채팅 메시지 아이템
const ChatMessageItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$isUserMessage ? '#3498db' : '#2c3e50'};
  border-left: 4px solid ${props => props.$isUserMessage ? '#2980b9' : '#e74c3c'};
  ${props => props.$isHighlighted && `
    box-shadow: 0 0 0 2px #f39c12;
  `}
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
  color: ${props => props.$isUserMessage ? '#ecf0f1' : '#f39c12'};
  font-size: 14px;
`;

const MessageTime = styled.span`
  color: #bdc3c7;
  font-size: 12px;
`;

const HighlightIndicator = styled.span`
  background: #f39c12;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
`;

// 메시지 내용
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