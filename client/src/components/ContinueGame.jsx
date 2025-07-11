import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000';

const ContinueGame = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaythrough = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/playthroughs/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const err = await res.json();
          setError(err.error);
        } else {
          const data = await res.json();
          // 실제 게임 페이지로 이동 (예: /game/play/:playthroughId)
          navigate(`/game/play/${data.playthroughId}`);
        }
      } catch (e) {
        setError('서버 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaythrough();
  }, [token, navigate]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;
  return null; // 이동 중이므로 아무것도 렌더링하지 않음
};

export default ContinueGame;
