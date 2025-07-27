import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { checkSession } from "./features/Auth/authSlice";
import { setModoOscuro, fetchModoOscuro } from "./features/theme/themeSlice";



import { checkSession } from "./features/Auth/authSlice";
import { setModoOscuro, fetchModoOscuro } from "./features/theme/themeSlice";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrivateRoute from './routes/PrivateRoute';
import FrmUsuarios from './components/pages/FrmUsuarios';
import FrmAsignacion from  './components/pages/FrmAsignacion';
import FrmAulas from "./pages/FrmAulas";
import FrmInscripcionesMaterias from './components/pages/FrmInscripcionesMaterias';
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
import FrmHorarios from "./pages/FrmHorarios";
import FrmTipoCalificaciones from "./pages/FrmTipoCalificaciones";
import FrmTransacciones from "./pages/FrmTransacciones";
import FrmTipoTransacciones from "./pages/FrmTipoTransacciones";
import FrmRescateEvaculacion from "./pages/FrmRescateEvaculacion";


function App() {
  const dispatch = useDispatch();

  // Extraemos estado de autenticación, loading y modo (dark/light) del store redux
  const { isAuthenticated, loading, modo } = useSelector(state => state.auth);

  // Estado del modo oscuro para aplicar clase al root
  const modoOscuro = useSelector(state => state.theme.modoOscuro);

  // Verificamos la sesión del usuario al montar la app
  useEffect(() => {
    dispatch(checkSession()).then(res => {
      if (res.payload?.isAuthenticated) {
        // Si está autenticado, cargamos configuración del modo oscuro guardado
        dispatch(fetchModoOscuro());
      }
    });
  }, [dispatch]);

  // Cuando cambia el modo en redux, actualizamos el estado local del modo oscuro
  useEffect(() => {
    dispatch(setModoOscuro(modo === "dark"));
  }, [modo, dispatch]);

  // Aplicamos o removemos la clase "dark" en el elemento root según modoOscuro
  useEffect(() => {
    const root = document.documentElement;
    if (modoOscuro) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [modoOscuro]);

  // Mientras verificamos sesión, mostramos mensaje de carga para evitar renderizar rutas
  if (loading) {
    return <div className="text-center mt-20 text-xl">Verificando sesión...</div>;
  }

  return (
    <Routes>
      {/* Ruta pública para login:
          Si ya está autenticado, redirige al dashboard,
          si no, muestra el componente Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Rutas protegidas por PrivateRoute, que solo permite acceso si está autenticado */}
      <Route element={<PrivateRoute />}>
        {/* Ruta principal Dashboard que funciona como layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Rutas hijas dentro del Dashboard */}

          {/* Ruta index para contenido inicial al entrar a /dashboard
              Puedes usar un componente propio o un mensaje de bienvenida */}
          {/* <Route index element={<div>Bienvenido al dashboard</div>} /> */}

          {/* Ejemplo de ruta hija para usuarios, accesible en /dashboard/usuarios */}
          <Route path="usuarios" element={<FrmUsuarios />} />
          <Route path="asignacion" element={<FrmAsignacion />} />
          <Route path="aulas" element={<FrmAulas />} />
          <Route path="inscripcionesmaterias" element={<FrmInscripcionesMaterias />} />
          <Route path="estados" element={<FrmEstados />} />
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
          <Route path="tipocalificaciones" element={<FrmTipoCalificaciones />} />
          <Route path="transacciones" element={<FrmTransacciones />} />
          <Route path="tipotransacciones" element={<FrmTipoTransacciones />} />
          <Route path="rescate" element={<FrmRescateEvaculacion />} />
          

          { <Route path="aulas" element={<FrmAulas />} />/* Ruta catch-all para cualquier subruta inválida dentro de /dashboard
              Redirige a /dashboard para evitar páginas 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Ruta catch-all para cualquier ruta no encontrada:
          Redirige a /dashboard si está autenticado,
          o a /login si no lo está */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
