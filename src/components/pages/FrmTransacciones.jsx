import React, { useState } from "react";
import { useSelector } from "react-redux";

import Transacciones from "./Transacciones";
import TipoTransacciones from "./TiposTransacciones"; 
import TransaccionesPermisos from "./TransaccionesPermiso";
import TransaccionesRol from "./TransaccionesRol";

import BuscadorBase from "../Shared/BuscadorBase";

const FrmTransacciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className={`p-4 min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`max-w-7xl mx-auto rounded-2xl shadow-md p-4 transition-all duration-300 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-gray-50 shadow-gray-300"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-4 text-center ${
            modoOscuro ? "text-white" : "text-gray-800"
          }`}
        >
          Gestión de Transacciones y Tipos
        </h2>

        <div className="mb-4">
          <BuscadorBase
            placeholder="Buscar en transacciones y tipos..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <div className="mb-6">
          <Transacciones busqueda={busqueda} />
        </div>

        <div className="mb-6">
          <TipoTransacciones busqueda={busqueda} />
        </div>
        <div className="mb-6">
          <TransaccionesPermisos busqueda={busqueda} />
        </div>
        <div>
          <TransaccionesRol busqueda={busqueda} />
        </div>

      </div>
    </div>
  );
};

export default FrmTransacciones;
