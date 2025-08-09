import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Shield,
  Key,
  FileText,
  User,
  Info,
} from "lucide-react";

const Menusetting = () => {
  const navigate = useNavigate();
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol || "").toLowerCase();

  const botonesFijos = [
    {
      id: "editarperfil",
      nombre: "Editar Perfil",
      ruta: "editarperfil",
      Icon: User,
    },
    {
      id: "about",
      nombre: "About",
      ruta: "contactos",
      Icon: Info,
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
  ];

  return (
    <>
      <style>{`
        .auto-fit-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, 1fr);
         
        }
        @media (min-width: 1024px) {
          .auto-fit-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: transform 0.2s ease;
          white-space: nowrap;
          border: 1px solid;
          user-select: none;
        }
        .card:hover, .card:focus-visible {
          transform: scale(1.05);
          z-index: 10;
          position: relative;
        }
        .card-text {
          font-weight: 600;
          font-size: 0.875rem;
          text-align: center;
        }
        @media (max-width: 767px) {
          .card {
            padding: 0.5rem 0.75rem;
          }
          .card svg {
            width: 24px;
            height: 24px;
          }
          .card-text {
            font-size: 0.75rem;
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
      `}</style>

      <div className="w-full px-4 mt-16 md:mt-20 auto-fit-grid">
        {botonesFijos.map(({ id, nombre, ruta, Icon }) => {
          if (
            ["permisos", "roles", "catalogos"].includes(id) &&
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
    </>
  );
};

export default Menusetting;
