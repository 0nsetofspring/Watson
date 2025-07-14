import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 조사 완료 알림 (상단 우측)
const InvestigationCompleteAlert = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 14px;
  z-index: 9999;
  animation: slideInRight 0.5s ease-out;
  max-width: 300px;
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 경고 알림 (상단 우측)
const WarningAlert = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 14px;
  z-index: 9999;
  animation: slideInRight 0.5s ease-out;
  max-width: 300px;
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 전체 컨테이너 (최소한의 배경)
const SimpleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85vw;
  max-width: 800px;
  height: 85vh;
  max-height: 700px;
  background: ${({ $bgimage }) => $bgimage ? `url(${$bgimage}) center/cover no-repeat` : 'rgba(255,255,255,0.92)'};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 0;
  overflow: hidden;
  transition: transform 0.4s ease;
  transform: translate(-50%, -50%) ${({ $shifted }) => $shifted ? 'translateX(-120px)' : 'translateX(0)'};
`;

// 상세 조사 패널 (오른쪽에서 슬라이드)
const DetailPanel = styled.div`
  position: absolute;
  top: 0;
  right: ${({ $show }) => $show ? '0' : '-100%'};
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f4e6 0%, #f0e6d2 100%);
  border: 3px solid #8b4513;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  transition: right 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  z-index: 10;
`;

// 설명+버튼을 감싸는 박스 (ChatBox/Modal 스타일 참고)
const InfoBox = styled.div`
  width: 90%;
  max-width: 520px;
  margin-bottom: 48px;
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  border: 3px solid #8b4513;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 28px 24px 28px;
  gap: 18px;
  font-family: 'Crimson Text', serif;
  position: relative;
  z-index: 2;
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 1px solid rgba(139, 69, 19, 0.18);
    border-radius: 4px;
    pointer-events: none;
    z-index: 1;
  }
`;

const DescriptionText = styled.div`
  width: 100%;
  color: #2c1810;
  font-size: 1.1rem;
  font-family: 'Crimson Text', serif;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 0;
  text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  z-index: 2;
`;

const InspectButton = styled.button`
  background: linear-gradient(135deg, #daa520, #b8860b);
  color: #1c1c1c;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  display: block;
  z-index: 2;
  text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  &:hover {
    background: linear-gradient(135deg, #b8860b, #daa520);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1);
  }
`;

// 상세 조사 패널 내 요소들
const InvestigationIcon = styled.div`
  font-size: 4rem;
  color: #8b4513;
  margin-bottom: 24px;
  opacity: 0.8;
`;

const InvestigationText = styled.div`
  color: #2c1810;
  font-size: 1.2rem;
  font-family: 'Crimson Text', serif;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const RequiredQuestionsText = styled.div`
  color: #b8860b;
  font-size: 1rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
`;

const DetailContent = styled.div`
  width: 90%;
  max-width: 600px;
  color: #2c1810;
  font-size: 1.1rem;
  font-family: 'Crimson Text', serif;
  line-height: 1.6;
  white-space: pre-wrap;
  text-align: left;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.2);
`;

const CloseDetailButton = styled.button`
  background: linear-gradient(135deg, #cd853f, #a0522d);
  color: #f4e8d0;
  border: 2px solid #8b4513;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.18);
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #a0522d, #cd853f);
    transform: translateY(-1px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 24px;
  background: none;
  border: none;
  color: #333;
  font-size: 1.7rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const ObjectInfo = ({ objectData, onClose, onItemAcquired, onClueAdded, currentActCount }) => {
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isInvestigationComplete, setIsInvestigationComplete] = useState(false);
  const [requiredQuestions, setRequiredQuestions] = useState(3);
  const [investigationStartCount, setInvestigationStartCount] = useState(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (objectData) {
      // data 컬럼에서 필요한 질문 수 파싱
      try {
        const data = JSON.parse(objectData.data || '{}');
        const required = data.requiredQuestions || 3;
        setRequiredQuestions(required);
        
        // 조사 상태 확인
        const investigationKey = `investigation_${objectData.id}`;
        const storedData = JSON.parse(localStorage.getItem(investigationKey) || '{}');
        setIsInvestigationComplete(storedData.isComplete || false);
        setInvestigationStartCount(storedData.startCount);
      } catch (error) {
        console.error('objectData.data 파싱 에러:', error);
        setRequiredQuestions(3);
      }
    }
  }, [objectData]);

  // currentActCount 변경 시 조사 진행도 실시간 업데이트
  useEffect(() => {
    if (investigationStartCount !== null && !isInvestigationComplete) {
      const currentProgress = investigationStartCount - currentActCount;
      
      // 필요한 질문 수에 도달했는지 체크
      if (currentProgress >= requiredQuestions) {
        // 자동으로 조사 완료 처리는 하지 않고, 사용자가 버튼을 클릭하도록 유지
        // 하지만 진행도는 실시간으로 업데이트됨
      }
    }
  }, [currentActCount, investigationStartCount, requiredQuestions, isInvestigationComplete]);

  // 완료 알림 자동 숨김
  useEffect(() => {
    if (showCompletionAlert) {
      const timer = setTimeout(() => {
        setShowCompletionAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionAlert]);

  // 경고 알림 자동 숨김
  useEffect(() => {
    if (showWarningAlert) {
      const timer = setTimeout(() => {
        setShowWarningAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWarningAlert]);

  if (!objectData) return null;

  // 현재 진행 중인 다른 조사가 있는지 확인
  const checkActiveInvestigation = () => {
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith('investigation_') && key !== `investigation_${objectData.id}`) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.startCount !== undefined && !data.isComplete) {
            const investigationId = key.replace('investigation_', '');
            return investigationId;
          }
        } catch (error) {
          continue;
        }
      }
    }
    return null;
  };

  // '자세히 조사' 버튼 클릭 핸들러
  const handleInspect = () => {
    // 이미 완료된 조사는 바로 패널 열기
    if (isInvestigationComplete) {
      setShowDetailPanel(true);
      return;
    }

    // 다른 진행 중인 조사가 있는지 확인
    const activeInvestigationId = checkActiveInvestigation();
    if (activeInvestigationId) {
      setWarningMessage('한 번에 하나의 단서만 조사할 수 있습니다. 진행 중인 조사를 완료해주세요.');
      setShowWarningAlert(true);
      return;
    }

    // 새로운 조사 시작
    const investigationKey = `investigation_${objectData.id}`;
    const newInvestigationData = {
      startCount: currentActCount,
      isComplete: false,
      objectName: objectData.name
    };
    localStorage.setItem(investigationKey, JSON.stringify(newInvestigationData));
    setInvestigationStartCount(currentActCount);
    setShowDetailPanel(true);
  };

  // 상세 패널 닫기
  const handleCloseDetail = () => {
    setShowDetailPanel(false);
  };

  // 조사 완료 처리
  const handleCompleteInvestigation = () => {
    const investigationKey = `investigation_${objectData.id}`;
    const updatedData = {
      startCount: investigationStartCount,
      isComplete: true,
      objectName: objectData.name
    };
    localStorage.setItem(investigationKey, JSON.stringify(updatedData));
    setIsInvestigationComplete(true);
    setShowCompletionAlert(true);
  };

  // 현재 객체의 개별 진행 상황 계산
  const getIndividualProgress = () => {
    if (investigationStartCount === null) return 0;
    return investigationStartCount - currentActCount;
  };

  const individualProgress = getIndividualProgress();
  const canAccessDetail = individualProgress >= requiredQuestions || isInvestigationComplete;

  // 렌더링할 상세 내용 가져오기
  const getDetailContent = () => {
    try {
      const data = JSON.parse(objectData.data || '{}');
      return data.content || data.description || '상세 정보가 없습니다.';
    } catch (error) {
      return objectData.data || '상세 정보가 없습니다.';
    }
  };

  return (
    <>
      {/* 조사 완료 알림 */}
      {showCompletionAlert && (
        <InvestigationCompleteAlert>
          🔍 "{objectData.name}" 조사 완료!<br/>
          상세 정보를 확인할 수 있습니다.
        </InvestigationCompleteAlert>
      )}

      {/* 경고 알림 */}
      {showWarningAlert && (
        <WarningAlert>
          ⚠️ {warningMessage}
        </WarningAlert>
      )}

      <SimpleContainer $bgimage={objectData.imageUrl} $shifted={showDetailPanel}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <InfoBox>
          <DescriptionText>
            {objectData.description || '이 객체에 대한 설명이 없습니다.'}
          </DescriptionText>
          <InspectButton onClick={handleInspect}>조사 시작하기</InspectButton>
        </InfoBox>
      </SimpleContainer>

      <DetailPanel $show={showDetailPanel}>
        {canAccessDetail ? (
          // 조사 완료 시 상세 내용 표시
          <>
            <InvestigationIcon>🔍</InvestigationIcon>
            <InvestigationText>조사 완료!</InvestigationText>
            <DetailContent>
              {getDetailContent()}
            </DetailContent>
            <CloseDetailButton onClick={handleCloseDetail}>
              돌아가기
            </CloseDetailButton>
          </>
        ) : (
          // 조사 중 상태 표시
          <>
            <InvestigationIcon>🔍</InvestigationIcon>
            <InvestigationText>
              "{objectData.name}" 조사 중입니다.
            </InvestigationText>
            <RequiredQuestionsText>
              {requiredQuestions}번의 질의응답 후 확인 가능합니다.
            </RequiredQuestionsText>
            <RequiredQuestionsText>
              (이 단서 진행: {individualProgress}/{requiredQuestions})
            </RequiredQuestionsText>
            {individualProgress >= requiredQuestions && !isInvestigationComplete && (
              <InspectButton onClick={handleCompleteInvestigation}>
                조사 완료하기
              </InspectButton>
            )}
            <CloseDetailButton onClick={handleCloseDetail}>
              돌아가기
            </CloseDetailButton>
          </>
        )}
      </DetailPanel>
    </>
  );
};

export default ObjectInfo; 