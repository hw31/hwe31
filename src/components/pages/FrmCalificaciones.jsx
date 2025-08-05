import React from "react";
import { useSelector } from "react-redux";
import TablaCalificacionGeneral from "./TablaCalificacionGeneral";

const FrmCalificaciones = () => {
  const rol = parseInt(useSelector((state) => state.auth.rol), 10);
  const usuario = useSelector((state) => state.auth.usuario || null);

  console.log("ROL:", rol);
  console.log("Usuario:", usuario);

  if (!usuario) return <p>Cargando usuario...</p>;

  let modo;
  if (rol === 1) modo = "admin";
  else if (rol === 2) modo = "docente";
  else if (rol === 3) modo = "estudiante";
  else return <p>Rol no reconocido.</p>;

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        Universidad CAL-I - Notas
      </h1>
      <TablaCalificacionGeneral modo={modo} usuario={usuario} />
    </div>
  );
};

export default FrmCalificaciones;
