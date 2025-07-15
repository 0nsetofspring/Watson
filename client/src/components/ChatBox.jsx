// client/src/components/ChatBox.jsx

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory, toggleChatHighlight } from '../api/game';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

// 채팅박스 전체 컨테이너
const ChatBoxContainer = styled.div`
  display: flex;
  flex-direction: row; /* 가로 배치로 변경 */
  height: 90%;
  width: 95%;
  max-width: 1200px;
  background: 
    linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  border: 3px solid #8b4513;
  border-radius: 8px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  font-family: 'Crimson Text', serif;
  
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
    z-index: 1;
  }
`;

// 캐릭터 이미지 영역 (왼쪽)
const CharacterArea = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  position: relative;
  z-index: 2;
  overflow: hidden;
`;

// 캐릭터 이미지
const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid #daa520;
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  display: block;
`;

// 기본 캐릭터 아이콘 (이미지가 없을 때)
const DefaultCharacterIcon = styled.div`
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 2px solid #daa520;
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  font-size: 80px;
  color: #8b4513;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

// 캐릭터 정보 영역
const CharacterInfo = styled.div`
  text-align: center;
  color: #daa520;
  margin-bottom: auto;
`;

// 캐릭터 이름
const CharacterName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  margin: 0 0 8px 0;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  
  &::before,
  &::after {
    content: '◆';
    color: #b8860b;
    font-size: 0.7em;
    margin: 0 8px;
    opacity: 0.7;
  }
`;

// 채팅 영역 (오른쪽)
const ChatAreaContainer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
`;

// 채팅박스 헤더 (닫기 버튼 포함)
const ChatBoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  border-bottom: 3px solid #daa520;
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

// 상호작용 중인 객체 정보
const InteractionInfo = styled.div`
  color: #daa520;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  position: relative;
  
  &::before,
  &::after {
    content: '◆';
    color: #b8860b;
    font-size: 0.8em;
    margin: 0 8px;
    opacity: 0.7;
  }
