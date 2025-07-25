import React from "react";
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";

const TablaBase = ({
  datos = [],
  columnas = [], // Array de objetos: [{ key, label, render? }]
  modoOscuro = false,
  texto = "",
  loading = false,
  error = null,
  onEditar = null,
  encabezadoClase = "",
}) => {
  const textoColor = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezadoColor = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  if (loading)
    return <p className="text-gray-400 italic p-4">Cargando datos...</p>;

  if (error)
    return <p className="text-red-500 font-medium p-4">Error: {error}</p>;

  if (!loading && datos.length === 0)
    return <p className="text-gray-400 p-4">No hay datos para mostrar.</p>;

  const columnasFiltradas = columnas.filter(
    ({ key }) => key.toLowerCase() !== "id"
  );

  return (
    <div className="w-full overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full table-auto border-collapse">
        <thead className={`${encabezadoClase || encabezadoColor}`}>
          <tr>
            {columnasFiltradas.map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-2 text-left text-sm font-semibold whitespace-nowrap select-none"
                scope="col"
              >
                {label}
              </th>
            ))}
            {onEditar && (
              <th className="px-4 py-2 text-left text-sm font-semibold whitespace-nowrap select-none">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {datos.map((item) => (
            <tr
              key={item.idAsignacion || item.id || Math.random()}
              className={`transition-colors ${
                modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"
              }`}
            >
              {columnasFiltradas.map(({ key, render }) => {
                if (key === "activo") {
                  return (
                    <td
                      key={key}
                      className="px-4 py-2 text-center text-xl whitespace-nowrap"
                    >
                      {item[key] ? (
                        <FaCheckCircle
                           className="text-green-500 text-xl mx-auto" 
                          title="Activo"
                        />
                      ) : (
                        <FaTimesCircle
                          className="text-red-500 text-xl mx-auto"
                          title="Inactivo"
                        />
                      )}
                    </td>
                  );
                }

                return (
                  <td
                    key={key}
                    className={`px-4 py-2 text-sm whitespace-nowrap ${
                      texto || textoColor
                    }`}
                  >
                    {render ? render(item) : item[key] ?? "N/D"}
                  </td>
                );
              })}
              {onEditar && (
                <td className="px-4 py-2 text-sm text-center whitespace-nowrap">
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