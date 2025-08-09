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
} from "lucide-react";

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
      ruta: "estados",  // <-- Aquí cambié la ruta a frmestados
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
  ];

  return (
    <>
  <style>{`
    .auto-fit-grid {
      display: grid;
      gap: 1.8rem 2rem; /* más espacio vertical y horizontal */
      grid-template-columns: repeat(3, max-content);
      justify-content: center;
    }
    @media (max-width: 767px) {
      .auto-fit-grid {
        grid-template-columns: repeat(2, max-content);
        gap: 1.5rem 1.5rem;
        justify-content: center;
      }
    }
   .card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;   /* Centrar verticalmente */
  padding: 1rem 1.25rem;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: transform 0.15s ease;
  white-space: nowrap;
  border: 1px solid;
  user-select: none;
  max-width: 220px;
  width: 220px;              /* ancho fijo */
  height: 140px;             /* alto fijo */
  text-align: center;
}

.card-text {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.6rem;        /* espacio entre icono y texto */
}

/* Ajustes responsivos */
@media (max-width: 767px) {
  .card {
    max-width: 180px;
    width: 180px;            /* ancho fijo responsivo */
    height: 120px;           /* alto fijo responsivo */
  }
  .card-text {
    font-size: 0.95rem;
  }
  .card svg {
    width: 26px;
    height: 26px;
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
            ["permisos", "roles", "catalogos", "estado"].includes(id) &&
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
