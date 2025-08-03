import React, { useState } from "react";
import { useSelector } from "react-redux";
import FrmHorarios from "../pages/FrmHorarios";
import Asignacion from "../hijos/Asignacion";
import { Clock, ArrowLeftCircle } from "lucide-react";

const FrmAsignacion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [soloHorario, setSoloHorario] = useState(false); // Controla si se ve FrmHorarios o Asignacion

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
        {/* Botón superior que alterna entre Horarios y Asignaciones */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setSoloHorario(!soloHorario)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {soloHorario ? (
              <>
                <ArrowLeftCircle /> Volver a asignaciones
              </>
            ) : (
              <>
                <Clock /> Ver Horarios
              </>
            )}
          </button>
        </div>

        {/* Contenido según estado */}
        {soloHorario ? <FrmHorarios /> : <Asignacion />}
      </div>
    </div>
  );
};

export default FrmAsignacion;
