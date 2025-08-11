import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Shield,
  Key,
  FileText,
  User,
  Info,
  ToggleRight,
  ArrowLeftCircle,
} from "lucide-react"; // Importamos un ícono para el botón volver

const Menusetting = () => {
  const navigate = useNavigate();
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol || "").toLowerCase();

  const botonesFijos = [
    {
      id: "editarperfil",
      nombre: "Perfil",
      ruta: "tipoCalificacion",
      Icon: User,
    },
    {
      id: "about",
      nombre: "About",
      ruta: "contactos",
      Icon: Info,
    },
    {
      id: "estado",
      nombre: "Estado",
      ruta: "estados",
      Icon: ToggleRight,
    },
    {
      id: "permisos",
      nombre: "Permisos",
      ruta: "permisos",
      Icon: Shield,
    },
    {
      id: "roles",
      nombre: "Roles",
      ruta: "roles",
      Icon: Key,
    },
    {
      id: "catalogos",
      nombre: "Catálogos",
      ruta: "catalogos",
      Icon: FileText,
    },
    {
      id: "transacciones",
      nombre: "Transacciones",
      ruta: "transacciones",
      Icon: FileText,
    },
  ];

  return (
    <>
      <style>{`
        .auto-fit-grid {
          display: grid;
          gap: 1.2rem 1.5rem;
          grid-template-columns: repeat(3, max-content);
          justify-content: center;
        }
        @media (max-width: 767px) {
          .auto-fit-grid {
            grid-template-columns: repeat(2, max-content);
            gap: 1rem 1rem;
            justify-content: center;
          }
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.8rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.15s ease;
          white-space: nowrap;
          border: 1px solid;
          user-select: none;
          max-width: 160px;
          width: 160px;
          height: 110px;
          text-align: center;
        }
        .card-text {
          font-weight: 600;
          font-size: 1rem;
          margin-top: 0.4rem;
        }
        @media (max-width: 767px) {
          .card {
            max-width: 140px;
            width: 140px;
            height: 90px;
            padding: 0.6rem 0.8rem;
          }
          .card-text {
            font-size: 0.85rem;
          }
          .card svg {
            width: 22px;
            height: 22px;
          }
        }
        .dark {
          background-color: #1e293b;
          color: #f9fafb;
          border-color: #475569;
        }
        .light {
          background-color: #fff;
          color: #111827;
          border-color: #d1d5db;
        }

        /* Estilos para el botón flotante */
        .btn-volver {
          position: fixed;
          bottom: 20px;
          right: 20px; /* Cambia a left: 20px; si prefieres a la izquierda */
          background-color: ${modoOscuro ? "#334155" : "#f3f4f6"};
          color: ${modoOscuro ? "#a5f3fc" : "#2563eb"};
          border: none;
          border-radius: 50%;
          padding: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          z-index: 1000;
        }
        .btn-volver:hover {
          background-color: ${modoOscuro ? "#475569" : "#60a5fa"};
          color: white;
        }
      `}</style>

      <div className="w-full px-4 mt-16 md:mt-20 auto-fit-grid">
        {botonesFijos.map(({ id, nombre, ruta, Icon }) => {
          if (
            ["permisos", "roles", "catalogos", "estado", "transacciones"].includes(id) &&
            rol !== "administrador"
          )
            return null;

          return (
            <div
              key={id}
              onClick={() => navigate(`/dashboard/${ruta}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/dashboard/${ruta}`);
              }}
              aria-label={nombre}
              title={nombre}
              className={`card ${modoOscuro ? "dark" : "light"}`}
            >
              {Icon && (
                <Icon
                  className={`w-8 h-8 ${
                    modoOscuro ? "text-teal-300" : "text-blue-600"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span className="card-text">{nombre}</span>
            </div>
          );
        })}
      </div>

      {/* Botón flotante para volver */}
      <button
        className="btn-volver"
        aria-label="Volver al menú de configuración"
        title="Volver"
        onClick={() => navigate("/dashboard/setting")} // Cambia la ruta si es diferente
      >
        <ArrowLeftCircle size={28} />
      </button>
    </>
  );
};

export default Menusetting;
