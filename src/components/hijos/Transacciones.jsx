import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import transaccionesService from "../../services/Transacciones"; 
import TablaBase from "../Shared/TablaBase";

const Transacciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  useEffect(() => {
    const cargarTransacciones = async () => {
      setLoading(true);
      try {
        const res = await transaccionesService.listarTransacciones();
        setTransacciones(res?.resultado || []);
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
        setTransacciones([]);
      } finally {
        setLoading(false);
      }
    };

    cargarTransacciones();
  }, []);

  const columnas = [
    { key: "idTransacciones", label: "ID", className: "text-center w-12" },
    { key: "tipoTransaccion", label: "Tipo" },
    { key: "referencia", label: "Referencia" },
    { key: "usuario", label: "Usuario" },
    { key: "persona", label: "Persona" },
    { key: "fechaCreacion", label: "Fecha", className: "whitespace-nowrap" },
    { key: "creador", label: "Creador" },
  ];

  return (
    <div className={`p-4 rounded-xl shadow-md ${modoOscuro ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-bold cursor-pointer select-none ${texto}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-controls="transaccionesContent"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          {isCollapsed ? "►" : "▼"} Transacciones - Auditoría
        </h2>
      </div>

      {!isCollapsed && (
        <div id="transaccionesContent">
          <TablaBase
            datos={transacciones}
            columnas={columnas}
            modoOscuro={modoOscuro}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
          />
        </div>
      )}
    </div>
  );
};

export default Transacciones;
