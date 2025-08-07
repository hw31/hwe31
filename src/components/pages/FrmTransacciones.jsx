import React, { useState } from "react";
import { useSelector } from "react-redux";

import Transacciones from "./Transacciones";
import TipoTransacciones from "./TiposTransacciones"; 
import TransaccionesPermisos from "./TransaccionesPermiso";
import TransaccionesRol from "./TransaccionesRol";

import BuscadorBase from "../Shared/BuscadorBase";

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
  );
};

export default FrmTransacciones;
