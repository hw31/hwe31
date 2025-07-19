import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkSession } from "./features/Auth/authSlice";
import { setModoOscuro, fetchModoOscuro } from "./features/theme/themeSlice";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

// Importa tus páginas según menú
import FrmUsuarios from "./pages/FrmUsuarios";
import FrmEstados from "./pages/FrmEstados";
import FrmCatalogos from "./pages/FrmCatalogos";
import FrmPersonas from "./pages/FrmPersonas";
import FrmContactos from "./pages/FrmContactos";
import FrmRoles from "./pages/FrmRoles";
import FrmPermisos from "./pages/FrmPermisos";
import FrmPeriodos from "./pages/FrmPeriodos";
import FrmMaterias from "./pages/FrmMaterias";
import FrmInscripciones from "./pages/FrmInscripciones";
import FrmCalificaciones from "./pages/FrmCalificaciones";
import FrmGrupos from "./pages/FrmGrupos";
import FrmAulas from "./pages/FrmAulas";
import FrmHorarios from "./pages/FrmHorarios";
import FrmAsignacion from "./pages/FrmAsignacion";
import FrmTipoCalificaciones from "./pages/FrmTipoCalificaciones";
import FrmTransacciones from "./pages/FrmTransacciones";
import FrmTipoTransacciones from "./pages/FrmTipoTransacciones";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, modo } = useSelector((state) => state.auth);
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  useEffect(() => {
    // Primero validar sesión
    dispatch(checkSession()).then((res) => {
      if (res.payload?.isAuthenticated) {
        // Si está autenticado, pedir modo oscuro desde backend
        dispatch(fetchModoOscuro());
      }
    });
  }, [dispatch]);

  // Sincroniza modo dark/light desde auth a theme solo si quieres mantener esta fuente
  useEffect(() => {
    if (modo === "dark") dispatch(setModoOscuro(true));
    else dispatch(setModoOscuro(false));
  }, [modo, dispatch]);

  // Aplica clase dark en html
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<FrmUsuarios />} />
        <Route path="/estados" element={<FrmEstados />} />
        <Route path="/catalogos" element={<FrmCatalogos />} />
        <Route path="/personas" element={<FrmPersonas />} />
        <Route path="/contactos" element={<FrmContactos />} />
        <Route path="/roles" element={<FrmRoles />} />
        <Route path="/permisos" element={<FrmPermisos />} />
        <Route path="/periodos" element={<FrmPeriodos />} />
        <Route path="/materias" element={<FrmMaterias />} />
        <Route path="/inscripciones" element={<FrmInscripciones />} />
        <Route path="/calificaciones" element={<FrmCalificaciones />} />
        <Route path="/grupos" element={<FrmGrupos />} />
        <Route path="/aulas" element={<FrmAulas />} />
        <Route path="/horarios" element={<FrmHorarios />} />
        <Route path="/asignacion" element={<FrmAsignacion />} />
        <Route path="/tipocalificaciones" element={<FrmTipoCalificaciones />} />
        <Route path="/transacciones" element={<FrmTransacciones />} />
        <Route path="/tipotransacciones" element={<FrmTipoTransacciones />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
