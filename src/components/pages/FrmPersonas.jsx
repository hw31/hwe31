import React, { useState } from "react";
import { useSelector } from "react-redux";

import FrmUser from "../hijos/User";
import UserRol from "../hijos/UserRol";
import UserPermiso from "../hijos/UserPermiso";
import Personas from "../hijos/Persona";
import Direcciones from "../hijos/Direccion";
import Contactos from "../hijos/Contacto";
import BuscadorBase from "../Shared/BuscadorBase";

// Iconos
import { Users, MapPin, Phone, KeyRound, ShieldCheck } from "lucide-react";

const FrmPersonasDireccionesContactos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("personas");

const botonClase = (color) =>
  `flex items-center justify-center gap-2 w-32 h-10 rounded text-sm text-white transition font-medium ${color} hover:brightness-110`;

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
        <h2
          className={`text-2xl font-bold mb-6 text-center ${
            modoOscuro ? "text-white" : "text-gray-800"
          }`}
        >
          Gestión de Personas, Direcciones y Contactos
        </h2>

        {/* Botones de navegación - centrados */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {vista !== "personas" && (
            <button onClick={() => setVista("personas")} className={botonClase("bg-indigo-600")}>
              <Users size={16} /> Personas
            </button>
          )}
          {vista !== "direcciones" && (
            <button onClick={() => setVista("direcciones")} className={botonClase("bg-green-600")}>
              <MapPin size={16} /> Direcciones
            </button>
          )}
          {vista !== "contactos" && (
            <button onClick={() => setVista("contactos")} className={botonClase("bg-blue-600")}>
              <Phone size={16} /> Contactos
            </button>
          )}
          {vista !== "usuarios" && (
            <button onClick={() => setVista("usuarios")} className={botonClase("bg-gray-600")}>
              <Users size={16} /> Usuarios
            </button>
          )}
          {vista !== "usuariosroles" && (
            <button onClick={() => setVista("usuariosroles")} className={botonClase("bg-green-700")}>
              <KeyRound size={16} /> Usuarios Roles
            </button>
          )}
          {vista !== "permisos" && (
            <button onClick={() => setVista("permisos")} className={botonClase("bg-rose-600")}>
              <ShieldCheck size={16} /> Permisos
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="mb-5">
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        {/* Contenido dinámico */}
        {vista === "personas" && <Personas busqueda={busqueda} />}
        {vista === "direcciones" && <Direcciones busqueda={busqueda} />}
        {vista === "contactos" && <Contactos busqueda={busqueda} />}
        {vista === "usuarios" && <FrmUser busqueda={busqueda} />}
        {vista === "usuariosroles" && <UserRol busqueda={busqueda} />}
        {vista === "permisos" && <UserPermiso busqueda={busqueda} />}
      </div>
    </div>
  );
};

export default FrmPersonasDireccionesContactos;
