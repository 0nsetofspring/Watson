// src/components/ScenarioList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScenariosApi } from '../api/scenarios';
import { startGameApi } from '../api/game';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const ListContainer = styled.div`
  text-align: center;
`;
const ScenarioButton = styled.button`
  display: block;
  width: 70%;
  padding: 8px;
  margin: auto;
  margin-bottom: 10px;
  background-color: #584d43ff;
  color: #edebe8;
  font-size: 16px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover { background-color: #41372fff; }
`;
const BackButton = styled.button`
  margin-top: 20px;
  background-color: #584d43ff;
  color: #edebe8;
`;


const ScenarioList = ({ onBack, onScenarioSelect }) => {
  const { token } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때 시나리오 목록을 불러옵니다.
    const fetchScenarios = async () => {
      try {
        const data = await getScenariosApi(token);
        console.log('서버로부터 받은 시나리오 데이터:', data); // 더미 데이터 확인용
        setScenarios(data);
      } catch (err) {
        setError(err.message);
        console.error('시나리오를 가져오는 중 에러 발생:', err); // 에러도 콘솔에 출력
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchScenarios();
    }
  }, [token]); // token 값이 바뀔 때마다 실행

  const handleScenarioClick = async (scenarioId) => {
    try {
      // API-03 호출: 새로운 게임 시작
      const { playthroughId } = await startGameApi(scenarioId, token);
      // 게임 시작 후 바로 채팅창(게임 플레이 화면)으로 이동
      // navigate(`/game/play/${playthroughId}`);
      console.log(`새로운 게임이 시작되었습니다. Playthrough ID: ${playthroughId}`);
      onScenarioSelect(playthroughId); 
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;

  if (scenarios.length === 0) {
    window.alert('시나리오가 없습니다');
    return <p>시나리오가 없습니다</p>;
  }

  return (
    <ListContainer>
      <h2>플레이할 사건을 선택하세요</h2>
      {scenarios.map((scenario) => (
        <ScenarioButton key={scenario.id} onClick={() => handleScenarioClick(scenario.id)}>
          {scenario.title}
        </ScenarioButton>
      ))}
      <BackButton onClick={onBack}>뒤로가기</BackButton>
    </ListContainer>
  );
};

export default ScenarioList;