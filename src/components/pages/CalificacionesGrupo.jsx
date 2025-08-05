import React, { useEffect, useState } from "react";
import calificacionService from "../../services/Calificaciones";

const CalificacionesGrupo = ({ grupo }) => {
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        const data = await calificacionService.listarEstudiantesPorGrupo(grupo.idGrupo);
        setEstudiantes(data);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      }
    };

    if (grupo) cargarEstudiantes();
  }, [grupo]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">
        Calificaciones del Grupo: {grupo.codigoGrupo}
      </h3>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th>Estudiante</th>
            <th>Calificación</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((est) => (
            <tr key={est.idUsuario} className="text-center">
              <td>{est.nombreCompleto}</td>
              <td>
                {/* Aquí puedes usar un input para capturar la nota */}
                <input type="number" min="0" max="100" className="border p-1 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalificacionesGrupo;
