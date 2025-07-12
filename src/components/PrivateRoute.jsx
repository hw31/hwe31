import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuth = !!localStorage.getItem("token"); // o "id_usuario" si lo prefieres
  return isAuth ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;