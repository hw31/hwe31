import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

import inscripcionService from "../../services/Inscripcion";
import periodoService from "../../services/PeriodoAcademico";
import estadoService from "../../services/Estado";
import usuariosRolesService from "../../services/UsuariosRoles";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import ContadoresInscripcion from "../Shared/ContadoresInscripcion";

const Inscripcion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const idUsuarioLogueado = useSelector((state) => state.auth.idUsuario);
  const rolLower = rol ? rol.toLowerCase() : "";

  const [inscripciones, setInscripciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [usuariosRoles, setUsuariosRoles] = useState([]);
  const [usuariosEstudiantes, setUsuariosEstudiantes] = useState([]); 

  const [usuarioInput, setUsuarioInput] = useState("");

  const [mostrarEstudiantes, setMostrarEstudiantes] = useState(false);
  const estudianteRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);


  // Filtrado estudiantes activos (rol=3)
useEffect(() => {
  const estudiantes = usuariosRoles.filter((u) => u.iD_Rol === 3);
  setUsuariosEstudiantes(estudiantes);
}, [usuariosRoles]);

const seleccionarEstudiante = (id, nombre) => {
  setForm({ ...form, idUsuario: id });
  setUsuarioInput(nombre);
};

  // Formulario
    const [form, setForm] = useState({
    idInscripcion: 0,
    idUsuario: 0,  
    idPeriodoAcademico: 0,
    idEstado: 4,
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    confirmar: false,
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Iconos estado
  const getEstadoIcon = (idEstado) => {
    switch (idEstado) {
      case 4:
        return (
          <span
            title="En Proceso"
            className="text-yellow-500 text-xl inline-flex items-center"
            aria-label="En Proceso"
            role="img"
          >
            <FaHourglassHalf />
          </span>
        );
      case 10:
        return (
          <span
            title="Confirmado"
            className="text-green-600 text-xl inline-flex items-center"
            aria-label="Confirmado"
            role="img"
          >
            <FaCheckCircle />
          </span>
        );
      default:
        return (
          <span
            title="Pendiente"
            className="text-gray-400 text-xl inline-flex items-center"
            aria-label="Pendiente"
            role="img"
          >
            ●
          </span>
        );
    }
  };

  // Cargar inscripciones enriquecidas con nombres y fechas formateadas
 const cargarInscripciones = async (usuarios = usuariosRoles, periodosList = periodos) => {
  setLoading(true);
  try {
    const res = await inscripcionService.listarInscripciones();
    if (Array.isArray(res)) {
      const mapeadas = res.map((i) => {
        const idUsuario = i.iD_Usuario ?? i.idUsuario;
        const idPeriodo = i.iD_PeriodoAcademico ?? i.idPeriodoAcademico;
        const usuarioRol = usuarios.find((ur) => ur.iD_Usuario === idUsuario);
        const periodo = periodosList.find((p) => p.idPeriodoAcademico === idPeriodo);
        const idEstado = i.iD_Estado ?? i.idEstado;

        return {
          idInscripcion: i.iD_Inscripcion ?? i.idInscripcion,
          idUsuario,
          nombreEstudiante: i.nombreEstudiante ?? usuarioRol?.nombre_Usuario ?? "Desconocido",
          idPeriodoAcademico: idPeriodo,
          nombrePeriodo: i.nombrePeriodo ?? periodo?.nombrePeriodo ?? "Sin nombre",
          fechaInscripcion: formatearFecha(i.fechaInscripcion),
          idCreador: i.iD_Creador ?? i.idCreador,
          creador: i.creador ?? "ND",
          idModificador: i.iD_Modificador ?? i.idModificador,
          modificador: i.modificador ?? "ND",
          fechaCreacion: formatearFecha(i.fecha_Creacion ?? i.fechaCreacion),
          fechaModificacion: formatearFecha(i.fecha_Modificacion ?? i.fechaModificacion),
          idEstado,
          estado: i.estado ?? "ND",
          estadoIcono: getEstadoIcon(idEstado),
        };
      });
      setInscripciones(mapeadas);
    } else {
      setInscripciones([]);
    }
  } catch (error) {
    Swal.fire("Error", "No se pudieron cargar las inscripciones", "error");
  } finally {
    setLoading(false);
  }
};


  // Cargar datos auxiliares y luego inscripciones
  const cargarDatosIniciales = async () => {
  if (rolLower === "administrador") {
    const [usuariosRolesRes, periodosRes, estadosRes] = await Promise.all([
      usuariosRolesService.listarUsuariosRoles(),
      periodoService.listarPeriodosAcademicos(),
      estadoService.listarEstados(),
    ]);
    const usuarios = usuariosRolesRes || []; // <-- acá
    setUsuariosRoles(usuarios);
    setPeriodos(periodosRes.resultado || []);
    setEstados(
      (estadosRes.resultado || []).filter((e) => e.idEstado === 4 || e.idEstado === 10)
    );
    setTimeout(() => {
      cargarInscripciones(usuarios, periodosRes.resultado || []);
    }, 0);
  } else {
    await cargarInscripciones(usuariosRoles, periodos);
  }
};

  useEffect(() => {
    cargarDatosIniciales();
  }, [rolLower]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (estudianteRef.current && !estudianteRef.current.contains(event.target)) {
          setMostrarEstudiantes(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const estudiantesFiltrados = usuariosEstudiantes.filter((u) =>
    u.nombre_Usuario?.toLowerCase().includes(usuarioInput.toLowerCase())
  );

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    setForm({
      idInscripcion: 0,
      idUsuario: 0,
      idPeriodoAcademico: 0,
      idEstado: 4,
      fechaInscripcion: new Date().toISOString().slice(0, 10),
      confirmar: false,
    });
    setUsuarioInput("");
    setMostrarEstudiantes(false);
    setModoEdicion(false);
    setFormError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  // Validar fecha
  const esFechaValida = (fecha) => !isNaN(new Date(fecha).getTime());

  // Editar inscripción
  const handleEditar = (item) => {
    if (rolLower === "estudiante" && item.estado === "Confirmado") return;

    const fechaValida = esFechaValida(item.fechaInscripcion)
      ? item.fechaInscripcion.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    setForm({
      idInscripcion: item.idInscripcion,
      idUsuario: item.idUsuario,
      idPeriodoAcademico: item.idPeriodoAcademico,
      idEstado: item.idEstado,
      fechaInscripcion: fechaValida,
      confirmar: false,
    });

    // Buscar el usuario en la lista para mostrar su nombre en el input
    const usuarioRolSeleccionado = usuariosRoles.find((ur) => ur.iD_Usuario === item.idUsuario);
    if (usuarioRolSeleccionado) {
      setUsuarioInput(usuarioRolSeleccionado.nombre_Usuario);
    } else {
      setUsuarioInput("");
    }

    setMostrarEstudiantes(false);
    setModoEdicion(true);
    setFormError("");
    setModalOpen(true);
  };

  const handleGuardar = async () => {
  if (rolLower === "estudiante" && !form.confirmar)
    return setFormError("Debe confirmar su inscripción");

  if (rolLower !== "estudiante") {
    if (!form.idUsuario || !form.idPeriodoAcademico)
      return setFormError("Debe seleccionar usuario y periodo");
  }

  if (!esFechaValida(form.fechaInscripcion)) {
    return setFormError("La fecha de inscripción no es válida.");
  }

  const payload = {
    idInscripcion: form.idInscripcion,
    idUsuario: rolLower === "estudiante" ? idUsuarioLogueado : form.idUsuario,
    idPeriodoAcademico: form.idPeriodoAcademico,
    fechaInscripcion: form.fechaInscripcion,
    idEstado: rolLower === "estudiante" ? 10 : form.idEstado,
  };

  try {
    setFormLoading(true);
    const res = form.idInscripcion
      ? await inscripcionService.actualizarInscripcion(payload)
      : await inscripcionService.insertarInscripcion(payload);

    if (
      res?.mensaje?.toLowerCase().includes("exitosamente") ||
      res?.mensaje?.toLowerCase().includes("correctamente")
    ) {
      Swal.fire("¡Éxito!", res.mensaje, "success");
      cargarInscripciones();
      cerrarModal();
    } else {
      Swal.fire("Error", res.mensaje || "Error al guardar la inscripción.", "error");
    }
  } catch (err) {
    const mensajeError =
      err?.response?.data?.mensaje || err?.message || "Error al guardar";

    Swal.fire("Error", mensajeError, "error");
  } finally {
    setFormLoading(false);
  }
};

  // Columnas tabla
  const columnasAdmin = [
    { key: "nombreEstudiante", label: "Estudiante" },
    { key: "nombrePeriodo", label: "Periodo" },
    { key: "fechaInscripcion", label: "Fecha Inscripción" },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    { key: "estadoIcono", label: "Estado" },
  ];

  const columnasEstudiante = [
    { key: "nombrePeriodo", label: "Periodo" },
    { key: "estadoIcono", label: "Estado" },
    { key: "fechaInscripcion", label: "Fecha Inscripción" },
  ];

  // Filtrar inscripciones según rol y búsqueda
  const datosFiltrados = inscripciones.filter((i) => {
    if (rolLower === "estudiante") {
      return i.idUsuario === parseInt(idUsuarioLogueado);
    }
    return (
      i.nombreEstudiante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.nombrePeriodo?.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // Paginación: calcular índices y datos actuales
  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados =
    rolLower === "administrador"
      ? datosFiltrados.slice(indexPrimeraFila, indexUltimaFila)
      : datosFiltrados;
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);

  // Reset pagina al cambiar búsqueda o filas por pagina
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  // Clases input según modo oscuro
  const inputClass =
    "w-full px-3 py-2 border rounded focus:outline-none transition " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-indigo-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-600");

  const tieneInscripcionConfirmada = inscripciones.some(
  (i) => i.idUsuario === parseInt(idUsuarioLogueado) && i.idEstado === 10
  );

  const puedeEditarFila = (fila) => {
  const idUsuario = parseInt(idUsuarioLogueado);
  if (rolLower === "estudiante") {
    const result = fila.idUsuario === idUsuario && fila.estado !== "Confirmado";
    return result;
  }
  return true;
};

  return (
<>

      {rolLower === "administrador"&& (
        <>
          <BuscadorBase
            placeholder="Buscar..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
              titulo="Inscripcion"
          />

          <ContadoresInscripcion
            enProceso={inscripciones.filter((i) => i.idEstado === 4).length}
            confirmados={inscripciones.filter((i) => i.idEstado === 10).length}
            total={inscripciones.length}
            onNuevo={abrirModalNuevo}
            modoOscuro={modoOscuro}
          />
        </>
      )}

      {/* Select filas por página - Solo Admin */}
      {rolLower === "administrador" && (
        <div className="flex flex-wrap items-center justify-start gap-2 text-sm mt-2">
          <label htmlFor="filasPorPagina" className="font-semibold">
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            value={filasPorPagina}
            onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
            className={inputClass + " text-sm py-1 px-2"}
            style={{ maxWidth: "5rem" }}
          >
            {[10, 30, 45, 60, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto w-full mt-4">
        <div className="min-w-full sm:min-w-[700px]">
          <TablaBase
            datos={datosPaginados}
            columnas={rolLower === "administrador" ? columnasAdmin : columnasEstudiante}
            modoOscuro={modoOscuro}
            puedeEditar={puedeEditarFila} 
            onEditar={handleEditar}
            loading={loading}
          />
        </div>
      </div>

      {/* Paginación con botones, solo admin */}
      {rolLower === "administrador" && totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`px-4 py-2 rounded transition ${
              paginaActual === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Anterior
          </button>

          <div className="text-lg font-semibold text-center w-full sm:w-auto">
            Página {paginaActual} de {totalPaginas}
          </div>

          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
            className={`px-4 py-2 rounded transition ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      <ModalBase
        isOpen={modalOpen}
        onClose={cerrarModal}
        titulo={
          rolLower === "estudiante"
            ? modoEdicion
              ? "Editar inscripción"
              : "Confirmar inscripción"
            : modoEdicion
            ? "Editar inscripción"
            : "Nueva inscripción"
        }
        modoOscuro={modoOscuro}
        maxWidth="max-w-md"
      >
        <FormularioBase
          onSubmit={handleGuardar} 
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Inscripción"
        >
          <div className="space-y-5">
            {/* Formulario admin */}
            {rolLower === "administrador" && (
              <>
                {/* Estudiante con autocompletado */}
              <div className="mb-4">
              <label className="relative" ref={estudianteRef}>
                Estudiante:
                <input
                   type="text"
                      value={usuarioInput}
                      onChange={(e) => {
                        setUsuarioInput(e.target.value);
                        setForm({ ...form, idUsuario: 0 }); 
                        setMostrarEstudiantes(true);
                      }}
                  placeholder="Escriba para buscar estudiante"
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  autoComplete="off"
                  required
                />
                {mostrarEstudiantes && usuarioInput && estudiantesFiltrados.length > 0 && (
                  <ul
                    className={`absolute z-50 max-h-40 w-full overflow-auto rounded border ${
                      modoOscuro
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {estudiantesFiltrados.map((u) => (
                      <li
                        key={u.iD_Usuario}
                        onClick={() => {
                          seleccionarEstudiante(u.iD_Usuario, u.nombre_Usuario);
                          setMostrarEstudiantes(false);
                        }}
                        className="cursor-pointer px-3 py-1 hover:bg-blue-600 hover:text-white"
                      >
                        {u.nombre_Usuario}
                      </li>
                    ))}
                  </ul>
                )}
              </label>
              </div>
                {/* Select periodo */}
                <select
                  name="idPeriodoAcademico"
                  value={form.idPeriodoAcademico}
                  onChange={(e) =>
                    setForm({ ...form, idPeriodoAcademico: parseInt(e.target.value) || 0 })
                  }
                  className={inputClass}
                  aria-label="Seleccionar periodo académico"
                  required
                >
                  <option value={0}>Seleccione periodo</option>
                  {periodos.map((p) => (
                    <option key={p.idPeriodoAcademico} value={p.idPeriodoAcademico}>
                      {p.nombrePeriodo}
                    </option>
                  ))}
                </select>

                {/* Select estado (solo 4 y 10) */}
                <select
                  name="idEstado"
                  value={form.idEstado}
                  onChange={(e) => setForm({ ...form, idEstado: parseInt(e.target.value) })}
                  className={inputClass}
                  aria-label="Seleccionar estado"
                  required
                >
                  <option value={4}>Pendiente</option>
                  <option value={10}>Confirmado</option>
                </select>
              </>
            )}

            {/* Formulario estudiante */}
            {rolLower === "estudiante" && (
              <div className="flex flex-col items-center gap-6">
                <label
                  htmlFor="confirmarInscripcion"
                  className={`flex items-center gap-3 cursor-pointer select-none text-lg font-semibold ${
                    modoOscuro ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <input
                    id="confirmarInscripcion"
                    type="checkbox"
                    checked={form.confirmar}
                    onChange={(e) => setForm({ ...form, confirmar: e.target.checked })}
                    className="w-6 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-110"
                    aria-checked={form.confirmar}
                    aria-label="Confirmar inscripción"
                  />
                  Confirmo mi inscripción
                </label>

                <div
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    ${
                      form.idEstado === 4
                        ? "bg-yellow-400 text-yellow-900 animate-pulse shadow-lg"
                        : form.idEstado === 10
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-300 text-gray-700"
                    }
                    transition-colors duration-700`}
                  aria-live="polite"
                >
                  {getEstadoIcon(form.idEstado)}
                  <span className="ml-2 text-lg select-none">
                    {form.idEstado === 4
                      ? "En Proceso"
                      : form.idEstado === 10
                      ? "Confirmado"
                      : "Pendiente"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FormularioBase>
      </ModalBase>
  </>
  );
};

export default Inscripcion;
