// --- 필요한 컴포넌트들을 먼저 import 합니다 ---
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; // 로그인 페이지
import HomePage from './pages/HomePage'; // 홈페이지
import GamePage from './pages/GamePage'; // 새로 만든 게임 페이지!
import ContinueGame from './components/ContinueGame'; // 이어하기 페이지
import PrivateRoute from './components/PrivateRoute'; // 인증 보호 컴포넌트
// ScenarioList는 HomePage 내에서 사용되므로 여기서는 직접 import할 필요가 없을 수 있습니다.
// 만약 /game/start 경로를 독립적으로 사용한다면 import 해야 합니다.
import ScenarioList from './components/ScenarioList'; 

function App() {
  return (
    <div className="app-container">
      <main>
        <Routes>
          {/* 1. 기본 경로 및 로그인 페이지 설정 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />

          {/* 2. 게임 관련 경로 설정 */}

          {/* '/game/start'는 ScenarioList를 직접 보여주는 경로로 유지할 수 있습니다. */}
          <Route 
            path="/game/start" 
            element={
              <PrivateRoute>
                <ScenarioList />
              </PrivateRoute>
            } 
          />

          {/* '이어하기' 페이지 경로 */}
          <Route
            path="/game/continue"
            element={
              <PrivateRoute>
                <ContinueGame />
              </PrivateRoute>
            }
          />
          
          {/* 3. ✨ 새로 추가된 게임 플레이 페이지 경로입니다. ✨
            - path="/game/:playthroughId": 동적 파라미터(playthroughId)를 사용합니다.
            - HomePage의 ScenarioList에서 navigate 함수를 통해 이 경로로 이동하게 됩니다.
            - PrivateRoute로 감싸서 로그인한 사용자만 접근할 수 있도록 보호합니다.
          */}
          <Route
            path="/game/:playthroughId"
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            }
          />

          {/* 4. 앞으로 만들 다른 페이지들도 PrivateRoute로 감싸서 보호합니다. */}
          {/* 예: <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} /> */}

        </Routes>
      </main>
    </div>
  );
}

export default App;
