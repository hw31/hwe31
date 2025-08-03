import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import Main from './layout/Main';
import Dashboard from './components/Shared/Dashboard';

// Rutas públicas
import Start from './components/Shared/Start';
import Login from './components/Shared/Login';
import Loading from './components/Shared/Loading';

// Rutas privadas protegidas
import PrivateRoute from './routes/PrivateRoute';

// Componentes de páginas
import FrmUsuarios from './components/pages/FrmUsuarios';
import FrmAsignacion from "./components/pages/FrmAsignacion";
import FrmAulas from './components/pages/FrmAulas';
import FrmInscripcionesMaterias from './components/pages/FrmInscripcionesMaterias';
import FrmEstados from './components/pages/FrmEstados';
import FrmCatalogos from './components/pages/FrmCatalogos';
import FrmPersonas from './components/pages/FrmPersonas';
import FrmContactos from './components/pages/FrmContacto';
import FrmRoles from './components/pages/FrmRoles';
import FrmPermisos from './components/pages/FrmPermisos';
import FrmPeriodos from './components/pages/FrmPeriodoAcademico';
import FrmMaterias from './components/pages/FrmMaterias';
import FrmInscripciones from './components/pages/FrmInscripcion';
import FrmCalificaciones from './components/pages/FrmCalificaciones';
import FrmGrupos from './components/pages/FrmGrupos';
import FrmHorarios from './components/pages/FrmHorarios';
import FrmTipoCalificaciones from './components/pages/FrmTipoCalificacion';
import FrmTransaccionRol from './components/pages/FrmTransaccionRol';
import FrmTransacciones from './components/pages/FrmTransacciones';
import FrmRescateEvaluacion from './components/pages/FrmRescateEvaluacion';

const router = createBrowserRouter([
  // Rutas públicas
  {
    element: <Main />,
    children: [
      { path: '/', element: <Start /> },
      { path: '/login', element: <Login /> },
      { path: '/loading', element: <Loading /> },
    ],
  },

  // Rutas privadas
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />, // Este debe contener <Outlet /> en su definición
        children: [
          { index: true, element: <div></div> }, // Página por defecto (puedes cambiarla)
          { path: 'usuarios', element: <FrmUsuarios /> },
          { path: 'asignacion', element: <FrmAsignacion /> },
          { path: 'aulas', element: <FrmAulas /> },
          { path: 'inscripcionesmaterias', element: <FrmInscripcionesMaterias /> },
          { path: 'estados', element: <FrmEstados /> },
          { path: 'catalogos', element: <FrmCatalogos /> },
          { path: 'personas', element: <FrmPersonas /> },
          { path: 'contactos', element: <FrmContactos /> },
          { path: 'roles', element: <FrmRoles /> },
          { path: 'permisos', element: <FrmPermisos /> },
          { path: 'periodos', element: <FrmPeriodos /> },
          { path: 'materias', element: <FrmMaterias /> },
          { path: 'inscripciones', element: <FrmInscripciones /> },
          { path: 'calificaciones', element: <FrmCalificaciones /> },
          { path: 'grupos', element: <FrmGrupos /> },
          { path: 'horarios', element: <FrmHorarios /> },
          { path: 'tipocalificacion', element: <FrmTipoCalificaciones /> },
          { path: 'transacciones', element: <FrmTransacciones /> },
          { path: 'rescate', element: <FrmRescateEvaluacion /> },
          {path:  'transaccionrol', element:<FrmTransaccionRol/>},
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },

  // Catch-all para rutas no definidas
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
