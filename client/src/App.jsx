// --- 필요한 컴포넌트들을 먼저 import 합니다 ---
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';     // MainPage -> HomePage로 이름 변경
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 불러오기
import ScenarioList from './components/ScenarioList';
import ContinueGame from './components/ContinueGame';
import GamePlayPage from './pages/GamePlayPage';

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
          <Route path="/game/start" element={<ScenarioList />} />
          <Route path="/game/continue"
                  element={
                    <PrivateRoute>
                      <ContinueGame />
                    </PrivateRoute>
                  } />
          <Route path="/game/play/:playthroughId" element={<GamePlayPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
