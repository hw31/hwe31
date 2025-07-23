import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Main from './layout/Main';            // Layout principal para rutas públicas
import Start from './components/Start';      // Página pública principal
import Login from './components/Login';      // Login público
import Loading from './components/Loading';  // Pantalla de carga
import Dashboard from './components/Dashboard'; // Layout privado para rutas dentro del dashboard

import PrivateRoute from './routes/PrivateRoute'; // Componente para proteger rutas privadas
import FrmUsuarios from './components/pages/FrmUsuarios';   // Ejemplo formulario privado
import FrmAsignacion from "./components/pages/FrmAsignacion";

/* COMENTAR LOS IMPORTS QUE NO SE USAN PARA EVITAR ERRORES SI LOS ARCHIVOS NO EXISTEN
import FrmEstados from './pages/FrmEstados';
import FrmCatalogos from './pages/FrmCatalogos';
import FrmPersonas from './pages/FrmPersonas';
import FrmContactos from './pages/FrmContactos';
import FrmRoles from './pages/FrmRoles';
import FrmPermisos from './pages/FrmPermisos';
import FrmPeriodos from './pages/FrmPeriodos';
import FrmMaterias from './pages/FrmMaterias';
import FrmInscripciones from './pages/FrmInscripciones';
import FrmCalificaciones from './pages/FrmCalificaciones';
import FrmGrupos from './pages/FrmGrupos';
import FrmAulas from './pages/FrmAulas';
import FrmHorarios from './pages/FrmHorarios';

import FrmTipoCalificaciones from './pages/FrmTipoCalificaciones';
import FrmTransacciones from './pages/FrmTransacciones';
import FrmTipoTransacciones from './pages/FrmTipoTransacciones';
*/

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
          /*
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
            path: 'aulas',
            element: <FrmAulas />,
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
            path: 'tipotransacciones',
            element: <FrmTipoTransacciones />,
          },
          */
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
