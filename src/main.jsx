import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Main from "./layout/Main";
import Start from "./components/Start";
import Login from "./components/Login";
import Loading from "./components/Loading";
import Dashboard from "./components/Dashboard";

const router = createBrowserRouter([
  {
    element: <Main />,   // Layout para páginas públicas
    children: [
      {
        path: "/",
        element: <Start />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/loading",
        element: <Loading />,
      },
    ],
  },
  {
    path: "/dashboard",   // Ruta fuera de Main para ocupar toda la pantalla
    element: <Dashboard />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);