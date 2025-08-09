import React, { useEffect, useState } from "react";
import inscripcionesService from "../../services/Inscripcion";
import calificacionService from "../../services/Calificaciones";
import tipoCalificacionService from "../../services/TipoCalificacion";
import asignacionDocenteService from "../../services/AsignacionDocente";

function ReporteNotasPorEstudiante({ idEstudiante }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const insc = await inscripcionesService.listarInscripciones();
        const califs = await calificacionService.listarCalificacion();
        const tipos = await tipoCalificacionService.listarTiposCalificacion();
        const asigns = await asignacionDocenteService.listarAsignaciones();

        setInscripciones(insc || []);
        setCalificaciones(califs?.data || []);
        setTiposCalificacion((tipos?.resultado || []).filter((t) => t.activo));
        setAsignaciones(asigns || []);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Error desconocido");
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const inscripcionesDelEstudiante = inscripciones.filter(
    (i) => i.iD_Estudiante === idEstudiante || i.idEstudiante === idEstudiante
  );

  const calcularNotaFinal = (idInscripcion, idMateria) => {
    const califs = calificaciones.filter(
      (c) => c.idInscripcion === idInscripcion && c.idMateria === idMateria
    );

    const maxTotal = tiposCalificacion.reduce((sum, t) => sum + t.valorMaximo, 0);
    const suma = califs.reduce((sum, c) => sum + Number(c.calificacion || 0), 0);
    if (maxTotal === 0) return 0;
    return (suma / maxTotal) * 100;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md shadow-inner">
      <h4 className="font-semibold mb-3">Reporte de notas</h4>
      <table className="w-full text-sm border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th scope="col" className="border border-gray-300 p-1">Materia</th>
            <th scope="col" className="border border-gray-300 p-1">Grupo</th>
            <th scope="col" className="border border-gray-300 p-1">Docente</th>
            <th scope="col" className="border border-gray-300 p-1">Nota Final (%)</th>
            <th scope="col" className="border border-gray-300 p-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {inscripcionesDelEstudiante.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-2 text-gray-500">
                No tiene inscripciones registradas.
              </td>
            </tr>
          )}
          {inscripcionesDelEstudiante.map((insc) => {
            const asignacion = asignaciones.find(
              (a) => a.idGrupo === insc.iD_Grupo && a.idMateria === insc.idMateria
            );
            const notaFinal = calcularNotaFinal(insc.iD_Inscripcion, insc.idMateria);
            const aprobado = notaFinal >= 60;

            return (
              <tr key={insc.iD_Inscripcion}>
                <td className="border border-gray-300 p-1">{asignacion?.nombreMateria || "Sin materia"}</td>
                <td className="border border-gray-300 p-1">{asignacion?.nombreGrupo || "Sin grupo"}</td>
                <td className="border border-gray-300 p-1">{asignacion?.nombreDocente || "Sin docente"}</td>
                <td className="border border-gray-300 p-1 text-center">{notaFinal.toFixed(1)}%</td>
                <td className="border border-gray-300 p-1 text-center">{aprobado ? "Aprobado" : "Reprobado"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReporteNotasPorEstudiante;
