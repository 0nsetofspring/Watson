// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';     // MainPage -> HomePage로 이름 변경
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 불러오기

function App() {
  return (
    <div className="app-container">
      <main>
        <Routes>
          {/* 1. 기본 경로를 로그인 페이지로 설정 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 2. 사용자가 다른 주소로 접근 시, 로그인 안했으면 로그인 페이지로 보냄 */}
          <Route path="/" element={<PrivateRoute><HomePage/></PrivateRoute>} />
          
          {/* 3. 앞으로 만들 모든 페이지는 PrivateRoute로 감싸서 보호 */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage/>
              </PrivateRoute>
            }
          />
          {/* 예: <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} /> */}

        </Routes>
      </main>
    </div>
  );
}

export default App;