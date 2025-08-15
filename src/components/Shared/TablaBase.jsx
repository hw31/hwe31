import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";

const TablaBase = ({
  datos = [],
  columnas = [], // [{ key, label, render?, phantom? }]
  modoOscuro = false,
  texto = "",
  loading = false,
  error = null,
  onEditar = null,
  puedeEditar = null,
  encabezadoClase = "",
  onDetectarColumnasFantasma = null, // NUEVO
}) => {
  const textoColor = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezadoColor = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  if (loading) return <p className="text-gray-400 italic p-4">Cargando datos...</p>;
  if (error) return <p className="text-red-500 font-medium p-4">Error: {error}</p>;
  if (!loading && datos.length === 0) return <p className="text-gray-400 p-4">No hay datos para mostrar.</p>;

  const columnasFiltradas = columnas.filter(({ key }) => key.toLowerCase() !== "id");

  // Detectar si hay columnas fantasma
  const tieneColumnasFantasma = columnasFiltradas.some(c => c.phantom);
  useEffect(() => {
    if (onDetectarColumnasFantasma) {
      onDetectarColumnasFantasma(tieneColumnasFantasma);
    }
  }, [tieneColumnasFantasma, onDetectarColumnasFantasma]);

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="table-auto border-collapse mx-auto">
        <thead className={`${encabezadoClase || encabezadoColor}`}>
          <tr>
            {columnasFiltradas.map(({ key, label, phantom }) => (
              <th
                key={key}
                className={`py-2 text-sm font-semibold whitespace-nowrap select-none ${
                  key === "activo" ? "text-center px-2" : "text-left px-4"
                }`}
                style={{ width: phantom ? "1px" : "auto" }}
              >
                {phantom ? "" : label}
              </th>
            ))}
            {onEditar && (
              <th className="py-2 w-24 text-center whitespace-nowrap select-none">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {datos.map((item) => (
            <tr
              key={item.idAsignacion || item.id || Math.random()}
              className={`transition-colors ${modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}
            >
              {columnasFiltradas.map(({ key, render, phantom }) => {
                if (phantom) return <td key={key} style={{ width: "1px" }}></td>;

                if (key === "activo") {
                  return (
                    <td key={key} className="py-2 text-center px-2 align-middle w-24">
                      {item[key] ? (
                        <FaCheckCircle className="text-green-500 text-xl mx-auto" title="Activo" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-xl mx-auto" title="Inactivo" />
                      )}
                    </td>
                  );
                }

                return (
                  <td key={key} className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto || textoColor}`}>
                    {render ? render(item) : item[key] ?? "N/D"}
                  </td>
                );
              })}
              {onEditar && (!puedeEditar || puedeEditar(item)) && (
                <td className="py-2 w-24 text-center whitespace-nowrap align-middle pl-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-xl flex justify-center items-center w-full"
                    onClick={() => onEditar(item)}
                    aria-label="Editar"
                  >
                    <FaEdit />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaBase;
