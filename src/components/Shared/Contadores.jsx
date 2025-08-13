import React from "react";
import { FaUserCheck, FaUserTimes, FaUser, FaPlus } from "react-icons/fa";

const ContadoresBase = ({
  activos = 0,
  inactivos = 0,
  total = 0,
  onNuevo = () => {},
  mostrarNuevo = true,
  texto = "elementos",
  colorNuevo = "#1976d2",
  colorNuevoHover = "#115293",
}) => {
  const contenedorEstilo = {
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  };

  const crearContador = (icono, textoContador, valor, gradienteNormal, gradienteHover, sombra) => (
    <div
      style={{
        ...contenedorEstilo,
        background: gradienteNormal,
        color: "white",
        boxShadow: sombra,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = gradienteHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = gradienteNormal)}
    >
      {icono} {textoContador}
      <div style={{ fontSize: 26, marginLeft: 8 }}>{valor}</div>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-between items-center gap-6 mb-6">
      {/* Contadores */}
      <div className="flex flex-wrap justify-center gap-6 flex-grow min-w-[250px]">
        {crearContador(
          <FaUserCheck />,
          "Activos",
          activos,
          "linear-gradient(135deg, #127f45ff, #0c0b0bff)",
          "linear-gradient(135deg, #080808, #0a552d )",
          "0 3px 8px rgba(2,79,33,0.4)"
        )}

        {crearContador(
          <FaUserTimes />,
          "Inactivos",
          inactivos,
          "linear-gradient(135deg, #ef5350, #0c0b0bff)",
          "linear-gradient(135deg, #101010ff, #de1717ff)",
          "0 3px 8px rgba(244,67,54,0.4)"
        )}

        {crearContador(
          <FaUser />,
          "Total",
          total,
          "linear-gradient(135deg, #053b70, #20262dff)",
          "linear-gradient(135deg,#101010, #053b70 )",
          "0 3px 8px rgba(25,118,210,0.4)"
        )}
      </div>

      {/* Botón "Nuevo" */}
      {mostrarNuevo && (
        <button
          onClick={onNuevo}
          style={{
            backgroundColor: colorNuevo,
            border: "none",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            userSelect: "none",
            transition: "background-color 0.3s ease",
            whiteSpace: "nowrap",
            marginTop: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorNuevoHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorNuevo)}
          type="button"
        >
          <FaPlus /> Nuevo
        </button>
      )}
    </div>
  );
};

export default ContadoresBase;
