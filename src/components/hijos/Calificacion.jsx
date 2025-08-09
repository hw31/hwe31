import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaBook, FaChalkboardTeacher, FaArrowRight } from "react-icons/fa"; 
import { ArrowLeft } from "lucide-react";
import asignacionDocenteService from "../../services/AsignacionDocente";
import inscripcionesMateriasService from "../../services/InscricipcionesxMateria";
import inscripcionesService from "../../services/Inscripcion";
import calificacionService from "../../services/Calificaciones";
import tipoCalificacionService from "../../services/TipoCalificacion";
import { listarPeriodosAcademicos } from "../../services/PeriodoAcademico";
import FilaEstudiante from "./FilaEstudiante";
import ReporteNotasPorEstudiante from "./ReporteNotasPorEstudiante";

const Calificacion = ({
  filtroGeneral,
  onMostrarListaEstudiantes,
  grupoSeleccionado,
  setGrupoSeleccionado,
  materiaSeleccionada,
  setMateriaSeleccionada,
}) => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const idUsuario = useSelector((state) => state.auth?.idUsuario);
  const rol = useSelector((state) => state.auth.rol);
  const rolLower = rol?.toLowerCase() ?? "";
  const esEstudiante = rolLower === "estudiante";
const [estudianteReporte, setEstudianteReporte] = useState(null);

  const [asignaciones, setAsignaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [statusGuardado, setStatusGuardado] = useState({});
  const [periodo, setPeriodo] = useState({ id: null, nombre: "" });


  
  // Cuando cambia materia o estudiantes actualiza botón mostrar lista
  useEffect(() => {
    if (materiaSeleccionada && estudiantes.length > 0) {
      onMostrarListaEstudiantes(true);
    } else {
      onMostrarListaEstudiantes(false);
    }
  }, [materiaSeleccionada, estudiantes, onMostrarListaEstudiantes]);

  useEffect(() => {
    const cargarPeriodo = async () => {
      try {
        const response = await listarPeriodosAcademicos();
        const periodos = response.resultado || [];
        const activo = periodos.find((p) => p.activo === true);
        if (activo) {
          setPeriodo({ id: activo.idPeriodoAcademico, nombre: activo.nombrePeriodo });
        } else {
          console.warn("No hay período académico activo.");
        }
      } catch (error) {
        console.error("Error cargando período académico:", error.message);
      }
    };
    cargarPeriodo();
  }, []);

  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        const data = await asignacionDocenteService.listarAsignaciones();
        setAsignaciones(data);
      } catch (error) {
        console.error("Error al cargar asignaciones:", error);
      }
    };
    cargarAsignaciones();

    const cargarTiposCalificacion = async () => {
      try {
        const res = await tipoCalificacionService.listarTiposCalificacion();
        setTiposCalificacion(
          (res.resultado || []).filter((tipo) => tipo.activo === true || tipo.activo === 1)
        );
      } catch (error) {
        console.error("Error al cargar tipos de calificación:", error);
      }
    };
    cargarTiposCalificacion();
  }, []);
  useEffect(() => {
  const cargarDatosMateria = async () => {
    if (!materiaSeleccionada) return;

    setEstudiantes([]);
    setCalificaciones([]);

    try {
      const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();
      const inscripciones = await inscripcionesService.listarInscripciones();

      const inscMatFiltradas = inscMat.filter(
        (im) => im.iD_Grupo === materiaSeleccionada.idGrupo && im.idMateria === materiaSeleccionada.idMateria
      );

      const inscritos = inscripciones.filter((insc) =>
        inscMatFiltradas.some((im) => im.idInscripcion === insc.iD_Inscripcion)
      );

      setEstudiantes(inscritos);

      const resCalifs = await calificacionService.listarCalificacion();
      if (resCalifs.success) {
        const califsFiltradas = resCalifs.data.filter(
          (c) =>
            c.idMateria === materiaSeleccionada.idMateria &&
            inscritos.some((e) => e.iD_Inscripcion === c.idInscripcion)
        );
        setCalificaciones(califsFiltradas);
      } else {
        setCalificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar inscripciones o calificaciones:", error);
      setEstudiantes([]);
      setCalificaciones([]);
    }
  };

  cargarDatosMateria();
}, [materiaSeleccionada]);



  // Extraer grupos únicos filtrando por filtroGeneral solo si no hay grupo seleccionado
  const gruposUnicos = [];
  const idsGrupos = new Set();
  asignaciones.forEach((a) => {
    if (!idsGrupos.has(a.idGrupo)) {
      idsGrupos.add(a.idGrupo);
      gruposUnicos.push({
        idGrupo: a.idGrupo,
        nombreGrupo: a.nombreGrupo,
      });
    }
  });

  const gruposFiltrados = !grupoSeleccionado
    ? gruposUnicos.filter((grupo) =>
        grupo.nombreGrupo.toLowerCase().includes((filtroGeneral || "").toLowerCase())
      )
    : [];

  // Materias del grupo seleccionado
  const materiasDelGrupo = grupoSeleccionado
    ? asignaciones.filter((a) => a.idGrupo === grupoSeleccionado.idGrupo)
    : [];

  // Filtrar materias si grupo seleccionado pero sin materia seleccionada
  const materiasFiltradas = grupoSeleccionado && !materiaSeleccionada
    ? materiasDelGrupo.filter((m) =>
        m.nombreMateria.toLowerCase().includes((filtroGeneral || "").toLowerCase())
      )
    : [];

  // Filtrar estudiantes si materia seleccionada
  const estudiantesFiltrados = materiaSeleccionada
    ? estudiantes.filter((est) =>
        (est.nombreEstudiante || "")
          .toLowerCase()
          .includes((filtroGeneral || "").toLowerCase())
      )
    : [];

  // Cuando selecciona materia, carga estudiantes y calificaciones
  const handleSeleccionarMateria = async (materia) => {
    setMateriaSeleccionada(materia);
    setEstudiantes([]);
    setCalificaciones([]);

    try {
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
      if (resCalifs.success) {
        const califsFiltradas = resCalifs.data.filter(
          (c) =>
            c.idMateria === materia.idMateria &&
            inscritos.some((e) => e.iD_Inscripcion === c.idInscripcion)
        );
        setCalificaciones(califsFiltradas);
      } else {
        setCalificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar inscripciones o calificaciones:", error);
      setEstudiantes([]);
      setCalificaciones([]);
    }
  };

  // Otras funciones (obtenerNota, guardarNota, acumuladoPorEstudiante, etc) se mantienen igual

  const obtenerNota = (idInscripcion, idTipoCalificacion) => {
    const calif = calificaciones.find(
      (c) => c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion
    );
    return calif ? String(calif.calificacion) : "";
  };

  const guardarNota = async (idInscripcion, idTipoCalificacion, nota) => {
    const clave = `${idInscripcion}_${idTipoCalificacion}`;
    if (nota === "") return;

    setStatusGuardado((s) => ({ ...s, [clave]: "guardando" }));

    try {
      const notaNum = Number(nota);
      if (isNaN(notaNum) || notaNum < 0) throw new Error("Nota inválida");
      if (!idUsuario) throw new Error("Usuario no autenticado");

      const califExistente = calificaciones.find(
        (c) =>
          c.idInscripcion === idInscripcion &&
          c.idTipoCalificacion === idTipoCalificacion &&
          c.idCalificacion
      );

      const payload = {
        IdInscripcion: idInscripcion,
        IdUsuarioDocente: idUsuario,
        Calificacion: notaNum,
        IdMateria: materiaSeleccionada.idMateria,
        IdTipoCalificacion: idTipoCalificacion,
        IdEstado: 1,
        IdPeriodo: periodo.id,
      };

      if (califExistente) {
        payload.IdCalificacion = califExistente.idCalificacion;
        await calificacionService.actualizarCalificaciones(payload);

        setCalificaciones((prev) =>
          prev.map((c) =>
            c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion
              ? { ...c, calificacion: notaNum }
              : c
          )
        );
      } else {
        const res = await calificacionService.insertarCalificaciones(payload);
        const nuevoId = res.idCalificacion || res.data?.idCalificacion;
        if (!nuevoId) throw new Error("No se recibió idCalificacion tras insertar");

        setCalificaciones((prev) => {
          const sinEsta = prev.filter(
            (c) =>
              !(c.idInscripcion === idInscripcion && c.idTipoCalificacion === idTipoCalificacion)
          );
          return [
            ...sinEsta,
            {
              ...payload,
              calificacion: notaNum,
              idCalificacion: nuevoId,
            },
          ];
        });
      }

      setStatusGuardado((s) => ({ ...s, [clave]: "ok" }));
      setTimeout(() => {
        setStatusGuardado((s) => {
          const copia = { ...s };
          delete copia[clave];
          return copia;
        });
      }, 1500);
    } catch (error) {
      console.error("Error guardando nota:", error);
      setStatusGuardado((s) => ({ ...s, [clave]: "error" }));
      setTimeout(() => {
        setStatusGuardado((s) => {
          const copia = { ...s };
          delete copia[clave];
          return copia;
        });
      }, 3000);
    }
  };

  const acumuladoPorEstudiante = (idInscripcion) =>
    tiposCalificacion.reduce((acum, tipo) => {
      const calif = calificaciones.find(
        (c) => c.idInscripcion === idInscripcion && c.idTipoCalificacion === tipo.idTipoCalificacion
      );
      return acum + (calif ? Number(calif.calificacion) : 0);
    }, 0);

  const porcentajePorEstudiante = (idInscripcion) => {
    const maxTotal = tiposCalificacion.reduce((acum, tipo) => acum + tipo.valorMaximo, 0);
    if (maxTotal === 0) return 0;
    return (acumuladoPorEstudiante(idInscripcion) / maxTotal) * 100;
  };

  const aprobadoPorEstudiante = (idInscripcion) =>
    porcentajePorEstudiante(idInscripcion) >= 60;

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

  const clasesCard = `rounded-2xl shadow-md p-4 sm:p-6 transition-all duration-300 w-full max-w-full mx-auto ${
    modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-800"
  }`;
const clasesCardGrid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6";

  const clasesCardMateria = `
     bg-gradient-to-tr from-indigo-400 via-blue-500 to-pink-500 
      shadow-lg rounded-2xl p-8 cursor-pointer
      transition transform hover:scale-105 hover:shadow-2xl
      text-white flex flex-col justify-between
      min-h-[160px] text-lg
      `;

  const clasesCardGrupo = `
    bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600
      shadow-lg rounded-xl p-5 cursor-pointer
      transition transform hover:scale-105 hover:shadow-2xl
      text-white flex flex-col justify-between
      max-w-full
      w-full
      `;

  return (
    <>
      {!grupoSeleccionado && (
        <>
          <div className={clasesCardGrid}>
            {gruposFiltrados.map((grupo) => (
              <div
                key={grupo.idGrupo}
                className={clasesCardGrupo}
                onClick={() => {
                  setGrupoSeleccionado(grupo);
                  setMateriaSeleccionada(null);
                  setEstudiantes([]);
                  setCalificaciones([]);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setGrupoSeleccionado(grupo);
                    setMateriaSeleccionada(null);
                    setEstudiantes([]);
                    setCalificaciones([]);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <FaBook size={24} />
                  <h3 className="text-xl font-semibold">{grupo.nombreGrupo}</h3>
                </div>
                <div className="mt-4 text-sm opacity-90">Haz click para ver materias</div>
              </div>
            ))}
          </div>
        </>
      )}

      {grupoSeleccionado && !materiaSeleccionada && (
        <>
          <h2 className={`text-2xl font-bold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
            <span className="underline">{grupoSeleccionado.nombreGrupo}</span>
          </h2>

          <div className={clasesCardGrid}>
            {materiasFiltradas.map((m) => (
              <div
                key={m.idAsignacion}
                className={clasesCardMateria}
                onClick={() => handleSeleccionarMateria(m)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSeleccionarMateria(m);
                }}
              >
                <div>
                  <h3 className="text-lg font-bold">{m.nombreMateria}</h3>
                  <p className="flex items-center gap-2 mt-1 opacity-90">
                    <FaChalkboardTeacher /> {m.nombreDocente}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeleccionarMateria(m);
                  }}
                  className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition text-black"
                >
                  Ver detalles <FaArrowRight />
                </button>
              </div>
            ))}
          </div>

            <button
              onClick={() => setGrupoSeleccionado(null)}
              className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
                modoOscuro
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Volver</span>
            </button>

        </>
      )}

          {materiaSeleccionada && (
          <div className="overflow-auto max-w-full">

            {/* Card con fondo degradado */}
            <div
              className="mb-6 p-5 rounded-xl shadow-lg text-white"
              style={{
                backgroundImage: "linear-gradient(to top right, #7df0a1, #0d78cd, #0c6221)"
              }}
            >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold">
                  Grupo: <span className="font-semibold">{grupoSeleccionado.nombreGrupo}</span>
                </h3>
                <h4 className="text-lg mt-1">
                  Materia: <span className="font-medium">{materiaSeleccionada.nombreMateria}</span>
                </h4>
                {materiaSeleccionada.nombreDocente && (
                  <p className="text-sm opacity-90 mt-1">
                    Docente: {materiaSeleccionada.nombreDocente}
                  </p>
                )}
              </div>
              <div className="text-sm text-right opacity-90">
                <p>
                  Período: <span className="font-semibold">{periodo.nombre}</span>
                </p>
              </div>
            </div>
          </div>
            <div className="overflow-x-auto max-w-full">
              <table
                className={`w-full border-collapse table-auto text-sm text-left
                  ${modoOscuro ? "text-gray-200 bg-gray-900" : "text-gray-700 bg-white"}`}
                style={{ tableLayout: "auto", maxWidth: "100%" }}
              >
                <thead className={`sticky top-0 z-10 ${modoOscuro ? "bg-gray-800" : "bg-gray-100"}`}>
              <tr>
                <th
                  className={`border px-2 py-1 font-semibold text-center w-auto
                    ${modoOscuro ? "border-gray-700" : "border-gray-300"}
                    text-xs sm:text-sm`}
                >
                  Estudiante
                </th>

                {tiposCalificacion.map((tipo) => (
                  <th
                    key={tipo.idTipoCalificacion}
                    className={`border px-2 py-1 font-semibold text-center w-auto
                      ${modoOscuro ? "border-gray-700" : "border-gray-300"}
                      text-xs sm:text-sm`}
                  >
                    {tipo.tipoCalificacionNombre}
                    <br />
                    <span className="text-[10px] text-gray-500">Max: {tipo.valorMaximo}</span>
                  </th>
                ))}

                <th
                  className={`border px-2 py-1 font-semibold text-center w-auto
                    ${modoOscuro ? "border-gray-700" : "border-gray-300"}
                    text-xs sm:text-sm`}
                >
                  Acumulado
                </th>

                <th
                  className={`border px-2 py-1 font-semibold text-center w-auto
                    ${modoOscuro ? "border-gray-700" : "border-gray-300"}
                    text-xs sm:text-sm`}
                >
                  %
                </th>

                <th
                  className={`border px-2 py-1 font-semibold text-center w-auto
                    ${modoOscuro ? "border-gray-700" : "border-gray-300"}
                    text-xs sm:text-sm`}
                >
                  Aprobado
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={tiposCalificacion.length + 4}
                    className="text-center py-4 text-gray-500"
                  >
                    No hay estudiantes inscritos para esta materia y grupo.
                  </td>
                </tr>
              )}
             {estudiantesFiltrados.map((est, index) => (
  <FilaEstudiante
    key={est.iD_Inscripcion}
    estudiante={est}
    index={index}
    tiposCalificacion={tiposCalificacion}
    calificaciones={calificaciones}
    setCalificaciones={setCalificaciones}
    obtenerNota={obtenerNota}
    guardarNota={guardarNota}
    claseStatusInput={claseStatusInput}
    acumuladoPorEstudiante={acumuladoPorEstudiante}
    porcentajePorEstudiante={porcentajePorEstudiante}
    aprobadoPorEstudiante={aprobadoPorEstudiante}
    esEstudiante={esEstudiante} 
    modoOscuro={modoOscuro}
  />
))}


            </tbody>
          </table>
          </div>
          <button
            onClick={() => {
              setMateriaSeleccionada(null);
              setEstudiantes([]);
              setCalificaciones([]);
            }}
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
              modoOscuro
                 ? "bg-red-600 hover:bg-red-500 text-white"
                 : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Calificacion;
