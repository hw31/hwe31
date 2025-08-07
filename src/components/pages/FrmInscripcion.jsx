import React, { useState } from "react";
import { useSelector } from "react-redux";
import Inscripcion from "../hijos/Inscripcion";
import InscripcionMaterias from "../hijos/Inscripcionesmaterias";
import Periodo from "../hijos/PeriodoAcademico";
import BuscadorBase from "../Shared/BuscadorBase";

// Iconos
import { FileText, FileCheck2, CalendarDays, ArrowLeftCircle } from "lucide-react";

const FrmInscripcion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("inscripciones");

  const botonClase = (color) =>
    `flex items-center justify-center gap-2 w-44 h-10 rounded text-sm text-white transition font-medium ${color} hover:brightness-110`;

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
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          {vista !== "inscripciones" && (
            <button
              onClick={() => setVista("inscripciones")}
              className={botonClase("bg-indigo-600")}
            >
              <ArrowLeftCircle size={25} /> Volver a Inscripciones
            </button>
          )}
          {vista !== "inscripcionesmaterias" && (
            <button
              onClick={() => setVista("inscripcionesmaterias")}
              className={botonClase("bg-green-600")}
            >
              <FileCheck2 size={25} /> Inscripciones Materias
            </button>
          )}
          {vista !== "periodo" && (
            <button
              onClick={() => setVista("periodo")}
              className={botonClase("bg-blue-600")}
            >
              <CalendarDays size={25} /> Período Académico
            </button>
          )}
        </div>

        {/* Contenido dinámico */}
        {vista === "inscripciones" && <Inscripcion busqueda={busqueda} />}
        {vista === "inscripcionesmaterias" && <InscripcionMaterias busqueda={busqueda} />}
        {vista === "periodo" && <Periodo busqueda={busqueda} />}
      </div>
    </div>
  );
};

export default FrmInscripcion;
