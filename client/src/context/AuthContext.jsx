import { createContext, useContext, useState, useEffect } from 'react';

// 1. Context 생성
const AuthContext = createContext();

// 2. Provider 컴포넌트 생성
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // 로컬 스토리지에서 토큰을 가져옴

  // TODO: 토큰이 유효한지 서버에 확인하는 로직 추가하면 더 좋음

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('token', accessToken); // 토큰을 로컬 스토리지에 저장
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. 쉽게 가져다 쓸 수 있는 custom hook 생성
export const useAuth = () => useContext(AuthContext);