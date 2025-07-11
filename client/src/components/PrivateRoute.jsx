import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  // 토큰(로그인 상태)이 없으면 로그인 페이지로 보내버림
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // 토큰이 있으면 원래 보여주려던 페이지를 보여줌
  return children;
};

export default PrivateRoute;