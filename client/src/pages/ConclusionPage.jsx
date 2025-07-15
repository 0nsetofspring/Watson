import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import backgroundImage from '../assets/images/background.png';

// --- 스타일 컴포넌트 ---
const PageContainer = styled.div`
  width: 100vw; 
  height: 100vh;
  background: 
    linear-gradient(rgba(44, 24, 16, 0.85), rgba(26, 15, 10, 0.9)), 
    url(${backgroundImage}),
    linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  background-size: cover, cover, 100% 100%; 
  background-position: center, center, center;
  background-blend-mode: overlay, multiply, normal;
  display: flex;
  justify-content: center; 
  align-items: center; 
  padding: 20px;
  font-family: 'Crimson Text', serif;
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
        45deg,
        transparent,
        transparent 50px,
        rgba(139, 69, 19, 0.03) 50px,
        rgba(139, 69, 19, 0.03) 52px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.95) translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
`;

const ReportContainer = styled.div`
  width: 100%; 
  max-width: 900px; 
  max-height: 90vh;
  background: linear-gradient(135deg, #f4e8d0 0%, #e6d3b0 100%);
  color: #2c1810; 
  border-radius: 8px;
  display: flex; 
  flex-direction: column;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(218, 165, 32, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: ${fadeIn} 0.8s ease-out;
  font-family: 'Crimson Text', serif;
  border: 3px solid #8b4513;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #daa520, #b8860b, #daa520);
    border-radius: 10px;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 15px;
    right: 15px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.3), transparent);
  }
`;

const ReportHeader = styled.div`
  background: linear-gradient(135deg, #8b4513 0%, #704214 100%);
  color: #f4e8d0;
  padding: 25px 30px; 
  border-bottom: 4px solid #daa520;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #654321, #8b4513, #654321);
  }
`;

const ReportTitle = styled.h1`
  margin: 0; 
  font-family: 'Cinzel', serif; 
  font-size: 28px;
  font-weight: 600;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(218, 165, 32, 0.3);
  position: relative;
  text-align: center;
  
  &::before,
  &::after {
    content: '◆';
    color: #daa520;
    font-size: 0.8em;
    margin: 0 15px;
    opacity: 0.8;
  }
`;

const ReportContent = styled.div`
  padding: 35px 40px; 
  overflow-y: auto; 
  line-height: 1.8;
  background: linear-gradient(135deg, #f4e8d0 0%, #fffbe6 50%, #e6d3b0 100%);
  
  h3 {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    font-weight: 600;
    color: ${props => (props.$isCorrect ? '#2d5a27' : '#8b2635')};
    border-bottom: 3px solid ${props => (props.$isCorrect ? '#2d5a27' : '#8b2635')};
    padding-bottom: 12px;
    margin-bottom: 25px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
    
    &::before {
      content: ${props => (props.$isCorrect ? '"✓"' : '"⚠"')};
      position: absolute;
      left: -25px;
      color: ${props => (props.$isCorrect ? '#2d5a27' : '#8b2635')};
      font-size: 1.1em;
    }
  }
  
  p { 
    white-space: pre-wrap; 
    font-size: 16px;
    color: #2c1810;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  }
  
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #8b4513, transparent);
    margin: 30px 0;
    position: relative;
    
    &::before {
      content: '◇';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: #f4e8d0;
      color: #8b4513;
      padding: 0 10px;
      font-family: 'Cinzel', serif;
    }
  }
`;

const ChartContainer = styled.div`
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #fffbe6 0%, #f4e8d0 100%);
  border: 2px solid #daa520;
  border-radius: 8px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const ChartLabel = styled.p`
  margin-bottom: 15px; 
  font-weight: bold;
  font-size: 16px;
  font-family: 'Cinzel', serif;
  color: #8b4513;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  text-align: center;
