import React, { useState } from "react";
import { useSelector } from "react-redux";

import FrmUser from "../hijos/User";
import UserRol from "../hijos/UserRol";
import UserPermiso from "../hijos/UserPermiso";
import Personas from "../hijos/Persona";
import Direcciones from "../hijos/Direccion";
import TitulosAcademicos from "../hijos/TitulosAcademicos";
import Contactos from "../hijos/Contacto";
import EstudianteCarrera from "../hijos/EstudianteCarrera";

import BuscadorBase from "../Shared/BuscadorBase";

import FormularioCompleto from "../Shared/WizardPersonas"; // Ajusta ruta

// Iconos
import {
  Users,
  MapPin,
  Phone,
  KeyRound,
  ShieldCheck,
  Award,
  User,
  GraduationCap,
} from "lucide-react";

const FrmPersonasDireccionesContactos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("personas");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const botonClase = (color) =>
    `flex items-center justify-center gap-2 h-12 w-full min-w-[150px] rounded text-sm text-white transition font-medium ${color} hover:brightness-110`;

  // Botón para abrir el formulario
  const botonNuevoRegistro = (
    <button
      onClick={() => setMostrarFormulario(true)}
      className={`mb-4 ${botonClase("bg-indigo-600")}`}
    >
      <Users size={20} /> Nuevo Registro
    </button>
  );

  return (
    <div
      style={{ overflowX: "hidden" }}
      className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${
        modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md p-6 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >
        {!mostrarFormulario && (
          <>
            {/* Botón para nuevo registro */}
            {botonNuevoRegistro}

            {/* Botones de navegación */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {vista !== "personas" && (
                <button
                  onClick={() => setVista("personas")}
                  className={botonClase("bg-indigo-600")}
                >
                  <Users size={20} /> Personas
                </button>
              )}
              {vista !== "direcciones" && (
                <button
                  onClick={() => setVista("direcciones")}
                  className={botonClase("bg-green-600")}
                >
                  <MapPin size={20} /> Direcciones
                </button>
              )}
              {vista !== "contactos" && (
                <button
                  onClick={() => setVista("contactos")}
                  className={botonClase("bg-blue-600")}
                >
                  <Phone size={20} /> Contactos
                </button>
              )}
              {vista !== "titulo" && (
                <button
                  onClick={() => setVista("titulo")}
                  className={botonClase("bg-sky-500")}
                >
                  <Award size={20} /> Título Académico
                </button>
              )}
              {vista !== "usuarios" && (
                <button
                  onClick={() => setVista("usuarios")}
                  className={botonClase("bg-gray-600")}
                >
                  <User size={20} /> Usuarios
                </button>
              )}
              {vista !== "usuariosroles" && (
                <button
                  onClick={() => setVista("usuariosroles")}
                  className={botonClase("bg-green-700")}
                >
                  <KeyRound size={20} /> Usuarios Roles
                </button>
              )}
              {vista !== "estudiantes-carrera" && (
                <button
                  onClick={() => setVista("estudiantes-carrera")}
                  className={botonClase("bg-rose-700")}
                >
                  <GraduationCap size={20} /> Estudiantes-Carrera
                </button>
              )}
              {vista !== "permisos" && (
                <button
                  onClick={() => setVista("permisos")}
                  className={botonClase("bg-purple-700")}
                >
                  <ShieldCheck size={20} /> Usuarios Permisos
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
            <div style={{ overflowX: "auto" }}>
              {vista === "personas" && <Personas busqueda={busqueda} />}
              {vista === "direcciones" && <Direcciones busqueda={busqueda} />}
              {vista === "contactos" && <Contactos busqueda={busqueda} />}
              {vista === "usuarios" && <FrmUser busqueda={busqueda} />}
              {vista === "usuariosroles" && <UserRol busqueda={busqueda} />}
              {vista === "titulo" && <TitulosAcademicos busqueda={busqueda} />}
              {vista === "permisos" && <UserPermiso busqueda={busqueda} />}
              {vista === "estudiantes-carrera" && (
                <EstudianteCarrera busqueda={busqueda} />
              )}
            </div>
          </>
        )}

        {/* Mostrar formulario cuando se activa */}
        {mostrarFormulario && (
          <div>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar Formulario
            </button>
            <FormularioCompleto onCerrar={() => setMostrarFormulario(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FrmPersonasDireccionesContactos;
