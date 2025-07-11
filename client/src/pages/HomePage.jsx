// src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* 이 페이지는 PrivateRoute 덕분에 user가 항상 존재함 */}
      <h1>환영합니다, {user?.nickname}님!</h1>
      <p>추리를 시작할 준비가 되셨나요?</p>
      <nav>
        <Link to="/game/start"><button>새 게임 시작</button></Link>
        <Link to="/game/continue"><button>이어하기</button></Link>
        <Link to="/community"><button>커뮤니티 가기</button></Link>
        <button onClick={logout}>로그아웃</button>
      </nav>
    </div>
  );
};

export default HomePage;