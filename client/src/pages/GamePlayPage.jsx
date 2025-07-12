import { useParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

const GamePlayPage = () => {
  const { playthroughId } = useParams();

  return (
    <div>
      <h2>게임 플레이</h2>
      <ChatBox playthroughId={playthroughId} />
    </div>
  );
};

export default GamePlayPage;
