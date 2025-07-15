import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { concludePlaythroughApi } from '../api/game';

// --- 애니메이션 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const paperTexture = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

// --- 스타일 컴포넌트 ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: 
    radial-gradient(circle at center, rgba(44, 24, 16, 0.85) 0%, rgba(26, 15, 10, 0.95) 100%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(139, 69, 19, 0.08) 2px,
      rgba(139, 69, 19, 0.08) 4px
    );
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ReportContainer = styled.div`
  background: 
    linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(139, 69, 19, 0.05) 2px,
      rgba(139, 69, 19, 0.05) 4px
    );
  background-blend-mode: overlay;
  color: #2c1810;
  border: 3px solid #8b4513;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.8),
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(139, 69, 19, 0.2);
  font-family: 'Crimson Text', serif;
  position: relative;
  
  &::before {
    // animation: ${paperTexture} 2s ease-in-out infinite alternate; // ← 이 줄을 주석 처리
  }
`;

const ReportHeader = styled.div`
  background: 
    linear-gradient(135deg, #8b4513 0%, #654321 100%),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(218, 165, 32, 0.1) 1px,
      rgba(218, 165, 32, 0.1) 2px
    );
  background-blend-mode: overlay;
  color: #f4e8d0;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #daa520;
  border-radius: 8px 8px 0 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.6), transparent);
  }
`;

const ReportTitle = styled.h2`
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  position: relative;
  
  &::before,
  &::after {
    content: '◆';
    color: #daa520;
    font-size: 0.7em;
    margin: 0 15px;
    opacity: 0.8;
    text-shadow: 0 0 5px rgba(218, 165, 32, 0.6);
  }
`;

const CloseButton = styled.button`
  background: 
    linear-gradient(135deg, #daa520 0%, #b8860b 100%);
  color: #1c1c1c;
  border: 2px solid #8b4513;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  
  &:hover { 
    transform: scale(1.1);
    background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.6),
      inset 0 2px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ReportContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px;
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
        0deg,
        transparent,
        transparent 24px,
        rgba(139, 69, 19, 0.1) 24px,
        rgba(139, 69, 19, 0.1) 25px
      );
    pointer-events: none;
    z-index: 1;
  }
  
  & > * {
    position: relative;
    z-index: 2;
  }
`;

const FieldSet = styled.fieldset`
  border: 2px solid #8b4513;
  border-radius: 6px;
  padding: 25px;
  margin-bottom: 30px;
  background: 
    linear-gradient(135deg, rgba(244, 232, 208, 0.8) 0%, rgba(230, 211, 176, 0.8) 100%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      rgba(139, 69, 19, 0.02) 20px,
      rgba(139, 69, 19, 0.02) 21px
    );
  box-shadow: 
    inset 0 2px 4px rgba(139, 69, 19, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Legend = styled.legend`
  padding: 8px 15px;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  color: #8b4513;
  background: 
    linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  border: 2px solid #8b4513;
  border-radius: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #654321;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.4;
