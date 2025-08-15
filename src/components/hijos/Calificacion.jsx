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
import ExportButtons from "./ExportButtons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResumenFinal from "./ResumenFinal";

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
const esSecretario = rolLower === "secretario";
const puedeEditar = rolLower === "docente" || rolLower === "administrador";


  const [asignaciones, setAsignaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [statusGuardado, setStatusGuardado] = useState({});
const [periodo, setPeriodo] = useState({ id: null, nombre: "" });

  const [inscritosPorMateria, setInscritosPorMateria] = useState({});
  const [filtroAprobado, setFiltroAprobado] = useState("");
  const [filasPorPagina, setFilasPorPagina] = useState(10); // default 10 filas
  const [paginaActual, setPaginaActual] = useState(1);


  // Cuando cambia materia o estudiantes actualiza botón mostrar lista
    useEffect(() => {
    if (materiaSeleccionada && estudiantes.length > 0) {
      
    }
  }, [estudiantes, materiaSeleccionada]);

 useEffect(() => {
    const cargarPeriodo = async () => {
      try {
        const response = await listarPeriodosAcademicos(); // tu servicio
        const periodos = response.resultado || [];
        const activo = periodos.find((p) => p.activo === true);
        if (activo) {
          setPeriodo({ id: activo.idPeriodoAcademico, nombre: activo.nombrePeriodo });
        } else {
          console.warn("No hay período académico activo.");
          setPeriodo({ id: null, nombre: "" });
        }
      } catch (error) {
        console.error("Error cargando período académico:", error.message);
      }
    };
    cargarPeriodo();
  }, []);

  // Cargar asignaciones, tipos y calcular inscritos por materia
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const asigns = await asignacionDocenteService.listarAsignaciones();
        setAsignaciones(asigns);

        const tipos = await tipoCalificacionService.listarTiposCalificacion();
        setTiposCalificacion(
          (tipos.resultado || []).filter((tipo) => tipo.activo === true || tipo.activo === 1)
        );

        const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();
        const inscripciones = await inscripcionesService.listarInscripciones();

        // Contar inscritos por materia
      const inscritosCount = {};
asigns.forEach((asig) => {
  const { idMateria, idGrupo } = asig;
  const inscritosMateria = inscripciones.filter((insc) =>
    inscMat.some(
      (im) =>
        im.iD_Grupo === idGrupo &&
        im.idMateria === idMateria &&
        im.idInscripcion === insc.iD_Inscripcion
    )
  );
  inscritosCount[`${idGrupo}_${idMateria}`] = inscritosMateria.length;
});


        setInscritosPorMateria(inscritosCount);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    cargarDatosIniciales();
  }, []);

