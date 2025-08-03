import React, { useState } from "react";
import { useSelector } from "react-redux";

import Personas from "../hijos/Persona";
import Direcciones from "../hijos/Direccion";
import Contactos from "../hijos/Contacto";

import BuscadorBase from "../Shared/BuscadorBase"; // Asegúrate de la ruta correcta

const FrmPersonasDireccionesContactos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarWizard, setMostrarWizard] = useState(false);

  return (
    <div className={`p-4 min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`max-w-7xl mx-auto rounded-2xl shadow-md p-4 transition-all duration-300 ${
          modoOscuro ? "bg-gray-900 shadow-gray-700" : "bg-gray-50 shadow-gray-300"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-4 text-center ${
            modoOscuro ? "text-white" : "text-gray-800"
          }`}
        >
          Gestión de Personas, Direcciones y Contactos
        </h2>

        <div className="flex justify-between items-center mb-4">
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
          
        </div>

        {mostrarWizard ? (
          <WizardPersonas onCerrar={() => setMostrarWizard(false)} />
        ) : (
          <>
            <div className="mb-6">
              <Personas busqueda={busqueda} />
            </div>

            <div className="mb-6">
              <Direcciones busqueda={busqueda} />
            </div>

            <div>
              <Contactos busqueda={busqueda} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FrmPersonasDireccionesContactos;
