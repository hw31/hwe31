const ResumenFinal = ({
  estudiantes,
  calificaciones,
  tiposCalificacion,
  materiasDelGrupo,
  modoOscuro,
  idUsuario,
  rol,
  idPeriodoActivo,
}) => {
  const rolLower = rol ? rol.toLowerCase() : "";
  const esEstudiante = rolLower === "estudiante";

  // Filtrar estudiantes para que el estudiante vea solo sus datos
  const estudiantesFiltrados = esEstudiante
    ? estudiantes.filter(est => String(est.iD_Usuario) === String(idUsuario))
    : estudiantes;

  // Filtrar estudiantes únicos (por iD_Inscripcion)
  const estudiantesUnicos = estudiantesFiltrados.reduce((acc, est) => {
    if (!acc.find(e => e.iD_Inscripcion === est.iD_Inscripcion)) acc.push(est);
    return acc;
  }, []);

  // Filtrar materias únicas (por idMateria)
  const materiasUnicas = materiasDelGrupo.reduce((acc, mat) => {
    if (!acc.find(m => m.idMateria === mat.idMateria)) acc.push(mat);
    return acc;
  }, []);

  // Función para calcular nota final por materia y estudiante (inscripción)
  const notaFinalMateria = (idInscripcion, idMateria) => {
    const califs = calificaciones.filter(
      c =>
        c.idInscripcion === idInscripcion &&
        c.idMateria === idMateria &&
        c.idPeriodoAcademico === idPeriodoActivo
    );
    if (califs.length === 0) return 0;

    let sumaNotas = 0;
    let sumaMax = 0;

    tiposCalificacion.forEach(tipo => {
      if (!tipo.activo) return;
      const calif = califs.find(c => c.idTipoCalificacion === tipo.idTipoCalificacion);
      if (calif) sumaNotas += Number(calif.calificacion);
      sumaMax += tipo.valorMaximo;
    });

    if (sumaMax === 0) return 0;
    return (sumaNotas / sumaMax) * 100;
  };

  return (
    <div
      className={`mt-8 p-4 rounded-lg border ${
        modoOscuro
          ? "border-gray-700 bg-gray-800 text-gray-200"
          : "border-gray-300 bg-gray-50 text-gray-800"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">Resumen final por materia</h3>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Estudiante</th>
            <th className="border px-2 py-1">Materia</th>
            <th className="border px-2 py-1">Nota Final (%)</th>
            <th className="border px-2 py-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {estudiantesUnicos.map(est =>
            materiasUnicas
              .filter(mat =>
                // Aquí validamos que haya calificaciones para esta materia y estudiante en el periodo activo
                calificaciones.some(
                  c =>
                    c.idInscripcion === est.iD_Inscripcion &&
                    c.idMateria === mat.idMateria &&
                    c.idPeriodoAcademico === idPeriodoActivo
                )
              )
              .map(mat => {
                const nota = notaFinalMateria(est.iD_Inscripcion, mat.idMateria);
                const aprobado = nota >= 60;
                return (
                  <tr
                    key={`${est.iD_Inscripcion}-${mat.idMateria}`}
                    className={`border-t ${modoOscuro ? "border-gray-700" : "border-gray-300"}`}
                  >
                    <td className="border px-2 py-1">{est.nombreEstudiante}</td>
                    <td className="border px-2 py-1">{mat.nombreMateria}</td>
                    <td
                      className={`border px-2 py-1 font-bold ${
                        aprobado ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {nota.toFixed(2)}%
                    </td>
                    <td className="border px-2 py-1">{aprobado ? "✅ Aprobado" : "❌ Reprobado"}</td>
                  </tr>
                );
              })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResumenFinal;
