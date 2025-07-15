// --- 필요한 컴포넌트들을 먼저 import 합니다 ---
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';     // MainPage -> HomePage로 이름 변경
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 불러오기
import ScenarioList from './components/ScenarioList';
import ContinueGame from './components/ContinueGame';
import ProloguePage from './pages/ProloguePage';
import GamePage from './pages/GamePage';     // 새로운 GamePage 추가
import ConclusionPage from './pages/ConclusionPage';

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

          {/* 시나리오 선택 페이지 */}
          <Route 
            path="/game/start" 
            element={
              <PrivateRoute>
                <ScenarioList />
              </PrivateRoute>
            } 
          />

          {/* 이어하기 페이지 */}
          <Route
            path="/game/continue"
            element={
              <PrivateRoute>
                <ContinueGame />
              </PrivateRoute>
            }
          />
          
          {/* 3. ✨ 프롤로그 페이지 경로 ✨
            - path="/game/:playthroughId": 동적 파라미터(playthroughId)를 사용합니다.
            - HomePage의 ScenarioList에서 navigate 함수를 통해 이 경로로 이동하게 됩니다.
            - PrivateRoute로 감싸서 로그인한 사용자만 접근할 수 있도록 보호합니다.
            - 프롤로그가 끝나면 실제 게임 페이지로 전환됩니다.
          */}
          <Route
            path="/game/:playthroughId"
            element={
              <PrivateRoute>
                <ProloguePage />
              </PrivateRoute>
            }
          />

          {/* 4. ✨ 실제 게임 플레이 페이지 경로 ✨
            - path="/game/:playthroughId/play": 프롤로그가 끝난 후 실제 게임 플레이 페이지
            - 포인트 앤 클릭 탐정 게임 인터페이스
            - ProloguePage에서 이 경로로 이동하게 됩니다.
          */}
          <Route
            path="/game/:playthroughId/play"
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            }
          />

          {/* 5. 앞으로 만들 다른 페이지들도 PrivateRoute로 감싸서 보호합니다. */}
          {/* 예: <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} /> */}

          <Route
              path="/conclusion"
              element={
                <PrivateRoute>
                  <ConclusionPage />
                </PrivateRoute>
              }
            />
        </Routes>

      </main>
    </div>
  );
}

export default App;
