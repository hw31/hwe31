import React, { useState } from "react";

const FilaEstudiante = ({
  estudiante,
  index,
  tiposCalificacion,
  calificaciones,
  setCalificaciones,
  obtenerNota,
  guardarNota,
  claseStatusInput,
  acumuladoPorEstudiante,
  porcentajePorEstudiante,
  aprobadoPorEstudiante,
  esEstudiante,
  modoOscuro,
}) => {
  const [errores, setErrores] = useState({});

  return (
    <tr
      className={`${
        modoOscuro
          ? index % 2 === 0
            ? "bg-gray-900"
            : "bg-gray-800"
          : index % 2 === 0
          ? "bg-white"
          : "bg-gray-50"
      }`}
    >
      <td
        className={`border px-4 py-2 font-medium ${
          modoOscuro ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {estudiante.nombreEstudiante || "Sin nombre"}
      </td>

      {tiposCalificacion.map((tipo) => {
        const clave = `${estudiante.iD_Inscripcion}_${tipo.idTipoCalificacion}`;
        const notaActual = obtenerNota(estudiante.iD_Inscripcion, tipo.idTipoCalificacion);

        return (
          <td
            key={tipo.idTipoCalificacion}
            className={`border px-2 py-1 text-center align-top ${
              modoOscuro ? "border-gray-700" : "border-gray-300"
            }`}
          >
            {esEstudiante ? (
              <div
                className={`text-sm ${
                  modoOscuro ? "text-white" : "text-gray-800"
                } cursor-not-allowed select-none`}
                onClick={() => {
                  setErrores((prev) => ({ ...prev, [clave]: "No puedes editar la calificación." }));
                  setTimeout(() => {
                    setErrores((prev) => {
                      const copia = { ...prev };
                      delete copia[clave];
                      return copia;
                    });
                  }, 3000);
                }}
              >
                {notaActual !== "" ? notaActual : "-"}
                {errores[clave] && (
                  <div className="mt-1 text-xs text-red-500 font-medium">{errores[clave]}</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max={tipo.valorMaximo}
                  step="0.1"
                  value={notaActual}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Number(val);

                    if (val === "") {
                      setErrores((prev) => ({ ...prev, [clave]: null }));
                      setCalificaciones((prev) => {
                        const existe = prev.find(
                          (c) =>
                            c.idInscripcion === estudiante.iD_Inscripcion &&
                            c.idTipoCalificacion === tipo.idTipoCalificacion
                        );
                        if (existe) {
                          return prev.map((c) =>
                            c.idInscripcion === estudiante.iD_Inscripcion &&
                            c.idTipoCalificacion === tipo.idTipoCalificacion
                              ? { ...c, calificacion: "" }
                              : c
                          );
                        } else {
                          return [
                            ...prev,
                            {
                              idInscripcion: estudiante.iD_Inscripcion,
                              idTipoCalificacion: tipo.idTipoCalificacion,
                              calificacion: "",
                            },
                          ];
                        }
                      });
                      return;
                    }

                    if (isNaN(num) || num < 0 || num > tipo.valorMaximo) {
                      setErrores((prev) => ({
                        ...prev,
                        [clave]: `Debe estar entre 0 y ${tipo.valorMaximo}`,
                      }));
                      return;
                    }

                    setErrores((prev) => {
                      const copia = { ...prev };
                      delete copia[clave];
                      return copia;
                    });

                    setCalificaciones((prev) => {
                      const existe = prev.find(
                        (c) =>
                          c.idInscripcion === estudiante.iD_Inscripcion &&
                          c.idTipoCalificacion === tipo.idTipoCalificacion
                      );
                      if (existe) {
                        return prev.map((c) =>
                          c.idInscripcion === estudiante.iD_Inscripcion &&
                          c.idTipoCalificacion === tipo.idTipoCalificacion
                            ? { ...c, calificacion: val }
                            : c
                        );
                      } else {
                        return [
                          ...prev,
                          {
                            idInscripcion: estudiante.iD_Inscripcion,
                            idTipoCalificacion: tipo.idTipoCalificacion,
                            calificacion: val,
                          },
                        ];
                      }
                    });
                  }}
                  onBlur={(e) =>
                    guardarNota(
                      estudiante.iD_Inscripcion,
                      tipo.idTipoCalificacion,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  className={`w-full text-center rounded border-2 px-1 py-0.5 text-sm
                    ${claseStatusInput(clave)} 
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 transition`}
                  aria-label={`${tipo.tipoCalificacionNombre} de ${estudiante.nombreEstudiante}`}
                />
                {errores[clave] && (
                  <div className="mt-0.5 text-xs text-red-500 font-medium">{errores[clave]}</div>
                )}
              </div>
            )}
          </td>
        );
      })}

      <td
        className={`border px-4 py-2 text-center font-semibold ${
          modoOscuro ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {acumuladoPorEstudiante(estudiante.iD_Inscripcion).toFixed(2)}
      </td>
      <td
        className={`border px-4 py-2 text-center font-semibold ${
          modoOscuro ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {porcentajePorEstudiante(estudiante.iD_Inscripcion).toFixed(1)}%
      </td>
      <td
        className={`border px-4 py-2 text-center font-semibold ${
          modoOscuro ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {aprobadoPorEstudiante(estudiante.iD_Inscripcion) ? "Sí" : "No"}
      </td>
    </tr>
  );
};

export default FilaEstudiante;
