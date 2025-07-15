import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Main from './layout/Main';
import Start from './components/Start';
import Login from './components/Login';
import Loading from './components/Loading';
import Dashboard from './components/Dashboard';


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
    path: '/dashboard',
    element: <Dashboard />,
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
