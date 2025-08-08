import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun, LogOut } from "lucide-react";
import authService from "../../services/authService";
import styled from "styled-components";
import fotoService from "../../services/Profile"; // <- IMPORTANTE
import { logout as logoutAction } from "../../features/Auth/authSlice";
import { toggleModoOscuro, fetchModoOscuro, setModoOscuro } from "../../features/theme/themeSlice";
import SidebarMenu from "../Shared/SidebarMenu";
import DashboardMenuCards from "../Shared/DashboardMenuCards";
import Checkbox from "../Shared/Checkbox"; // <-- Importa el toggle personalizado

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const persona = useSelector((state) => state.auth.persona || "Usuario");
  const rol = useSelector((state) => state.auth.rol || "Sin rol");
  const rolLower = rol.toLowerCase();
  const idSesion = useSelector((state) => state.auth.idSesion);
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null); // Referencia para el toggle hamburguesa

  const mostrarBienvenida = location.pathname === "/dashboard";

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

  useEffect(() => {
    const obtenerFoto = async () => {
      try {
        const data = await fotoService.obtenerMiFoto();
        if (data.success && data.ruta) {
          setFotoPerfilUrl(`http://localhost:5292${data.ruta}`);
        }
      } catch (error) {
        console.error("Error al cargar la foto de perfil:", error);
      }
    };

    obtenerFoto();
  }, []);

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

  // Cerrar dropdown usuario si clickeas fuera
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  // Cerrar sidebar si clickeas fuera DEL SIDEBAR y DEL TOGGLE
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

  // Ajustar sidebar según ancho de ventana
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container" style={{ position: "relative" }}>
      {/* SIDEBAR */}
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
      ? "linear-gradient(135deg, #2c446e, #1b2a47)"  // gradiente azul oscuro tipo login
      : "linear-gradient(135deg, #5a6d8c, #40577a)",  // gradiente claro azulado
    boxShadow: modoOscuro
      ? "inset 2px 2px 10px rgba(0,0,0,0.9), inset -1px -1px 5px rgba(255,255,255,0.1), 6px 6px 15px rgba(0,0,0,0.8)"
      : "inset 2px 2px 10px rgba(0,0,0,0.3), inset -1px -1px 5px rgba(255,255,255,0.3), 4px 4px 15px rgba(0,0,0,0.3)",
    transition: "width 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
    zIndex: 1200,
    overflowX: "hidden",
    color: modoOscuro ? "white" : "white",
    display: "flex",
    flexDirection: "column",
  }}
>

      
        <SidebarMenu isSidebarOpen={sidebarOpen} />
        <div className="system-name" style={{ marginTop: "auto", padding: "1rem" }}>
          <p>Sistema de Gestión de Calificaciones</p>
        </div>
      </aside>

      {/* PANEL SUPERIOR */}
      <div
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 
          backdrop-blur-md bg-white/10 border-b border-white/20
          ${modoOscuro ? "text-white" : "text-gray-900"} transition-all duration-300`}
        style={{
          height: "4rem",
          zIndex: 1300, // MÁS ALTO que sidebar para que quede ENCIMA
        }}
      >
        {/* Toggle hamburguesa */}
        <div ref={toggleRef}>
          <Checkbox
            checked={sidebarOpen}
            onChange={() => setSidebarOpen((prev) => !prev)}
            modoOscuro={modoOscuro}
          />
        </div>
          <div className="logo-container" style={{ marginTop: "1rem", textAlign: "center" }}>
          <img src="/images/iconologo.png" alt="CAL-I Logo" className="logo-img" />
          <h1 className="logo-title">CAL-I</h1>
        </div>

        <div className="ml-auto flex items-center gap-4 pr-4 relative" ref={dropdownRef}>
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Cambiar tema"
            title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {modoOscuro ? <Sun className="text-yellow-400" /> : <Moon className="text-purple-700" />}
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
                <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
              )}
              <span className="font-medium">{persona}</span>
            </button>

            {showDropdown && (
              <div className="dashboard-user-dropdown" role="menu" aria-label="User menu">
                <div className="flex flex-col items-center mb-4">
                  {fotoPerfilUrl ? (
                    <img
                      src={fotoPerfilUrl}
                      alt="Foto de perfil"
                      className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-md mb-2"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full bg-gray-300 animate-pulse mb-2"
                      aria-hidden="true"
                    />
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`dashboard-main pt-16 ${sidebarOpen ? "" : "sidebar-closed"}`}
        style={{
          marginLeft: sidebarOpen ? "16rem" : "4.5rem",
          transition: "margin-left 0.3s ease",
          position: "relative",
          zIndex: 1, // Debajo del panel superior y sidebar
          minHeight: "100vh",
          backgroundColor: modoOscuro ? "#181818" : "#fafafa",
          color: modoOscuro ? "white" : "black",
        }}
      >
        {mostrarBienvenida && (
          <div
            className="dashboard-welcome flex flex-col items-center"
            role="region"
            aria-live="polite"
            style={{ paddingTop: "6rem" }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis sm:max-w-full">
              ¡Bienvenido, {persona}!
            </h1>
            {rolLower === "administrador" && <DashboardMenuCards />}
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
