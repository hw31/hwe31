import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Main from './layout/Main';            // Layout principal para rutas públicas
import Start from './components/Shared/Start';      // Página pública principal
import Login from './components/Shared/Login';      // Login público
import Loading from './components/Shared/Loading';  // Pantalla de carga
import Dashboard from './components/Shared/Dashboard'; // Layout privado para rutas dentro del dashboard
import PrivateRoute from './routes/PrivateRoute'; // Componente para proteger rutas privadas
import FrmUsuarios from './components/pages/FrmUsuarios';   // Ejemplo formulario privado
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
import FrmTransacciones from './components/pages/FrmTransacciones';


const router = createBrowserRouter([
  {
    element: <Main />,
    children: [
      { path: '/', element: <Start /> },
      { path: '/login', element: <Login /> },
      { path: '/loading', element: <Loading /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,  // Dashboard debe tener <Outlet />
        children: [
          {
            index: true,
            element: <div></div>, // Página por defecto de /dashboard
          },
          {
            path: 'usuarios',
            element: <FrmUsuarios />, // Ruta privada /dashboard/usuarios
          },
           {
            path: 'asignacion',
            element: <FrmAsignacion />,
          },
           {
            path: 'aulas',
            element: <FrmAulas />,
          },
          { path: 'inscripcionesmaterias',
             element: <FrmInscripcionesMaterias />,
          },
          {
            path: 'estados',
            element: <FrmEstados />,
          },
          {
            path: 'catalogos',
            element: <FrmCatalogos />,
          },
          {
            path: 'personas',
            element: <FrmPersonas />,
          },
          {
            path: 'contactos',
            element: <FrmContactos />,
          },
          {
            path: 'roles',
            element: <FrmRoles />,
          },
          {
            path: 'permisos',
            element: <FrmPermisos />,
          },
          {
            path: 'periodos',
            element: <FrmPeriodos />,
          },
          {
            path: 'materias',
            element: <FrmMaterias />,
          },
          {
            path: 'inscripciones',
            element: <FrmInscripciones />,
          },
          {
            path: 'calificaciones',
            element: <FrmCalificaciones />,
          },
          {
            path: 'grupos',
            element: <FrmGrupos />,
          },
         
          {
            path: 'horarios',
            element: <FrmHorarios />,
          },
         
          {
            path: 'tipocalificaciones',
            element: <FrmTipoCalificaciones />,
          },
          {
            path: 'transacciones',
            element: <FrmTransacciones />,
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
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
