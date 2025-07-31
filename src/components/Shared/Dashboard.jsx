import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun, LogOut, User } from "lucide-react";
import authService from "../../services/authService";
import styled from "styled-components";
import { logout as logoutAction } from "../../features/Auth/authSlice";
import { toggleModoOscuro, fetchModoOscuro, setModoOscuro } from "../../features/theme/themeSlice";
import SidebarMenu from "../Shared/SidebarMenu";
import DashboardMenuCards from "../Shared/DashboardMenuCards";
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
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

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

  // Cerrar sidebar si clic fuera (solo en pantallas pequeñas)
  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsideSidebar);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
console.log(`rol: ${rol} rolLower: ${rolLower}`);


   return (
    <div className="dashboard-container">
      <aside
        ref={sidebarRef}
        className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}
      >
        <div className="logo-container">
          <img src="/images/iconologo.png" alt="CAL-I Logo" className="logo-img" />
          {sidebarOpen && <h1 className="logo-title">CAL-I</h1>}
        </div>
        <SidebarMenu isSidebarOpen={sidebarOpen} />
        <div className="system-name">
          <p>Sistema de Gestión de Calificaciones</p>
        </div>
      </aside>

      <StyledBurgerWrapper $sidebarOpen={sidebarOpen}>
        <label className="menuButton" aria-label="Toggle sidebar menu">
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

      <main className={`dashboard-main ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="dashboard-header" style={{ justifyContent: "flex-end" }}>
          <div className="dashboard-user-controls" ref={dropdownRef}>
            <button
  onClick={handleToggleTheme}
  className="dashboard-theme-toggle"
  aria-label="Toggle theme"
  title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
  style={{
    position: "relative",
    zIndex: 1000, // asegúrate que esté encima
    background: "transparent", // opcional
  }}
>

              {modoOscuro ? (
                <Sun className="text-yellow-400" />
              ) : (
                <Moon className="text-purple-700" />
              )}
            </button>

            <div>
              <button
                className="dashboard-user-dropdown-button"
                onClick={() => setShowDropdown((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={showDropdown}
              >
                <User className="w-5 h-5" />
                <span>{persona}</span>
              </button>

              {showDropdown && (
                <div className="dashboard-user-dropdown" role="menu" aria-label="User menu">
                  <div className="flex flex-col items-center mb-4">
                    <div className="profile-pic-placeholder" aria-hidden="true" />
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

{mostrarBienvenida && (
 <div className="dashboard-welcome flex flex-col items-center" role="region" aria-live="polite">

 <h1
  className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis sm:max-w-full"
>
  ¡Bienvenido, {persona}!
</h1>

  {rolLower === "administrador" && <DashboardMenuCards />}
</div>

)}


<style>{`
   @media (max-width: 767px) {
  .dashboard-welcome {
    padding-top: 4rem; /* 64px */
  }
}
@media (min-width: 768px) {
  .dashboard-welcome {
    padding-top: 1rem; /* 16px */
  }
}

`}</style>


        <Outlet />
      </main>
    </div>
  );
};

const StyledBurgerWrapper = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;

  .menuButton {
    display: flex;
    margin-left: ${(props) => (props.$sidebarOpen ? "16rem" : "4.5rem")};
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 13%;
    width: 3em;
    height: 3em;
    border-radius: 0.5em;
    background: #171717;
    border: 1px solid #171717;
    transition: all 0.3s;
    box-shadow: inset 4px 4px 12px #3a3a3a, inset -4px -4px 12px #000000;
    cursor: pointer;
  }

  .menuButton:hover {
    border: 1px solid black;
  }

  .menuButton:active {

    box-shadow: 6px 6px 12px #3a3a3a, -6px -6px 12px #000000;
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