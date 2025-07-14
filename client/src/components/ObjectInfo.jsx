import React, { useState } from 'react';
import styled from 'styled-components';

// 객체 정보 전체 컨테이너
const ObjectInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 70%;
  width: 70%;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.95);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

// 헤더
const ObjectInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(52, 73, 94, 0.9);
  border-bottom: 2px solid #34495e;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

// 객체 정보 타이틀
const ObjectTitle = styled.div`
  color: white;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

// 닫기 버튼
const CloseButton = styled.button`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #c0392b, #a93226);
    transform: translateY(-2px);
  }
`;

// 메인 콘텐츠 영역
const ObjectInfoContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  color: white;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// 객체 이미지
const ObjectImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

// 객체 설명 텍스트
const ObjectDescription = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #e8e8e8;
  margin-bottom: 20px;
  white-space: pre-wrap;
`;

// 객체 상세 정보
const ObjectDetails = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

// 상세 정보 항목
const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #bdc3c7;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: white;
  font-weight: 600;
`;

// 하단 액션 버튼들
const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(52, 73, 94, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
  background: ${props => {
    switch(props.$type) {
      case 'primary': return 'linear-gradient(135deg, #3498db, #2980b9)';
      case 'success': return 'linear-gradient(135deg, #27ae60, #229954)';
      case 'warning': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      default: return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    }
  }};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: rgba(149, 165, 166, 0.5);
    cursor: not-allowed;
    transform: none;
  }
`;

// 알림 메시지
const NotificationMessage = styled.div`
  background: ${props => props.$type === 'success' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  color: ${props => props.$type === 'success' ? '#2ecc71' : '#e74c3c'};
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
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