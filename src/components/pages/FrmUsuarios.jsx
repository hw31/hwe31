import React, { useState } from "react";
import { useSelector } from "react-redux";
import FrmPersonas from "./Persona";
import FrmUser from "./User";
import FrmContacto from "./Contacto";
import BuscadorBase from "../Shared/BuscadorBase";
import UserRol from "./UserRol";
import UserPermiso from "./UserPermiso";

const FrmUsuarios = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");

  return (
    <div
      className={`min-h-screen w-full px-4 sm:px-6 lg:px-8 py-4 ${
        modoOscuro ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md p-4 sm:p-6 transition-all duration-300 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >
        <div className="mb-4">
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <FrmPersonas busqueda={busqueda} />
        <FrmContacto busqueda={busqueda} />
        <FrmUser busqueda={busqueda} />
        <UserRol busqueda={busqueda} />
        <UserPermiso busqueda={busqueda} />
      </div>
    </div>
  );
};

export default FrmUsuarios;
