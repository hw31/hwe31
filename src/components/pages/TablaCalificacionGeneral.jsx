import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import asignacionDocenteService from "../../services/AsignacionDocente";
import inscripcionesMateriasService from "../../services/InscricipcionesxMateria";
import inscripcionesService from "../../services/Inscripcion";
import calificacionService from "../../services/Calificaciones";
import tipoCalificacionService from "../../services/TipoCalificacion";

const TablaCalificacionGeneral = ({ usuario }) => {
  // Obtener rol desde redux
  const rol = useSelector((state) => state.auth.rol);

  const modo = rol === 1 ? "admin" : rol === 2 ? "docente" : "estudiante";

  const [asignaciones, setAsignaciones] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [statusGuardado, setStatusGuardado] = useState({});

  useEffect(() => {
    const cargarTipos = async () => {
      const res = await tipoCalificacionService.listarTiposCalificacion();
      setTiposCalificacion(res.resultado || []);
    };
    cargarTipos();

    if (modo !== "estudiante") {
      // admin y docente: cargar asignaciones
      asignacionDocenteService.listarAsignaciones().then(setAsignaciones);
    } else {
      // estudiante: cargar solo sus datos
      cargarDatosEstudiante();
    }
  }, [modo]); // Recalcula si cambia el modo (rol)

  const cargarDatosEstudiante = async () => {
    const inscripciones = await inscripcionesService.listarInscripciones();
    const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();

    // Inscripciones propias
    const propias = inscripciones.filter((i) => i.idUsuario === usuario.idUsuario);

    // Materias relacionadas con esas inscripciones
    const relacionadas = inscMat.filter((im) =>
      propias.some((p) => p.iD_Inscripcion === im.idInscripcion)
    );

    // Formatear estudiantes (solo uno, el mismo usuario)
    const estudiantesFormateado = propias.map((p) => ({
      iD_Inscripcion: p.iD_Inscripcion,
      nombreEstudiante: usuario.nombre,
    }));

    setEstudiantes(estudiantesFormateado);

    if (relacionadas.length > 0) {
      const materia = {
        idMateria: relacionadas[0].idMateria,
        nombreMateria: "Materia asignada",
        idGrupo: relacionadas[0].iD_Grupo,
      };
      setMateriaSeleccionada(materia);

      const califs = await calificacionService.listarCalificacion();
      const filtradas = califs.data.filter((c) =>
        propias.some((p) => p.iD_Inscripcion === c.idInscripcion)
      );
      setCalificaciones(filtradas);
    }
  };

  // Agrupar grupos únicos para admin/docente
  const gruposUnicos = [];
  const idsGrupos = new Set();
  asignaciones.forEach((a) => {
    if (!idsGrupos.has(a.idGrupo)) {
      idsGrupos.add(a.idGrupo);
      gruposUnicos.push({ idGrupo: a.idGrupo, nombreGrupo: a.nombreGrupo });
    }
  });

  // Filtrar materias del grupo seleccionado
  const materiasDelGrupo = grupoSeleccionado
    ? asignaciones.filter((a) => a.idGrupo === grupoSeleccionado.idGrupo)
    : [];

  const handleSeleccionarMateria = async (materia) => {
    setMateriaSeleccionada(materia);
    const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();
    const inscripciones = await inscripcionesService.listarInscripciones();

    const inscMatFiltradas = inscMat.filter(
      (im) => im.iD_Grupo === materia.idGrupo && im.idMateria === materia.idMateria
    );
    const inscritos = inscripciones.filter((insc) =>
      inscMatFiltradas.some((im) => im.idInscripcion === insc.iD_Inscripcion)
    );

    setEstudiantes(inscritos);

    const resCalifs = await calificacionService.listarCalificacion();
    const califsFiltradas = resCalifs.data.filter(
      (c) =>
        c.idMateria === materia.idMateria &&
        inscritos.some((e) => e.iD_Inscripcion === c.idInscripcion)
    );
    setCalificaciones(califsFiltradas);
  };

  const obtenerNota = (idInscripcion, idTipoCalificacion) => {
    const calif = calificaciones.find(
      (c) => c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion
    );
    return calif ? String(calif.calificacion) : "";
  };

  const guardarNota = async (idInscripcion, idTipoCalificacion, nota) => {
    if (modo !== "docente") return; // solo docentes pueden guardar

    const clave = `${idInscripcion}_${idTipoCalificacion}`;
    if (nota === "") return;

    setStatusGuardado((s) => ({ ...s, [clave]: "guardando" }));

    try {
      const notaNum = Number(nota);
      const existente = calificaciones.find(
        (c) => c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion
      );

      const payload = {
        IdInscripcion: idInscripcion,
        IdUsuarioDocente: usuario.idUsuario,
        Calificacion: notaNum,
        IdMateria: materiaSeleccionada.idMateria,
        IdTipoCalificacion: idTipoCalificacion,
        IdEstado: 1,
      };

      if (existente) {
        payload.IdCalificacion = existente.idCalificacion;
        await calificacionService.actualizarCalificaciones(payload);
      } else {
        await calificacionService.insertarCalificaciones(payload);
      }

      setCalificaciones((prev) => {
        const sinEsta = prev.filter(
          (c) => !(c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion)
        );
        return [...sinEsta, { ...payload, calificacion: notaNum }];
      });

      setStatusGuardado((s) => ({ ...s, [clave]: "ok" }));
      setTimeout(() => setStatusGuardado((s) => { const cp = { ...s }; delete cp[clave]; return cp; }), 1500);
    } catch (e) {
      setStatusGuardado((s) => ({ ...s, [clave]: "error" }));
      setTimeout(() => setStatusGuardado((s) => { const cp = { ...s }; delete cp[clave]; return cp; }), 3000);
    }
  };

  const acumulado = (idInscripcion) =>
    tiposCalificacion.reduce((acc, tipo) => {
      const calif = calificaciones.find(
        (c) => c.idInscripcion === idInscripcion && c.idTipoCalificacion === tipo.idTipoCalificacion
      );
      return acc + (calif ? Number(calif.calificacion) : 0);
    }, 0);

  const claseStatusInput = (clave) => {
    switch (statusGuardado[clave]) {
      case "ok":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "guardando":
        return "border-yellow-500 animate-pulse";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Mostrar grupos para admin y docente */}
      {modo !== "estudiante" && !grupoSeleccionado && (
        <div className="flex flex-wrap gap-3">
          {gruposUnicos.map((g) => (
            <button
              key={g.idGrupo}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow"
              onClick={() => setGrupoSeleccionado(g)}
            >
              {g.nombreGrupo}
            </button>
          ))}
        </div>
      )}

      {/* Mostrar materias del grupo para admin y docente */}
      {grupoSeleccionado && !materiaSeleccionada && (
        <div className="flex flex-wrap gap-3">
          {materiasDelGrupo.map((m) => (
            <button
              key={m.idAsignacion}
              className="bg-purple-600 text-white px-4 py-2 rounded shadow"
              onClick={() => handleSeleccionarMateria(m)}
            >
              {m.nombreMateria} - {m.nombreDocente}
            </button>
          ))}
        </div>
      )}

      {/* Mostrar tabla con calificaciones */}
      {materiaSeleccionada && (
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Estudiante</th>
                {tiposCalificacion.map((tipo) => (
                  <th key={tipo.idTipoCalificacion} className="border px-2 py-1">
                    {tipo.tipoCalificacionNombre} (max {tipo.valorMaximo})
                  </th>
                ))}
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.iD_Inscripcion}>
                  <td className="border px-2 py-1">{est.nombreEstudiante || usuario.nombre}</td>
                  {tiposCalificacion.map((tipo) => {
                    const clave = `${est.iD_Inscripcion}_${tipo.idTipoCalificacion}`;
                    const nota = obtenerNota(est.iD_Inscripcion, tipo.idTipoCalificacion);
                    return (
                      <td key={tipo.idTipoCalificacion} className="border px-2 py-1 text-center">
                        {modo === "docente" ? (
                          <input
                            type="number"
                            min="0"
                            max={tipo.valorMaximo}
                            step="0.1"
                            value={nota}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCalificaciones((prev) => {
                                const existe = prev.find(
                                  (c) =>
                                    c.idInscripcion === est.iD_Inscripcion &&
                                    c.idTipoCalificacion === tipo.idTipoCalificacion
                                );
                                if (existe) {
                                  return prev.map((c) =>
                                    c.idInscripcion === est.iD_Inscripcion &&
                                    c.idTipoCalificacion === tipo.idTipoCalificacion
                                      ? { ...c, calificacion: val }
                                      : c
                                  );
                                } else {
                                  return [
                                    ...prev,
                                    {
                                      idInscripcion: est.iD_Inscripcion,
                                      idTipoCalificacion: tipo.idTipoCalificacion,
                                      calificacion: val,
                                    },
                                  ];
                                }
                              });
                            }}
                            onBlur={(e) =>
                              guardarNota(est.iD_Inscripcion, tipo.idTipoCalificacion, e.target.value)
                            }
                            className={`w-full text-center border-2 px-1 py-0.5 rounded ${claseStatusInput(
                              clave
                            )}`}
                          />
                        ) : (
                          <span>{nota}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="border px-2 py-1 text-center font-bold">
                    {acumulado(est.iD_Inscripcion).toFixed(2)}
                  </td>
                </tr>
              ))}
              {estudiantes.length === 0 && (
                <tr>
                  <td colSpan={tiposCalificacion.length + 2} className="text-center py-4">
                    No hay estudiantes inscritos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaCalificacionGeneral;
