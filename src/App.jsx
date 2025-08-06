// App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { checkSession } from "./features/Auth/authSlice";
import { setModoOscuro, fetchModoOscuro } from "./features/theme/themeSlice";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrivateRoute from './routes/PrivateRoute';

import FrmUsuarios from './components/pages/FrmUsuarios';
import FrmAsignacion from './components/pages/FrmAsignacion';
import FrmAulas from "./components/pages/FrmAulas";
import FrmInscripcionesMaterias from './components/pages/FrmInscripcionesMaterias';
import FrmEstados from "./components/pages/FrmEstados";
import FrmCatalogos from "./components/pages/FrmCatalogos";
import FrmPersonas from "./components/pages/FrmPersonas";
import FrmContactos from "./components/pages/FrmContactos";
import FrmRoles from "./components/pages/FrmRoles";
import FrmPermisos from "./components/pages/FrmPermisos";
import FrmPeriodos from "./components/pages/FrmPeriodos";
import FrmMaterias from "./components/pages/FrmMaterias";
import FrmInscripciones from "./components/pages/FrmInscripciones";
import FrmCalificaciones from "./components/pages/FrmCalificaciones";
import FrmGrupos from "./components/pages/FrmGrupos";
import FrmHorarios from "./components/pages/FrmHorarios";
import FrmTipoCalificaciones from "./components/pages/FrmTipoCalificacion";
import FrmTransacciones from "./components/pages/FrmTransacciones";
import FrmTipoTransacciones from "./components/pages/FrmTipoTransacciones";
import FrmTransaccionxRol from "./components/pages/FrmTransaccionRol";
import FrmTransaccionPermiso from "./components/pages/FrmTransaccionPermiso";
import FrmRescateEvaculacion from "./components/pages/FrmRescateEvaculacion";
import MateriasPorCarrera from "./components/hijos/MateriasPorCarrera";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, modo } = useSelector(state => state.auth);
  const modoOscuro = useSelector(state => state.theme.modoOscuro);

  useEffect(() => {
    dispatch(checkSession()).then(res => {
      if (res.payload?.isAuthenticated) {
        dispatch(fetchModoOscuro());
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(setModoOscuro(modo === "dark"));
  }, [modo, dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    if (modoOscuro) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [modoOscuro]);

  if (loading) {
    return <div className="text-center mt-20 text-xl">Verificando sesión...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="usuarios" element={<FrmUsuarios />} />
          <Route path="asignacion" element={<FrmAsignacion />} />
          <Route path="aulas" element={<FrmAulas />} />
          <Route path="inscripcionesmaterias" element={<FrmInscripcionesMaterias />} />
          <Route path="estados" element={<FrmEstados />} />
          <Route path="catalogos" element={<FrmCatalogos />} />
          <Route path="personas" element={<FrmPersonas />} />
          <Route path="contactos" element={<FrmContactos />} />
          <Route path="roles" element={<FrmRoles />} />
          <Route path="permisos" element={<FrmPermisos />} />
          <Route path="periodos" element={<FrmPeriodos />} />
          <Route path="materias" element={<FrmMaterias />} />
          <Route path="inscripciones" element={<FrmInscripciones />} />
          <Route path="calificaciones" element={<FrmCalificaciones />} />
          <Route path="grupos" element={<FrmGrupos />} />
          <Route path="horarios" element={<FrmHorarios />} />
          <Route path="carrera/:idCarrera" element={<MateriasPorCarrera />} />
          <Route path="tipocalificacion" element={<FrmTipoCalificaciones />} />
          <Route path="transacciones" element={<FrmTransacciones />} />
          <Route path="tipotransacciones" element={<FrmTipoTransacciones />} />
          <Route path="transaccionxrol" element={<FrmTransaccionxRol />} />
          <Route path="transaccionpermiso" element={<FrmTransaccionPermiso />} />
          <Route path="rescate" element={<FrmRescateEvaculacion />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
