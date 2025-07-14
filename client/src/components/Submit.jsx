import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { concludePlaythroughApi } from '../api/game';

// --- 애니메이션 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- 스타일 컴포넌트 ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 25, 40, 0.85); /* 어둡고 푸른 톤의 배경 */
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ReportContainer = styled.div`
  background: #f0f4f8; /* 밝은 회색 배경 */
  color: #333;
  border: 1px solid #a9b4c0;
  border-radius: 4px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;

const ReportHeader = styled.div`
  background: #34495e; /* 남색 계열 헤더 */
  color: #ecf0f1;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #f39c12; /* 포인트 컬러 */
`;

const ReportTitle = styled.h2`
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: transparent;
  color: #ecf0f1;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.2); }
`;

const ReportContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
`;

const FieldSet = styled.fieldset`
  border: 1px solid #c8d0d8;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 25px;
`;

const Legend = styled.legend`
  padding: 0 10px;
  font-weight: bold;
  color: #2c3e50;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #a9b4c0;
  border-radius: 4px;
  background: #fff;
  font-size: 16px;
  &:focus { outline: 2px solid #f39c12; }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 250px;
  padding: 12px;
  border: 1px solid #a9b4c0;
  border-radius: 4px;
  background: #fff;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  &:focus { outline: 2px solid #f39c12; }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  background: #f39c12;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background-color: #e67e22; }
  &:disabled { background-color: #95a5a6; cursor: not-allowed; }
`;

const ResultContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  h3 {
    font-family: 'Georgia', serif;
    color: ${props => (props.$isCorrect ? '#27ae60' : '#c0392b')};
    border-bottom: 2px solid ${props => (props.$isCorrect ? '#27ae60' : '#c0392b')};
    padding-bottom: 10px;
  }
  p { white-space: pre-wrap; line-height: 1.7; }
`;

const ErrorText = styled.p`
  color: #c0392b;
  text-align: center;
  font-weight: bold;
`;


const Submit = ({ playthroughId, gameData, onClose, onSubmissionComplete }) => {
  const { token } = useAuth();
  const [culpritName, setCulpritName] = useState('');
  const [reasoningText, setReasoningText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const npcs = useMemo(() => {
    if (!gameData?.scenario?.rooms) return [];
    return gameData.scenario.rooms.flatMap(room => room.npcs);
  }, [gameData]);

  useEffect(() => {
    if (npcs.length > 0) {
      setCulpritName(npcs[0].name);
    }
  }, [npcs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!culpritName || !reasoningText) {
      setError('범인 지목과 추리 내용은 필수 항목입니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reportData = await concludePlaythroughApi(playthroughId, culpritName, reasoningText, token);
      setResult(reportData);
      onSubmissionComplete(reportData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      window.location.href = "/";
    } else {
      onClose();
    }
  };

  return (
    <ModalOverlay>
      <ReportContainer>
        <ReportHeader>
          <ReportTitle>{result ? '사건 종결 보고서' : '최종 추리 보고서'}</ReportTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ReportHeader>
        <ReportContent>
          {!result ? (
            <form onSubmit={handleSubmit}>
              <FieldSet>
                <Legend>범인 지목</Legend>
                <Label htmlFor="culprit-select">아래 목록에서 이 사건의 범인이라고 생각되는 인물을 선택하십시오.</Label>
                <Select id="culprit-select" value={culpritName} onChange={(e) => setCulpritName(e.target.value)} disabled={isLoading}>
                  {npcs.map(npc => (
                    <option key={npc.id} value={npc.name}>{npc.name}</option>
                  ))}
                </Select>
              </FieldSet>

              <FieldSet>
                <Legend>최종 추리</Legend>
                <Label htmlFor="reasoning-text">수집한 단서들을 바탕으로, 당신의 최종 추리를 상세히 기술하십시오. (육하원칙에 따라 작성 권장)</Label>
                <TextArea id="reasoning-text" value={reasoningText} onChange={(e) => setReasoningText(e.target.value)} disabled={isLoading} />
              </FieldSet>

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? '분석 중...' : '보고서 봉인 및 제출'}
              </SubmitButton>
              {error && <ErrorText>{error}</ErrorText>}
            </form>
          ) : (
            <ResultContainer $isCorrect={result.isCorrect}>
              <h3>{result.reportTitle}</h3>
              <p><strong>측정된 추리 유사도:</strong> {result.similarity} / 100</p>
              <hr />
              <p>{result.reportBody}</p>
            </ResultContainer>
          )}
        </ReportContent>
      </ReportContainer>
    </ModalOverlay>
  );
};

export default Submit;