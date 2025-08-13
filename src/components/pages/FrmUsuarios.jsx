import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import FrmUser from "../hijos/User";
import UserRol from "../hijos/UserRol";
import UserPermiso from "../hijos/UserPermiso";
import EstudianteCarrera from "../hijos/EstudianteCarrera";
import BuscadorBase from "../Shared/BuscadorBase";
import { KeyRound, GraduationCap, ShieldCheck,User } from "lucide-react";

const FrmUsuarios = ({ busqueda = "", onResultados }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [vista, setVista] = useState("usuarios");

  // Estados para saber si cada hijo tiene resultados
  const [resUsuarios, setResUsuarios] = useState(true);
  const [resRoles, setResRoles] = useState(true);
  const [resPermisos, setResPermisos] = useState(true);
  const [resEstudiantesCarrera, setResEstudiantesCarrera] = useState(true);

  // Determinar si hay algún resultado en cualquiera de los hijos
  const hayResultados =
    resUsuarios || resRoles || resPermisos || resEstudiantesCarrera;

  useEffect(() => {
    if (typeof onResultados === "function") {
      onResultados(hayResultados);
    }
  }, [hayResultados, onResultados]);

const botonClase = (color) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded text-white transition font-medium text-base ${color} hover:brightness-110`;

  if (busqueda.trim() !== "") {
    return (
      <div>
        <FrmUser busqueda={busqueda} onResultados={setResUsuarios} />
        <UserRol busqueda={busqueda} onResultados={setResRoles} />
        <UserPermiso busqueda={busqueda} onResultados={setResPermisos} />
        <EstudianteCarrera
          busqueda={busqueda}
          onResultados={setResEstudiantesCarrera}
        />
      </div>
    );
  }

  return (
   <>
        {/* Botones para cambiar vista */}
        <div className="flex flex-wrap gap-3 justify-end mb-6">
          {vista !== "usuarios" && (
            <button
              onClick={() => setVista("usuarios")}
              className={botonClase("bg-blue-600")}
            >
               <User size={18} /> Usuarios
            </button>
          )}

          {vista !== "usuariosroles" && (
            <button
              onClick={() => setVista("usuariosroles")}
              className={botonClase("bg-green-600")}
            >
              <KeyRound size={18} /> Usuarios Roles
            </button>
          )}

          {vista !== "permisos" && (
            <button
              onClick={() => setVista("permisos")}
              className={botonClase("bg-rose-600")}
            >
              <ShieldCheck size={18} /> Usuarios Permiso
            </button>
          )}

          {vista !== "estudiantes-carrera" && (
            <button
              onClick={() => setVista("estudiantes-carrera")}
              className={botonClase("bg-purple-600")}
            >
              <GraduationCap size={18} /> Estudiantes Carrera
            </button>
          )}
        </div>

        

        {/* Mostrar solo el hijo correspondiente */}
        {vista === "usuarios" && (
          <FrmUser busqueda={busqueda} onResultados={setResUsuarios} />
        )}
        {vista === "usuariosroles" && (
          <UserRol busqueda={busqueda} onResultados={setResRoles} />
        )}
        {vista === "permisos" && (
          <UserPermiso busqueda={busqueda} onResultados={setResPermisos} />
        )}
        {vista === "estudiantes-carrera" && (
          <EstudianteCarrera
            busqueda={busqueda}
            onResultados={setResEstudiantesCarrera}
          />
        )}
   </>
  );
};

export default FrmUsuarios;
