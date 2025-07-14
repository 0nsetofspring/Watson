import React, { useState } from 'react';
import styled from 'styled-components';

// 객체 정보 전체 컨테이너
const ObjectInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 85%;
  width: 85%;
  max-width: 800px;
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

// 헤더
const ObjectInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
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

// 객체 정보 타이틀
const ObjectTitle = styled.div`
  color: #daa520;
  font-size: 20px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  display: flex;
  align-items: center;
  gap: 15px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  
  &::before,
  &::after {
    content: '◆';
    color: #b8860b;
    font-size: 0.7em;
    margin: 0 5px;
    opacity: 0.7;
  }
`;

// 닫기 버튼
const CloseButton = styled.button`
  background: linear-gradient(135deg, #cd853f, #a0522d);
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Cinzel', serif;
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

// 메인 콘텐츠 영역
const ObjectInfoContent = styled.div`
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  background: 
    radial-gradient(circle at 20% 20%, rgba(218, 165, 32, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
    #f4e8d0;
  color: #2c1810;
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

// 객체 이미지
const ObjectImage = styled.img`
  width: 100%;
  max-width: 250px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 3px solid #8b4513;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

// 객체 설명 텍스트
const ObjectDescription = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #2c1810;
  font-family: 'Crimson Text', serif;
  margin-bottom: 25px;
  white-space: pre-wrap;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 6px;
  border: 1px solid rgba(139, 69, 19, 0.3);
  position: relative;
  z-index: 1;
`;

// 객체 상세 정보
const ObjectDetails = styled.div`
  background: linear-gradient(135deg, #e6d3b0 0%, #d4c2a0 100%);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  
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
`;

// 상세 정보 항목
const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 15px;
  position: relative;
  z-index: 1;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #8b4513;
  font-weight: 600;
  font-family: 'Cinzel', serif;
`;

const DetailValue = styled.span`
  color: #2c1810;
  font-weight: 600;
  font-family: 'Crimson Text', serif;
`;

// 하단 액션 버튼들
const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  padding: 20px 25px;
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  border-top: 3px solid #daa520;
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

const ActionButton = styled.button`
  background: ${props => {
    switch(props.$type) {
      case 'primary': return 'linear-gradient(135deg, #3498db, #2980b9)';
      case 'success': return 'linear-gradient(135deg, #27ae60, #229954)';
      case 'warning': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      default: return 'linear-gradient(135deg, #8b4513, #654321)';
    }
  }};
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  transition: all 0.3s ease;
  flex: 1;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
  
  &:hover {
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
  
  &:disabled {
    background: linear-gradient(135deg, #7f8c8d, #95a5a6);
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// 알림 메시지
const NotificationMessage = styled.div`
  background: ${props => props.$type === 'success' 
    ? 'linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(46, 204, 113, 0.1))' 
    : 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.1))'};
  color: ${props => props.$type === 'success' ? '#27ae60' : '#c0392b'};
  border: 2px solid ${props => props.$type === 'success' ? '#27ae60' : '#c0392b'};
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  
  &::before {
    content: ${props => props.$type === 'success' ? "'✓'" : "'⚠'"};
    font-size: 18px;
    margin-right: 8px;
  }
`;

const ObjectInfo = ({ objectData, onClose, onItemAcquired, onClueAdded }) => {
  const [notification, setNotification] = useState(null);
  
  // 알림 메시지 표시
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // 아이템 획득 처리
  const handleAcquireItem = () => {
    if (objectData.type === 'item') {
      showNotification('아이템을 획득했습니다!', 'success');
      setTimeout(() => {
        onItemAcquired && onItemAcquired(objectData);
        onClose();
      }, 1500);
    }
  };
  
  // 단서 추가 처리
  const handleAddClue = () => {
    if (objectData.type === 'clue' || objectData.type === 'evidence') {
      showNotification('단서장에 추가되었습니다!', 'success');
      setTimeout(() => {
        onClueAdded && onClueAdded(objectData);
        onClose();
      }, 1500);
    }
  };
  
  // 객체 조사 처리
  const handleInvestigate = () => {
    showNotification('자세히 조사했습니다.', 'success');
  };
  
  // 객체 타입에 따른 아이콘 결정
  const getObjectIcon = (type) => {
    switch(type) {
      case 'item': return '🎒';
      case 'clue': return '🔍';
      case 'evidence': return '📋';
      case 'book': return '📚';
      case 'notepad': return '📝';
      case 'door': return '🚪';
      default: return '❓';
    }
  };
  
  // 객체 타입에 따른 한국어 이름
  const getObjectTypeName = (type) => {
    switch(type) {
      case 'item': return '아이템';
      case 'clue': return '단서';
      case 'evidence': return '증거';
      case 'book': return '책';
      case 'notepad': return '메모장';
      case 'door': return '문';
      default: return '객체';
    }
  };
  
  if (!objectData) return null;
  
  return (
    <ObjectInfoContainer>
      {/* 헤더 */}
      <ObjectInfoHeader>
        <ObjectTitle>
          <span>{getObjectIcon(objectData.type)}</span>
          {objectData.name}
        </ObjectTitle>
        <CloseButton onClick={onClose}>✕ 닫기</CloseButton>
      </ObjectInfoHeader>
      
      {/* 메인 콘텐츠 */}
      <ObjectInfoContent>
        {/* 알림 메시지 */}
        {notification && (
          <NotificationMessage $type={notification.type}>
            {notification.message}
          </NotificationMessage>
        )}
        
        {/* 객체 이미지 */}
        {objectData.imageUrl && (
          <ObjectImage src={objectData.imageUrl} alt={objectData.name} />
        )}
        
        {/* 객체 설명 */}
        <ObjectDescription>
          {objectData.description || '이 객체에 대한 설명이 없습니다.'}
        </ObjectDescription>
        
        {/* 상세 정보 */}
        <ObjectDetails>
          <DetailItem>
            <DetailLabel>종류:</DetailLabel>
            <DetailValue>{getObjectTypeName(objectData.type)}</DetailValue>
          </DetailItem>
          
          {objectData.type === 'item' && (
            <DetailItem>
              <DetailLabel>상태:</DetailLabel>
              <DetailValue>획득 가능</DetailValue>
            </DetailItem>
          )}
          
          {(objectData.type === 'clue' || objectData.type === 'evidence') && (
            <DetailItem>
              <DetailLabel>중요도:</DetailLabel>
              <DetailValue>높음</DetailValue>
            </DetailItem>
          )}
          
          {objectData.location && (
            <DetailItem>
              <DetailLabel>위치:</DetailLabel>
              <DetailValue>{objectData.location}</DetailValue>
            </DetailItem>
          )}
        </ObjectDetails>
      </ObjectInfoContent>
      
      {/* 하단 액션 버튼들 */}
      <ActionButtons>
        {objectData.type === 'item' && (
          <ActionButton $type="success" onClick={handleAcquireItem}>
            🎒 아이템 획득
          </ActionButton>
        )}
        
        {(objectData.type === 'clue' || objectData.type === 'evidence') && (
          <ActionButton $type="primary" onClick={handleAddClue}>
            📋 단서장에 추가
          </ActionButton>
        )}
        
        {(objectData.type === 'book' || objectData.type === 'notepad') && (
          <ActionButton $type="warning" onClick={handleInvestigate}>
            🔍 자세히 조사
          </ActionButton>
        )}
        
        <ActionButton onClick={onClose}>
          ✕ 닫기
        </ActionButton>
      </ActionButtons>
    </ObjectInfoContainer>
  );
};

export default ObjectInfo; 