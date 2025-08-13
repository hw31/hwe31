import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun, LogOut, Settings } from "lucide-react";
import authService from "../../services/authService";
import styled from "styled-components";
import DashboardContent from "./DashboardContent";

import { fetchFotoPerfil, selectFotoPerfilUrl } from "../../features/Profile/profileSlice";

import { logout as logoutAction } from "../../features/Auth/authSlice";
import {
  toggleModoOscuro,
  fetchModoOscuro,
  setModoOscuro,
} from "../../features/theme/themeSlice";
import SidebarMenu from "../Shared/SidebarMenu";
import DashboardMenuCards from "../Shared/DashboardMenuCards";

import Checkbox from "../Shared/Checkbox";
import DashboardCards from "./DashboardCards";
const DashboardWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;

  @media (max-width: 767px) {
    margin-top: 4rem; /* más espacio arriba en móvil */
    padding: 0 2rem;  /* más espacio a los lados en móvil */
  }

  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
`;


// AvatarInicial aquí (igual que tienes)

const AvatarInicial = ({ nombre, size = 32 }) => {
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "?";

  const coloresFondo = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const colorIndex = inicial.charCodeAt(0) % coloresFondo.length;
  const bgColor = coloresFondo[colorIndex];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: size / 1.5,
        userSelect: "none",
        textTransform: "uppercase",
      }}
      aria-label={`Avatar de ${nombre}`}
    >
      {inicial}
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const persona = useSelector((state) => state.auth.persona || "Usuario");
  const rol = useSelector((state) => state.auth.rol || "Sin rol");
  const rolLower = rol.toLowerCase();
  const idSesion = useSelector((state) => state.auth.idSesion);
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fotoPerfilUrl = useSelector(selectFotoPerfilUrl);

  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  // Detectar si es escritorio o móvil
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768);

  useEffect(() => {
  if (location.pathname === "/dashboard") {
    if (rolLower === "docente" || rolLower === "estudiante") {
      navigate("/dashboard/calificaciones", { replace: true });
    }
  }
}, [rolLower, location.pathname, navigate]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Forzar actualización inicial

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Abrir o cerrar sidebar automáticamente al cambiar isDesktop
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true); // abierto en desktop
    } else {
      setSidebarOpen(false); // cerrado en móvil
    }
  }, [isDesktop]);

  // Cargar modoOscuro desde persistencia o backend
  useEffect(() => {
    (async () => {
      const modoResponse = await dispatch(fetchModoOscuro());
      if (fetchModoOscuro.fulfilled.match(modoResponse)) {
        dispatch(setModoOscuro(modoResponse.payload));
      } else {
        dispatch(setModoOscuro(false));
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    if (modoOscuro) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [modoOscuro]);

  // Cargar foto perfil con Redux thunk
  useEffect(() => {
    dispatch(fetchFotoPerfil());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      if (idSesion) await authService.logout(idSesion);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  const handleToggleTheme = () => {
    dispatch(toggleModoOscuro(!modoOscuro));
  };

  // Cerrar dropdown si clic fuera
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  // Cerrar sidebar si clic fuera (solo en móvil)
  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsideSidebar);
  }, [sidebarOpen]);

  const [nombre, apellido] = persona.split(" ");

  // Z-indexes para que sidebar y header se superpongan bien en móvil y escritorio
  const sidebarZIndex = isDesktop ? 1200 : 1000;
  const headerZIndex = isDesktop ? 1300 : 1100;

  // Margen main: 0 en móvil para que el contenido ocupe todo el ancho
  const mainMarginLeft = isDesktop
    ? sidebarOpen
      ? "16rem"
      : "4.5rem"
    : "0";

  const mostrarBienvenida = location.pathname === "/dashboard";

  return (
    <div className="dashboard-container" style={{ position: "relative", overflowX: "hidden" }}>
      <aside
        ref={sidebarRef}
        className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: sidebarOpen ? "16rem" : "4.5rem",
          paddingTop: "4rem",
          background: modoOscuro
            ? "linear-gradient(135deg, #2c446e, #1b2a47)"
            : "linear-gradient(135deg, #5a6d8c, #40577a)",
          boxShadow: modoOscuro
            ? "inset 2px 2px 10px rgba(0,0,0,0.9), inset -1px -1px 5px rgba(255,255,255,0.1), 6px 6px 15px rgba(0,0,0,0.8)"
            : "inset 2px 2px 10px rgba(0,0,0,0.3), inset -1px -1px 5px rgba(255,255,255,0.3), 4px 4px 15px rgba(0,0,0,0.3)",
          transition: "width 0.3s ease",
          zIndex: sidebarZIndex,
          overflowX: "hidden",
          color: "white",
          display: "flex",
          flexDirection: "column",
          
        }}
      >
        <SidebarMenu isSidebarOpen={sidebarOpen} />
        <div className="system-name" style={{ marginTop: "auto", padding: "1rem" }}>
          <p>Sistema de Gestión de Calificaciones</p>
        </div>
      </aside>

      <div
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 
          backdrop-blur-md bg-white/10 border-b border-white/20
          ${modoOscuro ? "text-white" : "text-gray-900"}`}
        style={{ height: "4rem", zIndex: headerZIndex }}
      >
        <div ref={toggleRef}>
          <Checkbox
            checked={sidebarOpen}
            onChange={() => setSidebarOpen((prev) => !prev)}
            modoOscuro={modoOscuro}
          />
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/dashboard")}
          style={{ marginTop: "0.4rem", marginLeft: "1rem" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/dashboard");
          }}
        >
          <img
            src="/images/logoicono.webp"
            alt="CAL-I Logo"
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
          />
          <h1 className="font-extrabold text-lg sm:text-3xl tracking-wide hidden sm:block">
            CAL-I
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-4 pr-4 relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={handleToggleTheme}
            aria-label="Cambiar tema"
          >
            {modoOscuro ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-purple-700" />
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard/aulas")}
            className={`p-2 rounded-full transition
              ${
                modoOscuro
                  ? "text-gray-200 hover:text-black dark:hover:text-black"
                  : "text-gray-700 hover:text-gray-900"
              }
              hover:bg-gray-100 dark:hover:bg-gray-700
            `}
            aria-label="Configuración"
          >
            <Settings />
          </button>

          <div>
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              {fotoPerfilUrl ? (
                <img
                  src={fotoPerfilUrl}
                  alt="Foto de perfil"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <AvatarInicial nombre={persona} size={32} />
              )}
              <span className="font-medium">
                {nombre} {apellido}!
              </span>
            </button>

            {showDropdown && (
              <div className="dashboard-user-dropdown" role="menu">
                <div className="flex flex-col items-center mb-4">
                  {fotoPerfilUrl ? (
                    <img
                      src={fotoPerfilUrl}
                      alt="Foto de perfil"
                      className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-md mb-2"
                    />
                  ) : (
                    <AvatarInicial nombre={persona} size={96} />
                  )}
                  <p className="font-semibold text-lg text-center">{persona}</p>
                  <p>{rol}</p>
                </div>
                <button onClick={handleLogout} className="logout-btn" role="menuitem">
                  <LogOut className="inline mr-2" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

   <main
  className={`dashboard-main  ${sidebarOpen ? "" : "sidebar-closed"}`}
  style={{
    marginLeft: mainMarginLeft,
    transition: "margin-left 0.3s ease",
    position: "relative",
    zIndex: 1,
    minHeight: "calc(100vh - 4rem)",
    backgroundColor: modoOscuro ? "#181818" : "#fdfdfdff",
    color: modoOscuro ? "white" : "black",
    maxWidth: "none",       // cambiar esto
    width: "100%",          // agregar esto
    overflowX: "hidden",
    padding: "1rem 1.5rem", // ajustar padding
    paddingTop: "4rem",     // para no tapar contenido con header fijo
    boxSizing: "border-box",
    
  }}
>
  <DashboardContent>
    {mostrarBienvenida && (
      <DashboardWelcome role="region" aria-live="polite">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          ¡Bienvenido, {nombre} {apellido}!
        </h1>

        {rolLower === "administrador" && (
          <div className="flex flex-wrap justify-center gap-6 w-full max-w-screen-xl px-4 md:px-8 mx-auto">
            <DashboardMenuCards className="flex-grow min-w-[280px]" />
            <DashboardCards modoOscuro={modoOscuro} />
          </div>
        )}
      </DashboardWelcome>
    )}

    <Outlet />
  </DashboardContent>
</main>
    </div>
  );
};

export default Dashboard;
