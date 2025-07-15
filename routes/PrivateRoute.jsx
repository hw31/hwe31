import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = useSelector((state) => state.auth.token);
  const idSesion = useSelector((state) => state.auth.idSesion);

  const isAuthenticated = token && idSesion;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;