`;

const BarBackground = styled.div`
  width: 100%; 
  background: linear-gradient(135deg, #d4c5a0 0%, #c9b896 100%);
  border-radius: 6px;
  border: 2px solid #8b4513;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const fillAnimation = (width) => keyframes`
  from { width: 0%; }
  to { width: ${width}%; }
`;

const BarFill = styled.div`
  height: 35px;
  background: ${props => {
    const similarity = props.$width;
    if (similarity >= 90) {
      return 'linear-gradient(135deg, #1e4620 0%, #2d5a27 50%, #4a7c59 100%)'; // 매우 우수 (진한 녹색)
    } else if (similarity >= 75) {
      return 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 50%, #68a085 100%)'; // 우수 (녹색)
    } else if (similarity >= 60) {
      return 'linear-gradient(135deg, #5a7c2d 0%, #7ba05a 50%, #9bc47a 100%)'; // 양호 (연한 녹색)
    } else if (similarity >= 45) {
      return 'linear-gradient(135deg, #b8860b 0%, #daa520 50%, #f4d03f 100%)'; // 보통 (골드)
    } else if (similarity >= 30) {
      return 'linear-gradient(135deg, #cc6600 0%, #e67e22 50%, #f39c12 100%)'; // 미흡 (주황색)
    } else {
      return 'linear-gradient(135deg, #8b2635 0%, #c0392b 50%, #e74c3c 100%)'; // 불량 (빨간색)
    }
  }};

  border-radius: 4px;
  animation: ${props => fillAnimation(props.$width)} 2s 1s ease-out forwards;
  display: flex; 
  align-items: center; 
  justify-content: center;
  color: #f4e8d0; 
  font-weight: bold; 
  font-size: 18px;
  font-family: 'Cinzel', serif;
  width: 0%; 
  text-shadow: 
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 5px rgba(244, 232, 208, 0.3);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  /* 세련된 반짝이는 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2) 50%,
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    50% { left: 100%; }
    100% { left: 100%; }
  }
  
  /* 점수별 특별 효과 */
  ${props => props.$width >= 90 && `
    &::after {
      content: '🏆';
      position: absolute;
      right: 8px;
      font-size: 20px;
      filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
    }
  `}
  
  ${props => props.$width >= 75 && props.$width < 90 && `
    &::after {
      content: '⭐';
      position: absolute;
      right: 8px;
      font-size: 18px;
      filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
    }
  `}
  
  ${props => props.$width < 30 && `
    &::after {
      content: '💭';
      position: absolute;
      right: 8px;
      font-size: 16px;
      opacity: 0.8;
    }
  `}
`;

const Footer = styled.div`
  padding: 25px; 
  text-align: center; 
  border-top: 3px solid #8b4513;
  background: linear-gradient(135deg, #e6d3b0 0%, #d4c5a0 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #daa520, transparent);
  }
`;

const HomeButton = styled.button`
  padding: 15px 35px; 
  font-size: 16px; 
  font-weight: 600;
  background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
  color: #f4e8d0; 
  border: 2px solid #daa520; 
  border-radius: 6px;
  cursor: pointer; 
  transition: all 0.3s ease;
  font-family: 'Cinzel', serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
  &:hover { 
    background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: #b8860b;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;


const ConclusionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {}; // Submit 페이지에서 보낸 state를 받습니다.

  // 만약 state에 result가 없으면 (즉, 직접 URL로 접근하면) 홈으로 보냅니다.
  useEffect(() => {
    if (!result) {
      navigate('/home');
    }
  }, [result, navigate]);

  if (!result) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않습니다.
  }
  
  return (
    <PageContainer>
      <ReportContainer>
        <ReportHeader>
          <ReportTitle>사건 종결 보고서</ReportTitle>
        </ReportHeader>
        <ReportContent $isCorrect={result.isCorrect}>
          <h3>{result.reportTitle}</h3>
          
          <ChartContainer>
              <ChartLabel>추리 정확도 분석 ({result.similarity}%)</ChartLabel>
              <BarBackground>
                  <BarFill $width={result.similarity} $isCorrect={result.isCorrect}>
                      {result.similarity > 10 && `${result.similarity}%`}
                  </BarFill>
              </BarBackground>
          </ChartContainer>
          
          <hr />
          <p>{result.reportBody}</p>
        </ReportContent>
        <Footer>
            <HomeButton onClick={() => navigate('/home')}>메인 화면으로 돌아가기</HomeButton>
        </Footer>
      </ReportContainer>
    </PageContainer>
  );
};

export default ConclusionPage;