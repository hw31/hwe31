import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import rescateEvaluacionService from "../../services/RescateEvaluacion";
import estadoService from "../../services/Estado";
import usuarioService from "../../services/UsuariosRoles"; // Servicio UsuariosRoles
import materiaService from "../../services/Materias";
import periodoService from "../../services/PeriodoAcademico";

import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/ContadoresRescate";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmRescateEvaluacion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [usuariosCompleto, setUsuariosCompleto] = useState([]); // TODOS los usuarios con roles
  const [usuariosEstudiantes, setUsuariosEstudiantes] = useState([]); // Sólo estudiantes (rol 3)
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [usuarioInput, setUsuarioInput] = useState("");
  const [materiaInput, setMateriaInput] = useState("");

  const [mostrarMaterias, setMostrarMaterias] = useState(false);
  const materiaRef = useRef(null);

  const [mostrarEstudiantes, setMostrarEstudiantes] = useState(false);
  const estudianteRef = useRef(null);

  const [form, setForm] = useState({
    idRescate: null,
    idUsuarioEstudiante: "",
    idMateria: "",
    idPeriodoAcademico: "",
    calificacionRescate: "",
    observaciones: "",
    idEstado: "",
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cargarDatos = async () => {
  setLoading(true);
  try {
    const [
      resRescates,
      usuariosRoles,
      resMaterias,
      resPeriodos,
      resEstados,
    ] = await Promise.all([
      rescateEvaluacionService.listarEvaluacionesRescatables(),
      usuarioService.listarUsuariosRoles(),
      materiaService.listarMaterias(),
      periodoService.listarPeriodosAcademicos(),
      estadoService.listarEstados(),
    ]);

    if (!resRescates?.resultado) throw new Error("Error en rescates");
    if (!Array.isArray(usuariosRoles)) throw new Error("Error en usuariosRoles");
    if (!Array.isArray(resMaterias)) throw new Error("Error en materias");
    if (!resPeriodos?.resultado) throw new Error("Error en periodos");
    if (!resEstados?.datos && !resEstados?.data) throw new Error("Error en estados");

    setUsuariosCompleto(usuariosRoles);

    // Filtrar estudiantes rol 3
    const estudiantes = usuariosRoles.filter((u) => u.iD_Rol === 3);
    setUsuariosEstudiantes(estudiantes);

    setMaterias(resMaterias);
    setPeriodos(resPeriodos.resultado);

    // Para estados: si resEstados.datos existe, usar eso; si data, usar data
    const estadosLista = resEstados.datos || resEstados.data || [];
    const estadosFiltrados = estadosLista.filter((e) => [8, 9].includes(e.iD_Estado));
    setEstados(estadosFiltrados);

    // Mapear rescates con datos correctos
    const datos = resRescates.resultado.map((r) => ({
      idRescate: r.idRescate,
      estudiante: estudiantes.find((u) => u.iD_Usuario === r.idUsuario)?.nombre_Usuario || "Desconocido",
      idUsuarioEstudiante: r.idUsuario,
      materia: resMaterias.find((m) => m.idMateria === r.idMateria)?.nombreMateria || "Desconocido",
      idMateria: r.idMateria,
      periodo: resPeriodos.resultado.find((p) => p.idPeriodoAcademico === r.idPeriodo)?.nombrePeriodo || "Desconocido",
      idPeriodoAcademico: r.idPeriodo,
      calificacionRescate: r.calificacionRescate,
      observaciones: r.observaciones,
      estado: estadosFiltrados.find((e) => e.iD_Estado === r.idEstado)?.nombre_Estado || "Desconocido",
      idEstado: r.idEstado,
      fechaSolicitud: formatearFecha(r.fechaSolicitud),
      fechaCreacion: formatearFecha(r.fechaCreacion),
      fechaModificacion: formatearFecha(r.fechaModificacion),
      creador: usuariosRoles.find((u) => u.iD_Usuario === (r.idCreador ?? r.id_Creador))?.nombre_Usuario || "N/D",
      modificador: usuariosRoles.find((u) => u.iD_Usuario === (r.idModificador ?? r.id_Modificador))?.nombre_Usuario || "N/D",
    }));

    setRescates(datos);
  } catch (error) {
    console.error(error);
    Swal.fire("Error", error.message, "error");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  // Manejo de clic fuera para ocultar listado materias
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (materiaRef.current && !materiaRef.current.contains(event.target)) {
        setMostrarMaterias(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manejo de clic fuera para ocultar listado estudiantes
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

  // Filtrar estudiantes para autocompletado, sólo del array estudiantes (rol 3)
  const estudiantesFiltrados = usuariosEstudiantes.filter((u) =>
    u.nombre_Usuario?.toLowerCase().includes(usuarioInput.toLowerCase())
  );

  const materiasFiltradas = materias.filter((m) =>
    m.nombreMateria.toLowerCase().includes(materiaInput.toLowerCase())
  );

  // Filtrar rescates por búsqueda
  const rescatesFiltrados = rescates.filter((r) =>
    r.estudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.periodo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(rescatesFiltrados.length / filasPorPagina);
  const rescatesPaginados = rescatesFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const completados = rescates.filter((r) => r.idEstado === 8).length;
  const enProceso = rescates.filter((r) => r.idEstado === 9).length;
  const total = rescates.length;

  const renderEstadoIcono = (idEstado) => {
    switch (idEstado) {
      case 8:
        return <FaCheckCircle className="text-green-500 mx-auto" />;
      case 9:
        return <FaHourglassHalf className="text-yellow-500 mx-auto" />;
      default:
        return <span className="mx-auto">-</span>;
    }
  };

  const columnas = [
    { key: "estudiante", label: "Estudiante" },
    { key: "materia", label: "Materia" },
    { key: "periodo", label: "Periodo" },
    {
      key: "observaciones",
      label: "Observaciones",
      render: (row) => (
        <span title={row.observaciones}>
          {row.observaciones?.length > 40
            ? row.observaciones.slice(0, 40) + "..."
            : row.observaciones || "-"}
        </span>
      ),
    },
    { key: "calificacionRescate", label: "Calificación" },
    { key: "fechaSolicitud", label: "Fecha Solicitud" },
    { key: "creador", label: "Creado por" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "modificador", label: "Modificado por" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    { key: "estado", label: "Estado", render: (row) => renderEstadoIcono(row.idEstado) },
  ];

  const abrirModalNuevo = () => {
    setForm({
      idRescate: null,
      idUsuarioEstudiante: "",
      idMateria: "",
      idPeriodoAcademico: "",
      calificacionRescate: "",
      observaciones: "",
      idEstado: "",
    });
    setUsuarioInput("");
    setMateriaInput("");
    setModoEdicion(false);
    setFormError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (resc) => {
    setForm({ ...resc });
    setUsuarioInput(resc.estudiante || "");
    setMateriaInput(resc.materia || "");
    setModoEdicion(true);
    setFormError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
    setMostrarMaterias(false);
    setMostrarEstudiantes(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError("");
  };

  const validarFormulario = () => {
    const { idUsuarioEstudiante, idMateria, idPeriodoAcademico, calificacionRescate, idEstado } = form;
    if (!idUsuarioEstudiante || !idMateria || !idPeriodoAcademico || calificacionRescate === "" || idEstado === "") {
      setFormError("Todos los campos son obligatorios.");
      return false;
    }
    const calif = parseFloat(calificacionRescate);
    if (isNaN(calif) || calif < 0 || calif > 100) {
      setFormError("La calificación debe estar entre 0 y 100.");
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;
    setFormLoading(true);
    try {
      const payload = {
        idUsuarioEstudiante: parseInt(form.idUsuarioEstudiante),
        idMateria: parseInt(form.idMateria),
        idPeriodoAcademico: parseInt(form.idPeriodoAcademico),
        calificacionRescate: parseFloat(form.calificacionRescate),
        observaciones: form.observaciones,
        idEstado: parseInt(form.idEstado),
      };
      let res;
      if (modoEdicion) {
        res = await rescateEvaluacionService.actualizarEvaluacion({
          idRescate: form.idRescate,
          ...payload,
        });
      } else {
        res = await rescateEvaluacionService.insertarEvaluacion(payload);
      }

      if (res?.numero === -1) {
        setFormError(res.mensaje);
        Swal.fire("Error", res.mensaje, "error");
      } else {
        Swal.fire("Éxito", res?.mensaje || "Guardado exitosamente", "success");
        cargarDatos();
        cerrarModal();
      }
    } catch (err) {
      cerrarModal();
      const mensajeError =
        err.response?.data?.mensaje || err.message || "Error al guardar";
      Swal.fire("Error", mensajeError, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const seleccionarEstudiante = (id, nombre) => {
    setForm({ ...form, idUsuarioEstudiante: id });
    setUsuarioInput(nombre);
  };

  const seleccionarMateria = (id, nombre) => {
    setForm({ ...form, idMateria: id });
    setMateriaInput(nombre);
    setMostrarMaterias(false);
  };

  return (
    <div className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${fondo} ${texto}`}>
      <div
        className={`w-full px-4 rounded-2xl shadow-md p-6 ${
          modoOscuro
            ? "bg-gray-900 text-white shadow-gray-700"
            : "bg-white text-gray-900 shadow-gray-300"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">
          Solicitudes de Rescate de Evaluación
        </h2>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <BuscadorBase
            placeholder="Buscar por estudiante, materia o periodo..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <ContadoresBase
          completados={completados}
          enProceso={enProceso}
          total={total}
          modoOscuro={modoOscuro}
          onNuevo={abrirModalNuevo}
        />

        <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
          <label htmlFor="filasPorPagina" className="font-semibold">
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            value={filasPorPagina}
            onChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
            className={`w-[5rem] px-3 py-1 rounded border ${
              modoOscuro
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          >
            {[10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <TablaBase
          datos={rescatesPaginados}
          columnas={columnas}
          modoOscuro={modoOscuro}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
          onEditar={abrirModalEditar}
        />

        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Anterior
          </button>
          <span className="font-semibold">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() =>
              setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))
            }
            className={`rounded px-4 py-2 text-white ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Siguiente
          </button>
        </div>

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo={modoEdicion ? "Editar Rescate" : "Nuevo Rescate"}
          >
            <div className="flex flex-col gap-4 relative">
              {/* Estudiante con autocompletado */}
              <label className="relative" ref={estudianteRef}>
                Estudiante:
                <input
                  type="text"
                  value={usuarioInput}
                  onChange={(e) => {
                    setUsuarioInput(e.target.value);
                    setForm({ ...form, idUsuarioEstudiante: "" });
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
              {/* Materia con autocompletado */}
              <label htmlFor="idMateria" className="text-sm">
                Materia
              </label>
              <div className="relative" ref={materiaRef}>
                <input
                  type="text"
                  id="idMateria"
                  value={materiaInput}
                  onChange={(e) => {
                    setMateriaInput(e.target.value);
                    setMostrarMaterias(true);
                    setForm({ ...form, idMateria: "" });
                  }}
                  placeholder="Escriba para buscar materia"
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  autoComplete="off"
                  required
                />
                {mostrarMaterias && materiaInput.length > 0 && materiasFiltradas.length > 0 && (
                  <ul
                    className={`absolute z-50 max-h-40 w-full overflow-auto rounded border ${
                      modoOscuro
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {materiasFiltradas.map((m) => (
                      <li
                        key={m.idMateria}
                        onClick={() => seleccionarMateria(m.idMateria, m.nombreMateria)}
                        className="cursor-pointer px-3 py-1 hover:bg-blue-600 hover:text-white"
                      >
                        {m.nombreMateria}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Periodo */}
              <label>
                Periodo Académico:
                <select
                  name="idPeriodoAcademico"
                  value={form.idPeriodoAcademico}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value="">Seleccione periodo</option>
                  {periodos.map((p) => (
                    <option key={p.idPeriodoAcademico} value={p.idPeriodoAcademico}>
                      {p.nombrePeriodo}
                    </option>
                  ))}
                </select>
              </label>

              {/* Calificación */}
              <label>
                Calificación Rescate:
                <input
                  type="number"
                  name="calificacionRescate"
                  value={form.calificacionRescate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                />
              </label>

              {/* Observaciones */}
              <label>
                Observaciones:
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                />
              </label>

              {/* Estado (solo 8 y 9) */}
              <label>
                Estado:
                <select
                  name="idEstado"
                  value={form.idEstado}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded border ${
                    modoOscuro
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  <option value="">Seleccione estado</option>
                  {estados.map((e) => (
                    <option key={e.iD_Estado} value={e.iD_Estado}>
                      {e.nombre_Estado}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </FormularioBase>
        </ModalBase>
      </div>
    </div>
  );
};

export default FrmRescateEvaluacion;
