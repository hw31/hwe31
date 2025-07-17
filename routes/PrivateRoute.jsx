import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { token, idSesion } = useSelector((state) => state.auth);

  const isAuthenticated = typeof token === 'string' && token.length > 0
    && typeof idSesion === 'string' && idSesion.length > 0;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
