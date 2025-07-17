import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { Moon, Sun, LogOut, User } from "lucide-react";
import authService from "../services/authService";
import styled from "styled-components";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [persona, setPersona] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const nombre = localStorage.getItem("nombrePersona");
    setPersona(nombre || "Usuario");
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo-container">
          <img src="/images/iconologo.png" alt="CAL-I Logo" className="logo-img" />
          <h1 className="logo-title">CAL-I</h1>
        </div>
        <div className="system-name">
          <p>Sistema de Gestión de Calificaciones</p>
        </div>
      </aside>

      {/* Botón hamburguesa estilizado */}
      <StyledBurgerWrapper>
        <label className="menuButton">
          <input
            type="checkbox"
            checked={sidebarOpen}
            onChange={() => setSidebarOpen((prev) => !prev)}
          />
          <span className="top" />
          <span className="mid" />
          <span className="bot" />
        </label>
      </StyledBurgerWrapper>

      {/* Contenido principal */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <input type="text" placeholder="Buscar..." className="search-input" />
          </div>

          <div className="dashboard-user-controls" ref={dropdownRef}>
            <button
              onClick={toggleTheme}
              className="dashboard-theme-toggle"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="text-yellow-400" />
              ) : (
                <Moon className="text-purple-700" />
              )}
            </button>

            <div>
              <button
                className="dashboard-user-dropdown-button"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <User className="w-5 h-5" />
                <span>{persona}</span>
              </button>

              {showDropdown && (
                <div className="dashboard-user-dropdown">
                  <div className="flex flex-col items-center mb-4">
                    <div className="profile-pic-placeholder"></div>
                    <p className="font-semibold text-lg text-center">{persona}</p>
                    <p>Administrador</p>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut className="inline mr-2" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-welcome">
          <h1>¡Bienvenido a CAL-I, {persona}!</h1>
        </div>
      </main>
    </div>
  );
};

// ⬇️ Estilo para botón hamburguesa
const StyledBurgerWrapper = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;

  .menuButton {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 13%;
    width: 3.5em;
    height: 3.5em;
    border-radius: 0.5em;
    background: #171717;
    border: 1px solid #171717;
    transition: all 0.3s;
    box-shadow: inset 4px 4px 12px #3a3a3a,
                inset -4px -4px 12px #000000;
    cursor: pointer;
  }

  .menuButton:hover {
    border: 1px solid black;
  }

  .menuButton:active {
    box-shadow: 6px 6px 12px #3a3a3a,
                -6px -6px 12px #000000;
  }

  input[type="checkbox"] {
    display: none;
  }

  .menuButton span {
    width: 30px;
    height: 4px;
    background: rgb(200, 200, 200);
    border-radius: 100px;
    transition: 0.3s ease;
  }

  input:checked ~ span.top {
    transform: translateY(290%) rotate(45deg);
    width: 40px;
  }

  input:checked ~ span.bot {
    transform: translateY(-270%) rotate(-45deg);
    width: 40px;
    box-shadow: 0 0 10px #495057;
  }

  input:checked ~ span.mid {
    transform: translateX(-20px);
    opacity: 0;
  }
`;

export default Dashboard;