`;

const Select = styled.select`
  width: 100%;
  padding: 15px;
  border: 2px solid #8b4513;
  border-radius: 6px;
  background: 
    linear-gradient(135deg, #fff 0%, #f4e8d0 100%);
  font-size: 16px;
  font-family: 'Crimson Text', serif;
  color: #2c1810;
  box-shadow: 
    inset 0 2px 4px rgba(139, 69, 19, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:focus { 
    outline: none;
    border-color: #daa520;
    box-shadow: 
      inset 0 2px 4px rgba(139, 69, 19, 0.1),
      0 0 0 3px rgba(218, 165, 32, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:hover {
    border-color: #daa520;
    background: linear-gradient(135deg, #f4e8d0 0%, #fff 100%);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 18px;
  border: 2px solid #8b4513;
  border-radius: 6px;
  background: 
    linear-gradient(135deg, #fff 0%, #f4e8d0 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 22px,
      rgba(139, 69, 19, 0.03) 22px,
      rgba(139, 69, 19, 0.03) 23px
    );
  font-size: 16px;
  font-family: 'Crimson Text', serif;
  color: #2c1810;
  line-height: 1.8;
  resize: vertical;
  box-shadow: 
    inset 0 2px 4px rgba(139, 69, 19, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:focus { 
    outline: none;
    border-color: #daa520;
    box-shadow: 
      inset 0 2px 4px rgba(139, 69, 19, 0.1),
      0 0 0 3px rgba(218, 165, 32, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:hover {
    border-color: #daa520;
    background: 
      linear-gradient(135deg, #f4e8d0 0%, #fff 100%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 22px,
        rgba(139, 69, 19, 0.03) 22px,
        rgba(139, 69, 19, 0.03) 23px
      );
  }
  
  &::placeholder {
    color: #a0805a;
    font-style: italic;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 20px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: 
    linear-gradient(135deg, #daa520 0%, #b8860b 100%);
  color: #1c1c1c;
  border: 3px solid #8b4513;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 
    0 1px 2px rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.4),
      inset 0 2px 0 rgba(255, 255, 255, 0.3);
      
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 2px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #a0805a 0%, #8b6f47 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

const ResultContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
  background: 
    linear-gradient(135deg, rgba(244, 232, 208, 0.9) 0%, rgba(230, 211, 176, 0.9) 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 24px,
      rgba(139, 69, 19, 0.05) 24px,
      rgba(139, 69, 19, 0.05) 25px
    );
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  
  h3 {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    font-weight: 700;
    color: ${props => (props.$isCorrect ? '#2d5a2d' : '#8b2635')};
    border-bottom: 3px solid ${props => (props.$isCorrect ? '#2d5a2d' : '#8b2635')};
    padding-bottom: 15px;
    margin-bottom: 20px;
    text-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
    
    &::before {
      content: '${props => (props.$isCorrect ? '✓' : '✗')}';
      position: absolute;
      left: -30px;
      top: 0;
      font-size: 24px;
      color: ${props => (props.$isCorrect ? '#2d5a2d' : '#8b2635')};
    }
  }
  
  p { 
    white-space: pre-wrap; 
    line-height: 1.8;
    font-size: 16px;
    color: #2c1810;
    margin-bottom: 15px;
  }
  
  strong {
    color: #8b4513;
    font-family: 'Cinzel', serif;
    font-weight: 600;
  }
`;

const ErrorText = styled.p`
  color: #8b2635;
  text-align: center;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  margin-top: 20px;
  padding: 15px;
  background: 
    linear-gradient(135deg, rgba(139, 38, 53, 0.1) 0%, rgba(139, 38, 53, 0.05) 100%);
  border: 2px solid #8b2635;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;


const Submit = ({ playthroughId, gameData, onClose, onSubmissionComplete }) => {
  const navigate = useNavigate(); // 2. 페이지 이동을 위한 navigate 함수 선언
  const { token } = useAuth();
  const [culpritName, setCulpritName] = useState('');
  const [reasoningText, setReasoningText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      onSubmissionComplete(reportData);
      
      // 3. ✨ API 호출 성공 시, 결과 페이지로 데이터와 함께 이동합니다.
      navigate('/conclusion', { state: { result: reportData } });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ReportContainer>
        <ReportHeader>
          <ReportTitle>최종 추리 보고서</ReportTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ReportHeader>
        <ReportContent>
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
              <Label htmlFor="reasoning-text">수집한 단서들을 바탕으로, 당신의 최종 추리를 상세히 기술하십시오. (동기, 단서, 경위 등 상세히 작성 권장)</Label>
              <TextArea id="reasoning-text" value={reasoningText} onChange={(e) => setReasoningText(e.target.value)} disabled={isLoading} />
            </FieldSet>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? '분석 중...' : '보고서 봉인 및 제출'}
            </SubmitButton>
            {error && <ErrorText>{error}</ErrorText>}
          </form>
        </ReportContent>
      </ReportContainer>
    </ModalOverlay>
  );
};

export default Submit;