import React, { useState } from "react";
import { useSelector } from "react-redux";
import Calificacion from "../hijos/Calificacion";
import TipoCalificacion from "../hijos/TipoCalificacion";
import BuscadorBase from "../Shared/BuscadorBase";
import { FaArrowLeft, FaMedal } from "react-icons/fa";

const GestionCalificaciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const rolLower = rol ? rol.toLowerCase() : "";

  const [mostrarBtnTipoCalificacion, setMostrarBtnTipoCalificacion] = useState(false);
  const [vista, setVista] = useState("calificaciones");
  const [filtroGeneral, setFiltroGeneral] = useState("");

  // Estados elevados para mantener selección
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  return (
 <div
  className={`p-4 min-h-screen rounded-xl ${
    modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  }`}
>

      <div className="mb-6">
        <BuscadorBase
          placeholder="Buscar grupo, materia o estudiante"
          valor={filtroGeneral}
          onChange={(e) => setFiltroGeneral(e.target.value)}
          modoOscuro={modoOscuro}
        />
      </div>

      <div className="flex justify-end mb-4 gap-2">
        {rolLower === "administrador" &&
          vista === "calificaciones" &&
          mostrarBtnTipoCalificacion && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
              onClick={() => setVista("tipos")}
            >
              <FaMedal />
              Ver Tipos de Calificación
            </button>
          )}

        {vista === "tipos" && (
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2"
            onClick={() => setVista("calificaciones")}
          >
            <FaArrowLeft />
            Volver
          </button>
        )}
      </div>

      {vista === "calificaciones" ? (
        <Calificacion
          filtroGeneral={filtroGeneral}
          grupoSeleccionado={grupoSeleccionado}
          setGrupoSeleccionado={setGrupoSeleccionado}
          materiaSeleccionada={materiaSeleccionada}
          setMateriaSeleccionada={setMateriaSeleccionada}
          onMostrarListaEstudiantes={setMostrarBtnTipoCalificacion}
        />
      ) : (
        <TipoCalificacion />
      )}
    </div>
  );
};

export default GestionCalificaciones;
