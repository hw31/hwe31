import React from "react";
import { FaHourglassHalf, FaCheckCircle, FaList, FaPlus } from "react-icons/fa";

const ContadoresInscripcion = ({
  enProceso = 0,
  confirmados = 0,
  total = 0,
  onNuevo = () => {},
  colorNuevo = "#1976d2",
  colorNuevoHover = "#115293",
  modoOscuro = false,
}) => {
  const contenedorEstilo = {
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: "700",
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

  return (
    <div className={`flex flex-wrap justify-between items-center gap-6 mb-6`}>
      {/* Contadores */}
      <div className="flex flex-wrap justify-center gap-6 flex-grow min-w-[250px]">
        {/* En Proceso */}
        <div
          style={{
            ...contenedorEstilo,
            background: "linear-gradient(135deg, #f9a825, #6b5800)",
            color: "white",
            boxShadow: "0 3px 8px rgba(249,168,37,0.6)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #6b5800, #f9a825)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #f9a825, #6b5800)")
          }
          aria-label="Inscripciones en proceso"
        >
          <FaHourglassHalf size={24} />
          Pendiente
          <div style={{ fontSize: 26, marginLeft: 8 }}>{enProceso}</div>
        </div>

        {/* Confirmados */}
        <div
          style={{
            ...contenedorEstilo,
            background: "linear-gradient(135deg, #2e7d32, #145214)",
            color: "white",
            boxShadow: "0 3px 8px rgba(46,125,50,0.6)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #145214, #2e7d32)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #2e7d32, #145214)")
          }
          aria-label="Inscripciones confirmadas"
        >
          <FaCheckCircle size={24} />
          Confirmados
          <div style={{ fontSize: 26, marginLeft: 8 }}>{confirmados}</div>
        </div>

        {/* Total */}
        <div
          style={{
            ...contenedorEstilo,
            background: modoOscuro
              ? "linear-gradient(135deg, #555555, #222222)"
              : "linear-gradient(135deg, #1565c0, #0d324d)",
            color: "white",
            boxShadow: modoOscuro
              ? "0 3px 8px rgba(85,85,85,0.6)"
              : "0 3px 8px rgba(21,101,192,0.6)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = modoOscuro
              ? "linear-gradient(135deg, #222222, #555555)"
              : "linear-gradient(135deg, #0d324d, #1565c0)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = modoOscuro
              ? "linear-gradient(135deg, #555555, #222222)"
              : "linear-gradient(135deg, #1565c0, #0d324d)";
          }}
          aria-label="Total inscripciones"
        >
          <FaList size={24} />
          Total
          <div style={{ fontSize: 26, marginLeft: 8 }}>{total}</div>
        </div>
      </div>

      {/* Botón "Nuevo" alineado a la derecha */}
      <button
        onClick={onNuevo}
        style={{
          backgroundColor: colorNuevo,
          border: "none",
          color: "#fff",
          padding: "12px 22px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "600",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          userSelect: "none",
          transition: "background-color 0.3s ease",
          whiteSpace: "nowrap",
          marginTop: "8px",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorNuevoHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorNuevo)}
        type="button"
        aria-label="Crear nueva inscripción"
      >
        <FaPlus /> Nuevo
      </button>
    </div>
  );
};

export default ContadoresInscripcion;
