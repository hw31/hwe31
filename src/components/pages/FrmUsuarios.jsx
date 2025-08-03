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
  const [soloUser, setSoloUser] = useState(false); // Estado para alternar vista

  return (
<div
  className={`mx-auto rounded-2xl p-1 max-w-[900px] w-full ${
    modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  }`}
>
    
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md rounded-xl p-6  ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >

        <div className="flex justify-between items-center mb-4">
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
            
          />

          <button
            onClick={() => setSoloUser(!soloUser)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${
              modoOscuro
                ? "bg-teal-800 text-white hover:bg-teal-700"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            {soloUser ? <ArrowLeft size={18} /> : <Users size={18} />}
            {soloUser ? "Volver" : "Ver solo usuario"}
          </button>
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
