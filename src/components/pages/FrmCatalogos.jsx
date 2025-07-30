import React, { useState } from "react";
import { useSelector } from "react-redux";

import TipoCatalogo from "./TipoCatalogo";
import Catalogos from "./Catalogos";

import BuscadorBase from "../Shared/BuscadorBase";

const FrmCatalogos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className={`p-4 min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`max-w-7xl mx-auto rounded-2xl shadow-md p-4 transition-all duration-300 ${
          modoOscuro
            ? "bg-gray-900 shadow-gray-700"
            : "bg-gray-50 shadow-gray-300"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-4 text-center ${
            modoOscuro ? "text-white" : "text-gray-800"
          }`}
        >
          Gestión de Catálogos y Tipos
        </h2>

        <div className="mb-4">
          <BuscadorBase
            placeholder="Buscar en catálogos y tipos..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <div className="mb-6">
          <TipoCatalogo busqueda={busqueda} />
        </div>

        <div>
          <Catalogos busqueda={busqueda} />
        </div>
      </div>
    </div>
  );
};

export default FrmCatalogos;