`;

// 닫기 버튼
const CloseButton = styled.button`
  background: linear-gradient(135deg, #cd853f, #a0522d);
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #a0522d, #cd853f);
    transform: scale(1.05);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// 메시지 표시 영역 (스크롤 가능)
const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: 
    radial-gradient(circle at 20% 20%, rgba(218, 165, 32, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
    #f4e8d0;
  border-bottom: 1px solid #8b4513;
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

// 개별 메시지 스타일
const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  padding: 12px 16px;
`;

const Message = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 6px;
  background: ${props => {
    if (props.$isHighlighted) {
      return props.$isUser 
        ? 'linear-gradient(135deg, #f39c12, #e67e22)'
        : 'linear-gradient(135deg, #f1c40f, #f39c12)';
    }
    return props.$isUser 
      ? 'linear-gradient(135deg, #daa520, #b8860b)' 
      : 'linear-gradient(135deg, #e6d3b0, #d4c2a0)';
  }};
  color: ${props => props.$isUser ? '#1c1c1c' : '#2c1810'};
  font-size: 15px;
  font-family: 'Crimson Text', serif;
  line-height: 1.5;
  word-wrap: break-word;
  border: 1px solid ${props => {
    if (props.$isHighlighted) {
      return '#e67e22';
    }
    return props.$isUser ? '#8b4513' : '#c4a67a';
  }};
  box-shadow: 
    ${props => props.$isHighlighted ? '0 0 0 2px #f39c12,' : ''}
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
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 4px;
  width: 100%;
  gap: 8px; /* NPC 이름과 하이라이트 버튼 사이의 간격 */
`;

const MessageLabel = styled.div`
  font-size: 12px;
  color: #8b4513;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
`;

const HighlightButton = styled.button`
  background: ${props => props.$isHighlighted 
    ? 'linear-gradient(135deg, #f39c12, #e67e22)'
    : 'linear-gradient(135deg, #8b4513, #654321)'};
  color: ${props => props.$isHighlighted ? '#1c1c1c' : '#f4e8d0'};
  border: 1px solid ${props => props.$isHighlighted ? '#e67e22' : '#8b4513'};
  border-radius: 3px;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$show ? 1 : 0};
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
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
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  border-top: 2px solid #daa520;
  gap: 12px;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
`;

const TextInput = styled.input`
  flex: 1;
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  color: #1c1c1c;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 14px;
  font-family: 'Crimson Text', serif;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.2);
  
  &::placeholder {
    color: #8b4513;
    opacity: 0.7;
  }
  
  &:focus {
    border-color: #daa520;
    background: linear-gradient(135deg, #e6d3b0 0%, #f4e8d0 100%);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 0 0 3px rgba(218, 165, 32, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #daa520, #b8860b);
  color: #1c1c1c;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #b8860b, #daa520);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// 행동력 안내 문구 스타일 추가
const ActWarning = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  font-size: 12px;
  font-family: 'Crimson Text', serif;
  padding: 6px 12px;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-bottom: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// 질문 비용 안내 텍스트 스타일 추가
const QuestionCostText = styled.div`
  font-size: 11px;
  color: #b8860b;
  font-family: 'Crimson Text', serif;
  text-align: center;
  margin-top: 4px;
  opacity: 0.8;
`;

const ChatBox = ({ playthroughId, currentInteraction, onClose, onActCountDecrease, currentActCount }) => {
  const { token } = useAuth();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // currentInteraction 정보를 로컬 상태로 저장 (닫기 애니메이션 중에도 유지하기 위함)
  const [localInteraction, setLocalInteraction] = useState(null);
  
  // currentInteraction이 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    if (currentInteraction) {
      setLocalInteraction(currentInteraction);
    }
  }, [currentInteraction]);

  // 채팅 기록 불러오기
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!playthroughId || !token || !currentInteraction) return;
      
      try {
        setIsLoadingHistory(true);
        const history = await getChatHistory(playthroughId, token);
        
        // NPC별로 채팅 기록 필터링
        let filteredHistory = history;
        if (currentInteraction?.npcId) {
          filteredHistory = history.filter(message => 
            message.npcId === currentInteraction.npcId
          );
        }
        
        setMessages(filteredHistory);
      } catch (error) {
        console.error('채팅 기록 불러오기 실패:', error);
        // 기록 불러오기 실패 시 빈 배열로 초기화
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [playthroughId, token, currentInteraction?.npcId]); // currentInteraction.npcId 의존성 추가

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 상호작용 객체가 변경될 때 자동으로 상호작용 메시지 추가
  useEffect(() => {
    if (currentInteraction) {
      // NPC의 경우 자동 인사 메시지를 생성하지 않음
      if (currentInteraction.type === 'npc') {
        return;
      }
      
      const handleInteraction = async () => {
        // 객체 타입에 따른 자동 상호작용 메시지 생성
        let interactionMessage = '';
        
        switch (currentInteraction.type) {
          case 'book':
            interactionMessage = `${currentInteraction.name}을 읽어보겠습니다.`;
            break;
          case 'notepad':
            interactionMessage = `${currentInteraction.name}을 살펴보겠습니다.`;
            break;
          case 'clue':
            interactionMessage = `${currentInteraction.name}을 조사하겠습니다.`;
            break;
          case 'evidence':
            interactionMessage = `${currentInteraction.name}을 조사하겠습니다.`;
            break;
          case 'item':
            interactionMessage = `${currentInteraction.name}을 확인하겠습니다.`;
            break;
          default:
            interactionMessage = `${currentInteraction.name}과 상호작용하겠습니다.`;
        }
        
        const userMessage = {
          id: Date.now(),
          messageText: interactionMessage,
          isUserMessage: true,
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
          // 실제 백엔드 API를 사용하여 LLM 응답 받기
          const npcMessage = await sendChatMessage(playthroughId, interactionMessage, token, currentInteraction.npcId);
          setMessages(prev => [...prev, npcMessage]);
          
        } catch (error) {
          console.error('상호작용 중 에러:', error);
          const errorMessage = {
            id: Date.now() + 1,
            messageText: '상호작용 중 오류가 발생했습니다.',
            isUserMessage: false,
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      handleInteraction();
    }
  }, [currentInteraction, playthroughId, token]);

  // ESC 키로 채팅박스 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggleHighlight = async (chatId) => {
    try {
      // 현재 메시지의 하이라이트 상태 찾기
      const currentMessage = messages.find(msg => msg.id === chatId);
      if (!currentMessage) return;
      
      const newHighlightState = !currentMessage.isHighlighted;
      
      // API 호출로 서버 업데이트
      await toggleChatHighlight(chatId, newHighlightState, token);
      
      // 성공 시 로컬 상태 업데이트
      setMessages(prev => prev.map(msg => 
        msg.id === chatId 
          ? { ...msg, isHighlighted: newHighlightState }
          : msg
      ));
      
    } catch (error) {
      console.error('하이라이트 토글 실패:', error);
      alert('하이라이트 토글에 실패했습니다.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    // 행동력이 0일 때 메시지 전송 차단
    if (currentActCount <= 0) {
      alert('행동력이 부족합니다. 더 이상 대화할 수 없습니다.');
      return;
    }

    setInput('');
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      messageText: currentInput,
      isUserMessage: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const npcMessage = await sendChatMessage(playthroughId, currentInput, token, currentInteraction?.npcId);
      setMessages(prev => [...prev, npcMessage]);
      
      // 메시지 전송 성공 시 행동력 감소
      console.log('ChatBox: 메시지 전송 성공, onActCountDecrease 호출 시작');
      if (onActCountDecrease) {
        onActCountDecrease();
        console.log('ChatBox: onActCountDecrease 호출 완료');
      } else {
        console.error('ChatBox: onActCountDecrease 함수가 전달되지 않음');
      }

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
    <ChatBoxContainer onClick={(e) => e.stopPropagation()}>
      <CharacterArea>
        {localInteraction?.npcImageUrl ? (
          <CharacterImage 
            src={localInteraction.npcImageUrl} 
            alt={localInteraction?.name}
            onError={(e) => {
              console.error('캐릭터 이미지 로드 실패:', localInteraction.npcImageUrl);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <DefaultCharacterIcon>
            {localInteraction?.icon || '👤'}
          </DefaultCharacterIcon>
        )}
        <CharacterInfo>
          <CharacterName>{localInteraction?.name || 'NPC'}</CharacterName>
        </CharacterInfo>
      </CharacterArea>
      
      <ChatAreaContainer>
        <ChatBoxHeader>
          <InteractionInfo>
            <span>{localInteraction?.icon}</span>
            <span>{localInteraction?.name || '대화'}</span>
          </InteractionInfo>
          <CloseButton onClick={onClose}>
            ✕
          </CloseButton>
        </ChatBoxHeader>
        
        <MessagesArea>
          {isLoadingHistory ? (
            <LoadingIndicator>
              <MessageLabel>채팅 기록을 불러오는 중...</MessageLabel>
              <LoadingDots>
                <span></span>
                <span></span>
                <span></span>
              </LoadingDots>
            </LoadingIndicator>
          ) : (
            messages.map((msg) => (
              <MessageContainer 
                key={msg.id} 
                $isUser={msg.isUserMessage} 
              >
                <MessageHeader $isUser={msg.isUserMessage}>
                  <MessageLabel>
                    {msg.isUserMessage ? '나' : (localInteraction?.name || 'NPC')}
                  </MessageLabel>
                  {!msg.isUserMessage && ( // NPC 메시지에만 하이라이트 버튼 표시
                    <HighlightButton 
                      $isHighlighted={msg.isHighlighted} 
                      onClick={() => toggleHighlight(msg.id)}
                      $show={true}
                      title={msg.isHighlighted ? '하이라이트 해제' : '하이라이트 설정'}
                    >
                      ✏️
                    </HighlightButton>
                  )}
                </MessageHeader>
                <Message $isUser={msg.isUserMessage} $isHighlighted={msg.isHighlighted}>
                  {msg.messageText}
                </Message>
              </MessageContainer>
            ))
          )}
          {isLoading && (
            <LoadingIndicator>
              <MessageLabel>{localInteraction?.name || 'NPC'}가 입력중...</MessageLabel>
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
            disabled={isLoading || currentActCount <= 0}
            placeholder={currentActCount <= 0 ? "행동력이 부족합니다..." : "메시지를 입력하세요..."}
          />
          <SendButton type="submit" disabled={isLoading || !input.trim() || currentActCount <= 0}>
            전송
          </SendButton>
          <QuestionCostText>질문 횟수 -1</QuestionCostText>
        </InputArea>
      </ChatAreaContainer>
    </ChatBoxContainer>
  );
};

export default ChatBox;