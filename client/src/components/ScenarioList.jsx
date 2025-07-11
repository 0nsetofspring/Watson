// src/components/ScenarioList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScenariosApi } from '../api/scenarios';

const ScenarioList = () => {
  const { token } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때 시나리오 목록을 불러옵니다.
    const fetchScenarios = async () => {
      try {
        const data = await getScenariosApi(token);
        setScenarios(data);
      } catch (err) {
        setError(err.message);
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

  const handleScenarioClick = (scenarioId) => {
    // TODO: 여기서 API-03 (새로운 게임 시작)을 호출하고,
    // 성공하면 게임 페이지로 이동하는 로직을 추가합니다.
    alert(`시나리오 ${scenarioId}를 선택했습니다!`);
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