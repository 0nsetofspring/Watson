import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InvestigationConfirmModal from './InvestigationConfirmModal';

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
  font-size: 1.8rem;
  font-family: 'Crimson Text', serif;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const RequiredQuestionsText = styled.div`
  color: #b8860b;
  font-size: 1.4rem;
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
  font-size: 1.3rem;
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
  color: #FFFFFF;
  font-size: 1.7rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const ObjectInfo = ({ 
  objectData, 
  onClose, 
  onItemAcquired, 
  onClueAdded, 
  currentActCount, 
  playthroughId,
  onStartInvestigation,
  onCompleteInvestigation,
  canCompleteInvestigation,
  canAccessDetail
}) => {
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localInvestigationState, setLocalInvestigationState] = useState({
    hasStarted: false,
    isCompleted: false,
    isInProgress: false
  });

  // objectData가 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    if (objectData) {
      const hasStartedInvestigation = objectData?.isInInspectation || false;
      const remainingQuestions = objectData?.remainingQuestions;
      const requiredQuestions = objectData?.requiredQuestions || 3;
      
      // 조사가 완료되었는지 확인 (더 이상 조사 중이 아니면서 한 번이라도 조사된 경우)
      const isCompleted = !hasStartedInvestigation && remainingQuestions !== null && remainingQuestions !== requiredQuestions;
      
      // 조사가 한 번이라도 시작되었는지 확인 (조사 중이거나 완료되었거나 remainingQuestions가 초기값과 다른 경우)
      const hasEverStarted = hasStartedInvestigation || isCompleted || 
                           (remainingQuestions !== null && remainingQuestions !== requiredQuestions);

      setLocalInvestigationState({
        hasStarted: hasEverStarted,
        isCompleted: isCompleted,
        isInProgress: hasStartedInvestigation
      });
    }
  }, [objectData]);

  if (!objectData) return null;

  // '자세히 조사' 버튼 클릭 핸들러
  const handleInspect = async () => {
    // 조사 완료 가능한 경우 완료 처리
    if (canCompleteInvestigation) {
      const success = await onCompleteInvestigation();
      if (success) {
        setShowDetailPanel(true);
        // 로컬 상태 즉시 업데이트
        setLocalInvestigationState(prev => ({
          ...prev,
          isCompleted: true,
          isInProgress: false
        }));
      }
      return;
    }

    // 상세 정보 접근 가능한 경우 바로 패널 열기
    if (canAccessDetail) {
      setShowDetailPanel(true);
      return;
    }

    // 이미 조사가 시작된 경우 바로 패널 열기
    if (localInvestigationState.hasStarted) {
      setShowDetailPanel(true);
      return;
    }

    // 새로운 조사 시작 전 확인 모달 표시
    setShowConfirmModal(true);
  };

  // 조사 시작 확인 처리
  const handleConfirmInvestigation = async () => {
    setShowConfirmModal(false);
    
    // 조사 시작 시도
    if (onStartInvestigation) {
      const success = await onStartInvestigation();
      if (success) {
        setShowDetailPanel(true);
        // 로컬 상태 즉시 업데이트
        setLocalInvestigationState(prev => ({
          ...prev,
          hasStarted: true,
          isInProgress: true
        }));
      }
      // 실패 시 알림은 GamePage에서 처리되므로 여기서는 아무것도 하지 않음
    }
  };

  // 조사 시작 취소 처리
  const handleCancelInvestigation = () => {
    setShowConfirmModal(false);
  };

  // 상세 패널 닫기
  const handleCloseDetail = () => {
    setShowDetailPanel(false);
  };

  // 조사 완료 처리 (GamePage에 위임)
  const handleCompleteInvestigation = async () => {
    const success = await onCompleteInvestigation();
    if (success) {
      // 로컬 상태 즉시 업데이트
      setLocalInvestigationState(prev => ({
        ...prev,
        isCompleted: true,
        isInProgress: false
      }));
    }
  };

  // 렌더링할 상세 내용 가져오기
  const getDetailContent = () => {
    return objectData.data || '상세 정보가 없습니다.';
  };

  // 조사 상태 정보 (서버 기반 remainingQuestions 사용)
  const requiredQuestions = objectData?.requiredQuestions || 3;
  const remainingQuestions = objectData?.remainingQuestions;
  
  // 조사가 완료되었는지 확인 (더 이상 조사 중이 아니면서 한 번이라도 조사된 경우)
  const isCompleted = !objectData?.isInInspectation && remainingQuestions !== null && remainingQuestions !== requiredQuestions;
  
  // 조사가 진행 중인지 확인 (현재 조사 중인 상태)
  const hasStartedInvestigation = objectData?.isInInspectation || false;
  
  // 조사가 한 번이라도 시작되었는지 확인 (조사 중이거나 완료되었거나 remainingQuestions가 초기값과 다른 경우)
  const hasEverStarted = hasStartedInvestigation || isCompleted || 
                        (remainingQuestions !== null && remainingQuestions !== requiredQuestions);

  // 조사 진행도 계산 (서버 기반)
  const currentProgress = remainingQuestions !== null ? requiredQuestions - remainingQuestions : 0;
  
  // 조사 완료 여부 확인 (remainingQuestions가 0 이하이거나 null인 경우)
  const isInvestigationComplete = remainingQuestions !== null && remainingQuestions <= 0;

  // 디버깅을 위한 로그
  console.log(`🔍 ObjectInfo 상태 - ${objectData?.name}:`, {
    objectData: {
      requiredQuestions: objectData?.requiredQuestions,
      remainingQuestions: objectData?.remainingQuestions,
      isInInspectation: objectData?.isInInspectation
    },
    hasStartedInvestigation,
    hasEverStarted,
    isCompleted,
    canCompleteInvestigation,
    canAccessDetail,
    currentProgress,
    requiredQuestions,
    localInvestigationState,
    '진행상황': `${currentProgress}/${requiredQuestions}`,
    '조건체크': {
      '완료됨': isCompleted,
      '진행도충족': currentProgress >= requiredQuestions,
      '조사중': hasStartedInvestigation,
      '한번이라도시작': hasEverStarted
    }
  });

  // 버튼 텍스트 결정 (로컬 상태와 서버 상태 모두 고려)
  const getInspectButtonText = () => {
    // 로컬 상태가 우선 (즉시 반영을 위해)
    if (localInvestigationState.isCompleted) {
      return "상세 정보 보기";
    } else if (canCompleteInvestigation || isInvestigationComplete) {
      return "조사 완료하기";
    } else if (canAccessDetail) {
      return "상세 정보 보기";
    } else if (localInvestigationState.isInProgress || hasStartedInvestigation) {
      return "조사 진행 상황 보기";
    } else {
      return "조사 시작하기";
    }
  };

  return (
    <>
      <SimpleContainer $bgimage={objectData.imageUrl} $shifted={showDetailPanel}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <InfoBox>
          <DescriptionText>
            {objectData.description || '이 객체에 대한 설명이 없습니다.'}
          </DescriptionText>
          <InspectButton onClick={handleInspect}>{getInspectButtonText()}</InspectButton>
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
          // 조사 중 또는 조사 시작 전 상태 표시
          <>
            <InvestigationIcon>🔍</InvestigationIcon>
            <InvestigationText>
              {hasStartedInvestigation 
                ? `"${objectData.name}" 조사 중입니다.`
                : `"${objectData.name}" 조사 준비`
              }
            </InvestigationText>
            <RequiredQuestionsText>
              {requiredQuestions}번의 질의응답 후 확인 가능합니다.
            </RequiredQuestionsText>
            {hasStartedInvestigation ? (
              <>
                <RequiredQuestionsText>
                  (이 단서 진행: {currentProgress}/{requiredQuestions})
                </RequiredQuestionsText>
                {(canCompleteInvestigation || isInvestigationComplete) && (
                  <InspectButton onClick={handleCompleteInvestigation}>
                    조사 완료하기
                  </InspectButton>
                )}
              </>
            ) : hasEverStarted ? (
              <RequiredQuestionsText>
                조사가 완료되었습니다.
              </RequiredQuestionsText>
            ) : (
              <RequiredQuestionsText>
                조사를 시작하면 질문 진행도가 추적됩니다.
              </RequiredQuestionsText>
            )}
            <CloseDetailButton onClick={handleCloseDetail}>
              돌아가기
            </CloseDetailButton>
          </>
        )}
      </DetailPanel>

      {/* 조사 시작 확인 모달 */}
      <InvestigationConfirmModal
        isOpen={showConfirmModal}
        objectName={objectData.name}
        requiredQuestions={requiredQuestions}
        onConfirm={handleConfirmInvestigation}
        onCancel={handleCancelInvestigation}
      />
    </>
  );
};

export default ObjectInfo; 