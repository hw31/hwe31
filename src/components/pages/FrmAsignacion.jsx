import React, { useEffect, useState } from "react";
import asignacionDocenteService from "../../services/AsignacionDocente";

const AsignacionDocenteList = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await asignacionDocenteService.listarAsignaciones();
      console.log("Datos API asignaciones:", data);
      setAsignaciones(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar asignaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  if (loading) return <p>Cargando asignaciones...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (asignaciones.length === 0) return <p>No hay asignaciones para mostrar.</p>;

  return (
    <div>
     
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID Asignación</th>
            <th>Docente</th>
            <th>Materia</th>
            <th>Grupo</th>
            <th>Aula</th>
            <th>Horario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((asig) => (
            <tr key={asig.idAsignacion}>
              <td>{asig.idAsignacion}</td>
              <td>{asig.nombreDocente || "N/D"}</td>
              <td>{asig.nombreMateria || "N/D"}</td>
              <td>{asig.nombreGrupo || "N/D"}</td>
              <td>{asig.nombreAula || "N/D"}</td>
              <td>{asig.descripcionHorario || "N/D"}</td>
              <td>{asig.nombreEstado || "N/D"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AsignacionDocenteList;
