import React from 'react';
import styled from 'styled-components';

// 모달 배경 오버레이
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 모달 컨테이너 (셜록 홈즈 스타일)
const ModalContainer = styled.div`
  background: linear-gradient(135deg, #f8f4e6 0%, #f0e6d2 100%);
  border: 4px solid #8b4513;
  border-radius: 12px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  padding: 40px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  font-family: 'Crimson Text', serif;
  position: relative;
  animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  
  @keyframes modalSlideIn {
    from { 
      transform: translateY(-20px) scale(0.95);
      opacity: 0;
    }
    to { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    border: 2px solid rgba(139, 69, 19, 0.2);
    border-radius: 8px;
    pointer-events: none;
  }
`;

// 모달 헤더 (아이콘과 제목)
const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const InvestigationIcon = styled.div`
  font-size: 3rem;
  color: #8b4513;
  margin-bottom: 16px;
  opacity: 0.9;
`;

const ModalTitle = styled.h2`
  color: #2c1810;
  font-size: 1.6rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
`;

// 메시지 영역
const MessageContainer = styled.div`
  text-align: center;
  margin-bottom: 35px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const QuestionCountText = styled.div`
  color: #b8860b;
  font-size: 1.3rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
`;

const ConfirmText = styled.div`
  color: #2c1810;
  font-size: 1.1rem;
  font-family: 'Crimson Text', serif;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const WarningText = styled.div`
  color: #8b4513;
  font-size: 0.95rem;
  font-family: 'Crimson Text', serif;
  font-style: italic;
  opacity: 0.8;
`;

// 버튼 영역
const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
  flex-shrink: 0;
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #daa520 0%, #b8860b 100%);
  color: #1c1c1c;
  border: 2px solid #8b4513;
  border-radius: 6px;
  padding: 12px 28px;
  font-size: 1.1rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const CancelButton = styled.button`
  background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
  color: #f4e8d0;
  border: 2px solid #5d2d0c;
  border-radius: 6px;
  padding: 12px 28px;
  font-size: 1.1rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

const InvestigationConfirmModal = ({ 
  isOpen,
  objectName,
  requiredQuestions,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  // 배경 클릭 시 취소
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <InvestigationIcon>🔍</InvestigationIcon>
          <ModalTitle>조사 시작 확인</ModalTitle>
        </ModalHeader>
        
        <MessageContainer>
          <QuestionCountText>
            해당 조사는 NPC와 {requiredQuestions}번의 질의응답 진행 후 확인 가능합니다.
          </QuestionCountText>
          <ConfirmText>
            "{objectName}"에 대한 조사를 시작하시겠습니까?
          </ConfirmText>
          <WarningText>
            조사 시작 후에는 다른 단서를 동시에 조사할 수 없습니다.
          </WarningText>
        </MessageContainer>
        
        <ButtonContainer>
          <ConfirmButton onClick={onConfirm}>
            예
          </ConfirmButton>
          <CancelButton onClick={onCancel}>
            아니오
          </CancelButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default InvestigationConfirmModal; 