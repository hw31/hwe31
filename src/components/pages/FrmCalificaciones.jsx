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

const FrmCalificaciones = () => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const idUsuario = useSelector((state) => state.auth?.idUsuario);
  const usuario = useSelector((state) => state.auth?.usuario || null);

  useEffect(() => {
    console.log("Usuario en auth:", usuario);
    console.log("idUsuario:", idUsuario);
  }, [usuario, idUsuario]);

  const [asignaciones, setAsignaciones] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [statusGuardado, setStatusGuardado] = useState({});
  const [periodo, setPeriodo] = useState({ id: null, nombre: "" });

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
  (res.resultado || []).filter((tipo) => tipo.activo === true || tipo.activo === 1)/*SOLO MOSTRAR LOS ACTIVOS  */
);

      } catch (error) {
        console.error("Error al cargar tipos de calificación:", error);
      }
    };
    cargarTiposCalificacion();
  }, []);

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

  const materiasDelGrupo = grupoSeleccionado
    ? asignaciones.filter((a) => a.idGrupo === grupoSeleccionado.idGrupo)
    : [];

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

    // Buscar calificación existente con idCalificacion válido
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
      // Actualizar calificación existente
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
      // Insertar nueva calificación
      const res = await calificacionService.insertarCalificaciones(payload);

      // Debes asegurarte que aquí tienes el ID que devuelve el backend
      const nuevoId = res.idCalificacion || res.data?.idCalificacion;
      if (!nuevoId) {
        throw new Error("No se recibió idCalificacion tras insertar");
      }

      setCalificaciones((prev) => {
        // Eliminar registros temporales sin idCalificacion para esta nota
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

  const clasesBoton = `w-full sm:w-auto text-lg px-6 py-4 rounded-xl font-bold shadow transition-all ${
    modoOscuro
      ? "bg-indigo-700 text-white hover:bg-indigo-600"
      : "bg-blue-500 text-white hover:bg-blue-600"
  }`;

  const clasesCard = `rounded-2xl shadow-md p-4 sm:p-6 transition-all duration-300 w-full max-w-full mx-auto ${
    modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-800"
  }`;
const clasesCardGrid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6";

const clasesCardMateria = `
  bg-gradient-to-tr from-indigo-400 via-blue-500 to-pink-500 
  shadow-lg rounded-xl p-5 cursor-pointer
  transition transform hover:scale-105 hover:shadow-2xl
  text-white flex flex-col justify-between
`;

const clasesCardGrupo = `
  bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600
  shadow-lg rounded-xl p-5 cursor-pointer
  transition transform hover:scale-105 hover:shadow-2xl
  text-white flex flex-col justify-between
`;

return (
  <>
    {!grupoSeleccionado && (
      <>
        <h2 className={`text-2xl font-bold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
          Seleccione un grupo
        </h2>
        <div className={clasesCardGrid}>
          {gruposUnicos.map((grupo) => (
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
          {materiasDelGrupo.map((m) => (
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
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="hidden sm:inline">Volver</span>
    </button>
      </>
    )}

    {materiaSeleccionada && (
      <div className="overflow-auto max-w-full">
        <table
  className={`min-w-full border-collapse table-auto text-sm text-left ${
    modoOscuro ? "text-gray-200 bg-gray-900" : "text-gray-700 bg-white"
  }`}
>
  <thead className={`sticky top-0 z-10 ${modoOscuro ? "bg-gray-800" : "bg-gray-100"}`}>
    <tr>
      <th
        className={`border px-4 py-2 font-semibold text-center ${
          modoOscuro ? "border-gray-700" : "border-gray-300"
        }`}
      >
        Estudiante
      </th>
      {tiposCalificacion.map((tipo) => (
        <th
          key={tipo.idTipoCalificacion}
          className={`border px-4 py-2 font-semibold text-center whitespace-nowrap ${
            modoOscuro ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {tipo.tipoCalificacionNombre}
          <br />
          <span className="text-xs text-gray-500">Max: {tipo.valorMaximo}</span>
        </th>
      ))}
      <th className={`border px-4 py-2 font-semibold text-center ${
        modoOscuro ? "border-gray-700" : "border-gray-300"
      }`}>Acumulado</th>
      <th className={`border px-4 py-2 font-semibold text-center ${
        modoOscuro ? "border-gray-700" : "border-gray-300"
      }`}>%</th>
      <th className={`border px-4 py-2 font-semibold text-center ${
        modoOscuro ? "border-gray-700" : "border-gray-300"
      }`}>Aprobado</th>
    </tr>
  </thead>
  <tbody>
    {estudiantes.length === 0 && (
      <tr>
        <td
          colSpan={tiposCalificacion.length + 4}
          className="text-center py-4 text-gray-500"
        >
          No hay estudiantes inscritos para esta materia y grupo.
        </td>
      </tr>
    )}
    {estudiantes.map((est, index) => (
      <tr
        key={est.iD_Inscripcion}
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
          {est.nombreEstudiante || "Sin nombre"}
        </td>
        {tiposCalificacion.map((tipo) => {
          const clave = `${est.iD_Inscripcion}_${tipo.idTipoCalificacion}`;
          const notaActual = obtenerNota(est.iD_Inscripcion, tipo.idTipoCalificacion);
          return (
            <td
              key={tipo.idTipoCalificacion}
              className={`border px-2 py-1 text-center ${
                modoOscuro ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <input
                type="number"
                min="0"
                max={tipo.valorMaximo}
                step="0.1"
                value={notaActual}
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
                onBlur={(e) => guardarNota(est.iD_Inscripcion, tipo.idTipoCalificacion, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                className={`w-full text-center rounded border-2 px-1 py-0.5
                  ${claseStatusInput(clave)} 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 transition`}
                aria-label={`${tipo.tipoCalificacionNombre} de ${est.nombreEstudiante}`}
              />
            </td>
          );
        })}
        <td
          className={`border px-4 py-2 text-center font-semibold ${
            modoOscuro ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {acumuladoPorEstudiante(est.iD_Inscripcion).toFixed(2)}
        </td>
        <td
          className={`border px-4 py-2 text-center font-semibold ${
            modoOscuro ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {porcentajePorEstudiante(est.iD_Inscripcion).toFixed(1)}%
        </td>
        <td
          className={`border px-4 py-2 text-center font-semibold ${
            modoOscuro ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {aprobadoPorEstudiante(est.iD_Inscripcion) ? "Sí" : "No"}
        </td>
      </tr>
    ))}
  </tbody>
</table>

        <button
          onClick={() => {
            setMateriaSeleccionada(null);
            setEstudiantes([]);
            setCalificaciones([]);
          }}
       className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
        modoOscuro
          ? "bg-red-600 hover:bg-red-500 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
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

export default FrmCalificaciones;