useEffect(() => {
  const cargarDatosMateria = async () => {
    if (!materiaSeleccionada) return;

    setEstudiantes([]);
    setCalificaciones([]);

    try {
      const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();
      const inscripciones = await inscripcionesService.listarInscripciones();

      // 1. Filtrar inscMat por grupo y materia, y estado activo
      const inscMatFiltradas = inscMat.filter(
        (im) =>
          im.iD_Grupo === materiaSeleccionada.idGrupo &&  // compara con propiedad exacta
          im.idMateria === materiaSeleccionada.idMateria &&
          im.idEstado === 1 // solo activas
      );

      // 2. Obtener solo los idInscripcion que corresponden
      const idInscripcionesValidas = inscMatFiltradas.map((im) => im.idInscripcion);

      // 3. Filtrar estudiantes inscritos SOLO con esos idInscripcion
      const inscritos = inscripciones.filter((insc) =>
        idInscripcionesValidas.includes(insc.iD_Inscripcion)
      );

      setEstudiantes(inscritos);

      // 4. Filtrar calificaciones para esos estudiantes y materia
      const resCalifs = await calificacionService.listarCalificacion();
      if (resCalifs.success) {
    const califsFiltradas = resCalifs.data.filter(
  (c) =>
    c.idMateria === materiaSeleccionada.idMateria &&
    idInscripcionesValidas.includes(c.idInscripcion)
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

  // Extracción y filtrados de grupos y materias
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

  const materiasDelGrupo = grupoSeleccionado
    ? asignaciones.filter((a) => a.idGrupo === grupoSeleccionado.idGrupo)
    : [];

  const materiasFiltradas = grupoSeleccionado && !materiaSeleccionada
    ? materiasDelGrupo.filter((m) =>
        m.nombreMateria.toLowerCase().includes((filtroGeneral || "").toLowerCase())
      )
    : [];
    const materiasDelGrupoPreparadas = asignaciones.map(asig => ({
  idMateria: asig.idMateria,
  nombreMateria: asig.nombreMateria,
}));


  // Manejar selección materia
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
useEffect(() => {
  if (!grupoSeleccionado && !materiaSeleccionada) {
    const cargarDatosGlobales = async () => {
      try {
        // Cargar asignaciones, tipos, inscripciones, calificaciones
        const asigns = await asignacionDocenteService.listarAsignaciones();
        setAsignaciones(asigns);

        const tipos = await tipoCalificacionService.listarTiposCalificacion();
        setTiposCalificacion(
          (tipos.resultado || []).filter((tipo) => tipo.activo === true || tipo.activo === 1)
        );

        const inscMat = await inscripcionesMateriasService.listarInscripcionesMaterias();
        const inscripciones = await inscripcionesService.listarInscripciones();

        // Unificar estudiantes inscritos para todas las asignaciones (podrías filtrar según necesites)
        const estudiantesUnicos = [];
        const idsEstudiantes = new Set();

        inscripciones.forEach((insc) => {
          if (!idsEstudiantes.has(insc.iD_Inscripcion)) {
            idsEstudiantes.add(insc.iD_Inscripcion);
            estudiantesUnicos.push(insc);
          }
        });
        setEstudiantes(estudiantesUnicos);

        // Cargar calificaciones para todas las materias/inscripciones
        const resCalifs = await calificacionService.listarCalificacion();
        if (resCalifs.success) {
          setCalificaciones(resCalifs.data);
        } else {
          setCalificaciones([]);
        }
      } catch (error) {
        console.error("Error cargando datos globales:", error);
        setEstudiantes([]);
        setCalificaciones([]);
      }
    };

    cargarDatosGlobales();
  }
}, [grupoSeleccionado, materiaSeleccionada]);

  // Funciones para notas y estado guardado (igual que antes)
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

    // Buscar si la calificación ya existe para actualizar
    const califExistente = calificaciones.find(
      (c) =>
        c.idInscripcion === idInscripcion &&
        c.idTipoCalificacion === idTipoCalificacion &&
        c.idMateria === materiaSeleccionada.idMateria &&
        c.idCalificacion !== undefined &&
        c.idCalificacion !== null
    );

    // Construir payload estándar
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
      // Si existe, actualizar
      payload.IdCalificacion = califExistente.idCalificacion;

      await calificacionService.actualizarCalificaciones(payload);

      setCalificaciones((prev) =>
        prev.map((c) =>
          c.idCalificacion === califExistente.idCalificacion
            ? { ...c, calificacion: notaNum }
            : c
        )
      );

      toast.success("✅ Nota actualizada correctamente");
    } else {
      // Insertar nueva calificación
      const res = await calificacionService.insertarCalificaciones(payload);

      // Extraer el nuevo id desde la propiedad correcta (numero)
      const nuevoId = res.idCalificacion || res.data?.idCalificacion || res.numero || res.data?.numero;

      if (!nuevoId) throw new Error("No se recibió id de calificación tras insertar");

      setCalificaciones((prev) => [
        ...prev,
        {
          idCalificacion: nuevoId,
          idInscripcion,
          idTipoCalificacion,
          idMateria: materiaSeleccionada.idMateria,
          calificacion: notaNum,
          // puedes agregar más campos si hace falta
        },
      ]);

      // Mostrar mensaje del backend si existe, sino mensaje por defecto
      toast.success(`✅ ${res.mensaje || "Nota guardada correctamente"}`);
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
    toast.error(`❌ Error guardando nota: ${error.message || error}`);
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

 const estudiantesFiltrados = materiaSeleccionada
    ? estudiantes.filter((est) => {
        if (esEstudiante) {
          // Cambia 'iD_Usuario' por la propiedad correcta que veas en el console.log
          const estId = String(est.iD_Usuario || est.idUsuario || est.ID_Usuario || est.userId || "");
          const coincide = estId === String(idUsuario);
          if (!coincide) return false;
        }
        // Filtro por nombre según filtroGeneral
        if (!est.nombreEstudiante.toLowerCase().includes((filtroGeneral || "").toLowerCase())) {
          return false;
        }
      if (filtroAprobado !== "") {
        const aprobado = aprobadoPorEstudiante(est.iD_Inscripcion);
        if (filtroAprobado === "si" && !aprobado) return false;
        if (filtroAprobado === "no" && aprobado) return false;
      }
      return true;
    })
  : [];
  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
// Extraer solo las filas para la página actual
  const estudiantesPaginados = estudiantesFiltrados.slice(indicePrimeraFila, indiceUltimaFila);
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

  // Datos para exportar
  const datosExportar = estudiantesFiltrados.map((est) => {
    const fila = {
      Estudiante: est.nombreEstudiante || est.nombre || "N/D",
    };

    tiposCalificacion.forEach((tipo) => {
      fila[tipo.tipoCalificacionNombre] = obtenerNota(est.iD_Inscripcion, tipo.idTipoCalificacion) || "";
    });

    fila.Acumulado = acumuladoPorEstudiante(est.iD_Inscripcion).toFixed(2);
    fila.Porcentaje = porcentajePorEstudiante(est.iD_Inscripcion).toFixed(2) + "%";
    fila.Aprobado = aprobadoPorEstudiante(est.iD_Inscripcion) ? "Sí" : "No";

    return fila;
  });
// Filtrar solo calificaciones activas (idEstado === 1) y únicas por idInscripcion + idTipoCalificacion
const calificacionesFiltradas = (() => {
  const mapa = new Map();

  calificaciones.forEach(c => {
    if (c.idEstado !== 1) return; // solo activas

    const key = `${c.idInscripcion}_${c.idTipoCalificacion}`;

    const actual = mapa.get(key);

    if (!actual) {
      mapa.set(key, c);
    } else {
      // si hay más de una activa, toma la calificación con mayor nota o más reciente
      if (c.calificacion > actual.calificacion) {
        mapa.set(key, c);
      } else if (
        c.calificacion === actual.calificacion &&
        new Date(c.fechaModificacion) > new Date(actual.fechaModificacion)
      ) {
        mapa.set(key, c);
      }
    }
  });

  return Array.from(mapa.values());
})();

  return (
    <>
      {!grupoSeleccionado && periodo.id && (
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
                  <p className="mt-1 text-sm opacity-80">
                    Estudiantes inscritos:{" "}
                   <span className="font-semibold">
                    {inscritosPorMateria[`${grupoSeleccionado.idGrupo}_${m.idMateria}`] ?? 0}
                  </span>

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
                <p className="text-sm mt-1 opacity-90">
                  Estudiantes inscritos: <span className="font-semibold">{estudiantes.length}</span>
                </p>
              </div>
              <div className="text-sm text-right opacity-90">
                <p>
                  Período: <span className="font-semibold">{periodo.nombre}</span>
                </p>
              </div>
            </div>
          </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
  {/* Controles de filtrado (izquierda) */}
  <div className="flex flex-wrap gap-4">
    <div className="flex items-center gap-2">
      <label htmlFor="filasPorPagina" className="font-semibold">
        Filas por página:
      </label>
      <select
        id="filasPorPagina"
        value={filasPorPagina}
        onChange={(e) => {
          setFilasPorPagina(Number(e.target.value));
          setPaginaActual(1);
        }}
        className={`border rounded px-2 py-1 ${
          modoOscuro ? "bg-gray-700 text-white" : "bg-white text-gray-800"
        }`}
      >
        {[5, 10, 20, 50].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>

    <div className="flex items-center gap-2">
      <label htmlFor="filtroAprobado" className="font-semibold">
        Filtrar por aprobado:
      </label>
      <select
        id="filtroAprobado"
        value={filtroAprobado}
        onChange={(e) => setFiltroAprobado(e.target.value)}
        className={`border rounded px-2 py-1 ${
          modoOscuro ? "bg-gray-700 text-white" : "bg-white text-gray-800"
        }`}
      >
        <option value="">Todos</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
  </div>

  {/* Botones exportar (derecha) */}
  {(rolLower === "administrador" || rolLower === "secretario" || rolLower ==="docente") && (
    <ExportButtons
      data={datosExportar}
      fileName={`Calificaciones_${grupoSeleccionado.nombreGrupo}_${materiaSeleccionada.nombreMateria}`}
    />
  )}
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
           {estudiantesPaginados.map((est, index) => (
               <FilaEstudiante
                key={est.iD_Inscripcion}
                estudiante={est}
                index={index}
                tiposCalificacion={tiposCalificacion}
                calificaciones={calificacionesFiltradas}
                setCalificaciones={setCalificaciones}
                obtenerNota={obtenerNota}
                guardarNota={guardarNota}
                claseStatusInput={claseStatusInput}
                acumuladoPorEstudiante={acumuladoPorEstudiante}
                porcentajePorEstudiante={porcentajePorEstudiante}
                aprobadoPorEstudiante={aprobadoPorEstudiante}
                esEstudiante={esEstudiante}
                modoOscuro={modoOscuro}
                puedeEditar={puedeEditar} 
                esSecretario={esSecretario} 
              />
              ))}

            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-400"
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {Math.ceil(estudiantesFiltrados.length / filasPorPagina)}
            </span>
            <button
              onClick={() =>
                setPaginaActual((prev) =>
                  Math.min(prev + 1, Math.ceil(estudiantesFiltrados.length / filasPorPagina))
                )
              }
              disabled={paginaActual === Math.ceil(estudiantesFiltrados.length / filasPorPagina)}
              className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-400"
            >
              Siguiente
            </button>
          </div>

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
      <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={modoOscuro ? "dark" : "light"}
    />
  {!grupoSeleccionado && !materiaSeleccionada && periodo?.id && (
  <ResumenFinal
    estudiantes={estudiantes}
    calificaciones={calificaciones}
    tiposCalificacion={tiposCalificacion}
    materiasDelGrupo={materiasDelGrupoPreparadas}
    modoOscuro={modoOscuro}
    idUsuario={idUsuario}
    rol={rolLower}
    periodoId={periodo.id} // pasa el id correcto
  />
)}

  </>

  );
};

export default Calificacion;
