import React, { useState } from "react";
import { useSelector } from "react-redux";
import FrmPersonas from "../hijos/Persona";
import FrmUser from "../hijos/User";

import FrmContacto from "../hijos/Contacto";
import BuscadorBase from "../Shared/BuscadorBase";
import UserRol from "../hijos//UserRol";
import UserPermiso from "../hijos//UserPermiso";
import { Users, ArrowLeft } from "lucide-react"; // Iconos

import FrmDireccion from "../hijos/Direccion";


const FrmUsuarios = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("usuarios"); // usuarios | usuariosroles | permisos

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
          {vista !== "usuarios" && (
            <button
              onClick={() => setVista("usuarios")}
              className={botonClase("bg-gray-600")}
            >
              <ArrowLeftCircle size={18} /> Volver
            </button>
          )}

          {vista !== "usuariosroles" && (
            <button
              onClick={() => setVista("usuariosroles")}
              className={botonClase("bg-green-600")}
            >
              <KeyRound size={18} /> Ver Usuarios-Roles
            </button>
          )}

          {vista !== "permisos" && (
            <button
              onClick={() => setVista("permisos")}
              className={botonClase("bg-rose-600")}
            >
              <ShieldCheck size={18} /> Ver Permisos
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

        {soloUser ? (
          <FrmUser busqueda={busqueda} />
        ) : (
          <>
           <FrmDireccion />
            <FrmPersonas busqueda={busqueda} />
            <FrmContacto busqueda={busqueda} />
            <FrmUser busqueda={busqueda} />
            <UserRol busqueda={busqueda} />
            <UserPermiso busqueda={busqueda} />
          </>
        )}
      </div>
    </div>
  );
};

export default FrmUsuarios;
