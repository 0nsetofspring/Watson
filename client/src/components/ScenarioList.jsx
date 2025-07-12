// src/components/ScenarioList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScenariosApi } from '../api/scenarios';
import { startGameApi } from '../api/game';
import { useNavigate } from 'react-router-dom';

const ScenarioList = () => {
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

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;

  if (scenarios.length === 0) {
    window.alert('시나리오가 없습니다');
    return <p>시나리오가 없습니다</p>;
  }

  const handleScenarioClick = async (scenarioId) => {
    try {
      const { playthroughId } = await startGameApi(scenarioId, token);
      // 게임 시작 후 바로 채팅창(게임 플레이 화면)으로 이동
      navigate(`/game/play/${playthroughId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>플레이할 시나리오를 선택하세요</h2>
      <ul>
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <button onClick={() => handleScenarioClick(scenario.id)}>
              {scenario.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScenarioList;