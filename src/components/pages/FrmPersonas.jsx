import React, { useState } from "react";
import { useSelector } from "react-redux";

import UserRol from "../hijos/UserRol";
import UserPermiso from "../hijos/UserPermiso";
import Personas from "../hijos/Persona";
import Direcciones from "../hijos/Direccion";
import TitulosAcademicos from "../hijos/TitulosAcademicos";
import Contactos from "../hijos/Contacto";
import EstudianteCarrera from "../hijos/EstudianteCarrera";
import FrmUsuarios from "../pages/FrmUsuarios";
import FormularioCompleto from "../Shared/WizardPersonas";

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

// Componente básico para búsqueda (puedes mejorar este)
const BuscadorBase = ({ busqueda, setBusqueda, modoOscuro }) => {
  return (
    <input
      type="text"
      placeholder="Buscar..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className={`w-full px-4 py-2 mb-6 border rounded ${
        modoOscuro
          ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
          : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
      }`}
      autoFocus
    />
  );
};

const FrmPersonasDireccionesContactos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("personas");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [resultadosVisibles, setResultadosVisibles] = useState({
    personas: false,
    direcciones: false,
    contactos: false,
    usuarios: false,
    usuariosroles: false,
    titulo: false,
    permisos: false,
    estudiantesCarrera: false,
  });

const botonClase = (color) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded text-white transition font-medium text-base ${color} hover:brightness-110`;

  // Actualiza visibilidad de resultados según los hijos
  const onResultados = (clave) => (tieneResultados) => {
    setResultadosVisibles((prev) => {
      if (prev[clave] === tieneResultados) return prev;
      return { ...prev, [clave]: tieneResultados };
    });
  };

const botonNuevoRegistro = (
  <button
    onClick={() => setMostrarFormulario(true)}
    className="mb-4 font-semibold h-12 w-full min-w-[150px] rounded flex items-center justify-center gap-2"
    style={{
      background: modoOscuro
        ? "linear-gradient(135deg, #0f0f0fff, #006600, #0f0f0fff)"
        : "linear-gradient(135deg, #0f0f0fff, #006600, #0f0f0fff)",
      boxShadow: modoOscuro
        ? "0 3px 8px rgba(120, 180, 50, 0.7)"
        : "0 3px 8px rgba(120, 180, 50, 0.7)",
      color: modoOscuro ? "#fff" : "#fff",
    }}
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
        {!mostrarFormulario ? (
          <>
            {botonNuevoRegistro}

        <div className="flex flex-wrap gap-2 mb-5 justify-center">
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
  {vista !== "titulo" && (
    <button onClick={() => setVista("titulo")} className={botonClase("bg-sky-500")}>
      <Award size={16} /> Título Académico
    </button>
  )}
  {vista !== "usuarios" && (
    <button onClick={() => setVista("usuarios")} className={botonClase("bg-gray-600")}>
      <User size={16} /> Usuarios
    </button>
  )}
</div>



            {/* Buscador */}
            <BuscadorBase busqueda={busqueda} setBusqueda={setBusqueda} modoOscuro={modoOscuro} />

            {/* Contenido dinámico */}
            <div style={{ overflowX: "auto" }}>
              {busqueda === "" ? (
  {
    personas: (
    <Personas busqueda={busqueda} onResultados={onResultados("personas")} />
    ),
    direcciones: (
      <Direcciones busqueda={busqueda} onResultados={onResultados("direcciones")} />
    ),
    contactos: (
      <Contactos busqueda={busqueda} onResultados={onResultados("contactos")} />
    ),
    usuarios: (
      <FrmUsuarios busqueda={busqueda} onResultados={onResultados("usuarios")} />
    ),
   
    titulo: (
      <TitulosAcademicos busqueda={busqueda} onResultados={onResultados("titulo")} />
    ),
    permisos: (
      <UserPermiso busqueda={busqueda} onResultados={onResultados("permisos")} />
    ),

  }[vista]
) : (
  <>
    {/* Montamos TODOS para que filtren y reporten resultados */}
    <Personas busqueda={busqueda} onResultados={onResultados("personas")} />
    <Direcciones busqueda={busqueda} onResultados={onResultados("direcciones")} />
    <Contactos busqueda={busqueda} onResultados={onResultados("contactos")} />
    <FrmUsuarios busqueda={busqueda} onResultados={onResultados("usuarios")} />
    
    <TitulosAcademicos busqueda={busqueda} onResultados={onResultados("titulo")} />
    
                </>
              )}
            </div>
          </>
        ) : (
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
