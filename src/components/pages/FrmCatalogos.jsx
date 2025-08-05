import React, { useState } from "react";
import { useSelector } from "react-redux";

import Catalogos from "../pages/Catalogos";
import TipoCatalogo from "../pages/TipoCatalogo";
import BuscadorBase from "../Shared/BuscadorBase";

import { ArrowLeftCircle, Book } from "lucide-react";

const FrmCatalogos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("catalogos"); // catalogos | tiposcatalogos

  const botonClase = (color) =>
    `flex items-center gap-2 px-4 py-2 rounded text-white transition font-medium ${color} hover:brightness-110`;

  return (
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
  );
};

export default FrmCatalogos;
