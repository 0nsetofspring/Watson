import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import backgroundImage from '../assets/images/background.png';

// --- 스타일 컴포넌트 ---
const PageContainer = styled.div`
  width: 100vw; height: 100vh;
  background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage});
  background-size: cover; display: flex;
  justify-content: center; align-items: center; padding: 20px;
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;
const ReportContainer = styled.div`
  width: 100%; max-width: 800px; max-height: 90vh;
  background: #f0f4f8; color: #333; border-radius: 4px;
  display: flex; flex-direction: column;
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.6s ease-in-out;
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;
const ReportHeader = styled.div`
  background: #34495e; color: #ecf0f1;
  padding: 20px 25px; border-bottom: 4px solid #f39c12;
`;
const ReportTitle = styled.h1`
  margin: 0; font-family: 'Georgia', serif; font-size: 24px;
`;
const ReportContent = styled.div`
  padding: 30px; overflow-y: auto; line-height: 1.7;
  h3 {
    font-family: 'Georgia', serif;
    color: ${props => (props.$isCorrect ? '#27ae60' : '#c0392b')};
    border-bottom: 2px solid ${props => (props.$isCorrect ? '#27ae60' : '#c0392b')};
    padding-bottom: 10px;
  }
  p { white-space: pre-wrap; }
`;
const ChartContainer = styled.div`
  margin: 25px 0;
`;
const ChartLabel = styled.p`
  margin-bottom: 10px; font-weight: bold;
`;
const BarBackground = styled.div`
  width: 100%; background-color: #d4dce3; border-radius: 4px;
`;
const fillAnimation = (width) => keyframes`
  from { width: 0%; }
  to { width: ${width}%; }
`;
const BarFill = styled.div`
  height: 30px;
  background-color: ${props => (props.$isCorrect ? '#27ae60' : '#f39c12')};
  background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
  border-radius: 4px;
  animation: ${props => fillAnimation(props.$width)} 1.5s 0.5s ease-out forwards;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: bold; font-size: 16px;
  width: 0%; 
`;
const Footer = styled.div`
  padding: 20px; text-align: center; border-top: 1px solid #e0e6ec;
`;
const HomeButton = styled.button`
  padding: 12px 30px; font-size: 16px; font-weight: bold;
  background: #34495e; color: #fff; border: none; border-radius: 4px;
  cursor: pointer; transition: background-color 0.2s;
  &:hover { background-color: #2c3e50; }
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