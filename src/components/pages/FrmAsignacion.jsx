import React, { useState } from "react";
import { useSelector } from "react-redux";
import FrmHorarios from "../hijos/Horarios";
import FrmAulas from "../hijos/Aulas";
import FrmGrupos from "../hijos/Grupos";
import FrmMaterias from "../hijos/Materias"; // ← NUEVO
import Asignacion from "../hijos/Asignacion";
import {
  Clock,
  ArrowLeftCircle,
  School,
  Users,
  BookOpenCheck,
} from "lucide-react"; // ← NUEVO ICONO

const FrmAsignacion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const rolLower = rol ? rol.toLowerCase() : null;

  const [vista, setVista] = useState("asignacion"); // vista actual

  return (
      <div
  className={`p-4 pb-20 min-h-screen rounded-xl ${
    modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  }`}
>
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md p-6 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >
        {/* Botones visibles solo para el administrador */}
        {(rolLower === "administrador" || rolLower==="secretario") && (
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {vista !== "asignacion" && (
              <button
                onClick={() => setVista("asignacion")}
                className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <ArrowLeftCircle /> Volver a asignaciones
              </button>
            )}
            {vista !== "horarios" && (
              <button
                onClick={() => setVista("horarios")}
                className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Clock /> Ver Horarios
              </button>
            )}
            {vista !== "aulas" && (
              <button
                onClick={() => setVista("aulas")}
                className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                <School /> Ver Aulas
              </button>
            )}
            {vista !== "grupos" && (
              <button
                onClick={() => setVista("grupos")}
                className="flex items-center gap-2 px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                <Users /> Ver Grupos
              </button>
            )}
            {vista !== "materias" && (
              <button
                onClick={() => setVista("materias")}
                className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
              >
                <BookOpenCheck /> Ver Materias
              </button>
            )}
          </div>
          
        )}

        {/* Contenido según vista actual */}
        {vista === "asignacion" && <Asignacion />}
        {vista === "horarios" && <FrmHorarios />}
        {vista === "aulas" && <FrmAulas />}
        {vista === "grupos" && <FrmGrupos />}
        {vista === "materias" && <FrmMaterias />}
      </div>
    </div>
  );
};

export default FrmAsignacion;