// client/src/components/ChatBox.jsx

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api/game';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

// 채팅박스 전체 컨테이너
const ChatBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
`;

// 메시지 표시 영역 (스크롤 가능)
const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #34495e;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(52, 73, 94, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(52, 73, 94, 0.8);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(52, 73, 94, 1);
  }
`;

// 개별 메시지 스타일
const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  padding: 12px 16px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.$isUser 
    ? 'linear-gradient(135deg, #3498db, #2980b9)' 
    : 'linear-gradient(135deg, #34495e, #2c3e50)'};
  color: white;
  font-size: 24px;
  line-height: 1.4;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const MessageLabel = styled.div`
  font-size: 12px;
  color: #bdc3c7;
  margin-bottom: 4px;
  font-weight: 500;
`;

// 로딩 인디케이터
const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7f8c8d;
    animation: bounce 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); }
    40% { transform: scale(1.0); }
  }
`;

// 입력 영역
const InputArea = styled.form`
  display: flex;
  padding: 16px;
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid #34495e;
  gap: 12px;
`;

const TextInput = styled.input`
  flex: 1;
  background: rgba(52, 73, 94, 0.8);
  color: white;
  border: 2px solid rgba(52, 73, 94, 0.5);
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #bdc3c7;
  }
  
  &:focus {
    border-color: #3498db;
    background: rgba(52, 73, 94, 1);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2980b9, #21618c);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChatBox = ({ playthroughId }) => {
  const { token } = useAuth();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      messageText: currentInput,
      isUserMessage: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const npcMessage = await sendChatMessage(playthroughId, currentInput, token);
      setMessages(prev => [...prev, npcMessage]);

    } catch (error) {
      console.error(error);
      alert(error.message);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatBoxContainer>
      <MessagesArea>
        {messages.map((msg) => (
          <MessageContainer key={msg.id} $isUser={msg.isUserMessage}>
            <MessageLabel>
              {msg.isUserMessage ? '나' : 'NPC'}
            </MessageLabel>
            <Message $isUser={msg.isUserMessage}>
              {msg.messageText}
            </Message>
          </MessageContainer>
        ))}
        {isLoading && (
          <LoadingIndicator>
            <MessageLabel>NPC가 입력중...</MessageLabel>
            <LoadingDots>
              <span></span>
              <span></span>
              <span></span>
            </LoadingDots>
          </LoadingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>
      
      <InputArea onSubmit={handleSend}>
        <TextInput
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton type="submit" disabled={isLoading || !input.trim()}>
          전송
        </SendButton>
      </InputArea>
    </ChatBoxContainer>
  );
};

export default ChatBox;