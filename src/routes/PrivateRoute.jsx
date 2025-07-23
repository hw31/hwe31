import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { token, idSesion, loading } = useSelector((state) => state.auth);
console.log('PrivateRoute - loading:', loading, 'token:', token, 'idSesion:', idSesion);

  if (loading) {
    return <div className="text-center mt-20 text-xl">Verificando sesión...</div>;
  }

  const isAuthenticated =
    typeof token === 'string' && token.length > 0 &&
    typeof idSesion === 'string' && idSesion.length > 0;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
