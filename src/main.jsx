import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store"; 

// Componentes
import Main from "./layout/Main";
import Start from "./components/Start";
import Login from "./components/Login";
import Loading from "./components/Loading";
import Dashboard from "./components/Dashboard";

// Definición del enrutador
const router = createBrowserRouter([
  {
    element: <Main />,
    children: [
      { path: "/", element: <Start /> },
      { path: "/login", element: <Login /> },
      { path: "/loading", element: <Loading /> },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

// Render principal con Redux Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
