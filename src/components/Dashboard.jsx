import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../features/auth/authSlice";
import authService from "../services/authService";
import { Moon, Sun, LogOut, User } from "lucide-react";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const persona = useSelector((state) => state.auth.persona);
  const idSesion = useSelector((state) => state.auth.idSesion);
  const estado = useSelector((state) => state.auth.estado); // si ya lo estás pasando

  
  const handleLogout = async () => {
    try {
      if (idSesion) await authService.logout(idSesion);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    dispatch(logoutAction()); // limpia Redux
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Cierra dropdown al hacer click fuera
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

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-purple-700 text-white p-6 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center space-x-6 mb-10">
            <img src="/images/logo.png" alt="CAL-I Logo" className="w-20 h-20 rounded-full" />
            <h1 className="text-4xl font-bold tracking-wide">CAL-I</h1>
          </div>
        </div>
        <div className="text-sm text-center">
          <p className="font-light">Sistema de Gestión de Calificaciones</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-1/2 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-4" ref={dropdownRef}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-purple-700" />}
            </button>

            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">{persona || "Usuario"}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl p-4 z-10">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mb-2"></div>
                    <p className="font-semibold text-lg text-center">{persona || "Usuario"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Estado:{" "}
                      <span className={estado === 1 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                        {estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-full font-semibold transition"
                  >
                    <LogOut className="inline mr-2" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-grow flex items-center justify-center">
          <h1 className="text-3xl font-bold text-center">
            ¡Bienvenido a CAL-I, {persona || "Usuario"}!
          </h1>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
