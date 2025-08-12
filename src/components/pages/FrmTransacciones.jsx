import React, { useState } from "react";
import { useSelector } from "react-redux";

import Transacciones from "../hijos/Transacciones";
import TipoTransacciones from "../hijos/TiposTransacciones"; 
import TransaccionesPermisos from "../hijos/TransaccionesPermiso";
import TransaccionesRol from "../hijos/TransaccionesRol";

import BuscadorBase from "../Shared/BuscadorBase";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Importa iconos lucide-react
import { ShieldCheck, Users, ListChecks, ArrowLeft } from "lucide-react";

const FrmTransacciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("tipos"); // Por defecto abre TipoTransacciones

  const botonClase = (color, activo) =>
    `px-4 py-2 rounded text-white font-medium mr-2 transition flex items-center gap-2 ${
      activo ? "brightness-125" : "brightness-90 hover:brightness-110"
    } ${color}`;
 const navigate = useNavigate();
  const handleVolver = () => {
    navigate("/dashboard/aulas"); // Ajusta la ruta aquí
  };
  return (
      <>
      <style>{`
        /* Estilos para el botón flotante */
        .btn-volver {
          position: fixed;
          bottom: 20px;
          right: 20px;
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
    <div
      className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${
        modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md p-6 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >
        {vista === "tipos" && (
          <div className="mb-4 flex justify-center flex-wrap gap-2">
            <button
              className={botonClase("bg-green-600", vista === "permisos")}
              onClick={() => setVista("permisos")}
              type="button"
            >
              <ShieldCheck size={25} />
              Transacciones Permisos
            </button>
            <button
              className={botonClase("bg-teal-600", vista === "roles")}
              onClick={() => setVista("roles")}
              type="button"
            >
              <Users size={25} />
              Transacciones Roles
            </button>
          </div>
        )}

        {/* Buscador solo en tipos y permisos */}
        {(vista === "tipos" || vista === "permisos") && (
          <div className="mb-4">
            <BuscadorBase
              placeholder="Buscar..."
              valor={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              modoOscuro={modoOscuro}
            />
          </div>
        )}


        {/* Botón Volver visible en todas las vistas excepto "tipos" */}
        {vista !== "tipos" && (
          <button
            onClick={() => setVista("tipos")}
            className="mb-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1"
            type="button"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        )}

        {/* Contenido dinámico según vista */}
        <div>
          {vista === "tipos" && <TipoTransacciones busqueda={busqueda} />}
          {vista === "permisos" && <TransaccionesPermisos busqueda={busqueda} />}
          {vista === "roles" && <TransaccionesRol busqueda={busqueda} />}
        </div>
      </div>
    </div>
         {/* Botón flotante volver */}
                      <button
                        className="btn-volver"
                        onClick={handleVolver}
                        aria-label="Volver"
                        title="Volver"
                      >
                        <ArrowLeftCircle size={24} />
                      </button>
                    </>
  );
};

export default FrmTransacciones;
