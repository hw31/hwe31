import React, { useState } from "react";
import { useSelector } from "react-redux";

import Catalogos from "../hijos/Catalogos";
import TipoCatalogo from "../hijos/TipoCatalogo";
import BuscadorBase from "../Shared/BuscadorBase";

import { ArrowLeftCircle, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
const FrmCatalogos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("catalogos"); // catalogos | tiposcatalogos

  const botonClase = (color) =>
    `flex items-center gap-2 px-4 py-2 rounded text-white transition font-medium ${color} hover:brightness-110`;
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
        {/* Botones navegación */}
        <div className="flex flex-wrap gap-3 justify-end mb-6">
          {vista !== "catalogos" && (
            <button
              onClick={() => setVista("catalogos")}
              className={botonClase("bg-gray-600")}
            >
              <ArrowLeftCircle size={18} /> Volver
            </button>
          )}

          {vista !== "tiposcatalogos" && (
            <button
              onClick={() => setVista("tiposcatalogos")}
              className={botonClase("bg-green-600")}
            >
              <Book size={18} /> Ver tipos de catálogos
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        {/* Contenido según vista */}
        {vista === "catalogos" && <Catalogos busqueda={busqueda} />}
        {vista === "tiposcatalogos" && <TipoCatalogo busqueda={busqueda} />}
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

export default FrmCatalogos;
