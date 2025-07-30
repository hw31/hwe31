import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import rescateEvaluacionService from "../../services/RescateEvaluacion";
import estadoService from "../../services/Estado";
import usuarioService from "../../services/Usuario";
import materiaService from "../../services/Materias";
import periodoService from "../../services/PeriodoAcademico";

import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import BuscadorBase from "../Shared/BuscadorBase";

import { FaCheckCircle, FaTimesCircle, FaClock, FaPlus, FaEdit, FaUser } from "react-icons/fa";

const FrmRescateEvaluacion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idRescate: 0,
    observaciones: "",
    idEstado: 8, // default primer estado válido
    idUsuario: 0,
    idMateria: 0,
    idPeriodo: 0,
    calificacionRescate: 0,
  });

  const [estados, setEstados] = useState([]); // Solo estados 8 y 9 para select
  const [estadosCompleto, setEstadosCompleto] = useState([]); // Todos los estados para mostrar en tabla
  const [usuarios, setUsuarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Cargar datos al inicio
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        resDatos,
        resEstados,
        resUsuarios,
        resMaterias,
        resPeriodos,
      ] = await Promise.all([
        rescateEvaluacionService.listarEvaluacionesRescatables(),
        estadoService.listarEstados(),
        usuarioService.listarUsuario(),
        materiaService.listarMaterias(),
        periodoService.listarPeriodosAcademicos(),
      ]);

      // Normalizar estados
      const estadosRaw = resEstados?.datos || resEstados?.data || resEstados?.resultado || [];
      const estadosCompletoRaw = estadosRaw.map((e) => ({
        id: e.iD_Estado || e.idEstado || e.id || 0,
        nombre: e.nombre_Estado || e.nombre || "",
      }));
      setEstadosCompleto(estadosCompletoRaw);

      // Solo 8 y 9 para selects
      const estadosNormalizados = estadosCompletoRaw.filter((e) => [8, 9].includes(e.id));
      setEstados(estadosNormalizados);

      // Usuarios normalizados
      const usuariosRaw = resUsuarios?.datos || resUsuarios?.data || resUsuarios?.resultado || [];
      const usuariosNormalizados = usuariosRaw.map((u) => ({
        id: u.id_Usuario || u.idUsuario || u.id || 0,
        nombre: u.persona || u.usuario || u.nombre || "",
      }));
      setUsuarios(usuariosNormalizados);

      // Materias normalizadas
      const materiasRaw = resMaterias || [];
      const materiasNormalizadas = materiasRaw.map((m) => ({
        id: m.idMateria || m.id_Materia || m.id || 0,
        nombre: m.nombreMateria || m.nombre_Materia || m.nombre || "",
      }));
      setMaterias(materiasNormalizadas);

      // Periodos normalizados
      const periodosRaw = resPeriodos?.resultado || resPeriodos?.datos || resPeriodos?.data || [];
      const periodosNormalizados = periodosRaw.map((p) => ({
        id: p.idPeriodoAcademico || p.idPeriodo || p.id || 0,
        nombre: p.nombrePeriodo || p.nombre || "",
      }));
      setPeriodos(periodosNormalizados);

      // Datos principales normalizados
      const datosRaw = resDatos?.resultado || resDatos?.datos || resDatos?.data || [];
      const datosNormalizados = datosRaw.map((item) => ({
        idRescate: item.idRescate,
        idUsuario: item.idUsuario,
        idMateria: item.idMateria,
        idPeriodo: item.idPeriodo,
        fechaSolicitud: item.fechaSolicitud,
        calificacionRescate: item.calificacionRescate,
        observaciones: item.observaciones,
        fechaCreacion: item.fechaCreacion,
        fechaModificacion: item.fechaModificacion,
        idCreador: item.idCreador,
        idModificador: item.idModificador,
        idEstado: item.idEstado,
      }));
      setDatos(datosNormalizados);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      console.error(error);
    }
    setLoading(false);
  };

  // Abrir modal para nuevo
  const abrirModalNuevo = () => {
    if (usuarios.length === 0 || materias.length === 0 || periodos.length === 0) {
      Swal.fire("Atención", "No hay usuarios, materias o periodos para seleccionar.", "warning");
      return;
    }
    setForm({
      idRescate: 0,
      observaciones: "",
      idEstado: 8, // Estado por defecto válido
      idUsuario: usuarios[0].id,
      idMateria: materias[0].id,
      idPeriodo: periodos[0].id,
      calificacionRescate: 0,
    });
    setModoEdicion(false);
    setFormError("");
    setModalOpen(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (item) => {
    setForm({
      idRescate: item.idRescate,
      observaciones: item.observaciones,
      idEstado: item.idEstado,
      idUsuario: item.idUsuario,
      idMateria: item.idMateria,
      idPeriodo: item.idPeriodo,
      calificacionRescate: item.calificacionRescate,
    });
    setModoEdicion(true);
    setFormError("");
    setModalOpen(true);
  };

  // Guardar (insertar o actualizar)
  const guardar = async () => {
    if (!form.observaciones.trim()) {
      setFormError("Las observaciones son obligatorias");
      return;
    }
    if (!form.idUsuario || !form.idMateria || !form.idPeriodo) {
      setFormError("Debe seleccionar usuario, materia y periodo");
      return;
    }
    if (![8, 9].includes(form.idEstado)) {
      setFormError("Estado inválido, debe ser uno de los permitidos (8 o 9)");
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        idRescate: form.idRescate,
        observaciones: form.observaciones,
        idEstado: form.idEstado,
        idUsuario: form.idUsuario,
        idMateria: form.idMateria,
        idPeriodo: form.idPeriodo,
        calificacionRescate: form.calificacionRescate,
      };

      const res = modoEdicion
        ? await rescateEvaluacionService.actualizarEvaluacion(payload)
        : await rescateEvaluacionService.insertarEvaluacion(payload);

      if (res?.data?.ok || res?.ok || res?.exito) {
        Swal.fire("Éxito", res?.data?.msg || res?.msg || "Guardado correctamente", "success");
        setModalOpen(false);
        cargarDatos();
      } else {
        throw new Error(res?.data?.msg || res?.msg || "Ocurrió un error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo guardar", "error");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para obtener nombre por id en listas
  const getNombrePorId = (lista, id) => {
    return lista.find((e) => e.id === id)?.nombre || "Desconocido";
  };

  // Para mostrar nombre de usuario creador/modificador usando usuarios cargados
  const getUsuarioNombrePorId = (id) => {
    return usuarios.find((u) => u.id === id)?.nombre || id || "Desconocido";
  };

  // Filtrar datos para mostrar solo estados 8 y 9 y aplicar búsqueda
  const filtrados = datos
    .filter((item) => [8, 9].includes(item.idEstado))
    .filter((item) => {
      if (!busqueda.trim()) return true;
      const texto = busqueda.toLowerCase();
      const usuario = getNombrePorId(usuarios, item.idUsuario).toLowerCase();
      const materia = getNombrePorId(materias, item.idMateria).toLowerCase();
      const periodo = getNombrePorId(periodos, item.idPeriodo).toLowerCase();
      const estado = getNombrePorId(estadosCompleto, item.idEstado).toLowerCase();
      const observaciones = (item.observaciones || "").toLowerCase();
      return (
        usuario.includes(texto) ||
        materia.includes(texto) ||
        periodo.includes(texto) ||
        estado.includes(texto) ||
        observaciones.includes(texto)
      );
    });

  // Contar "En Proceso" (idEstado=9) e "Completado" (idEstado=8)
  const enProceso = filtrados.filter((d) => d.idEstado === 9).length;
  const completados = filtrados.filter((d) => d.idEstado === 8).length;

  // --- Estilos en línea para contadores ---
  const contenedorEstilo = {
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  };

  // Colores para botón "Nuevo"
  const colorNuevo = "#1976d2";
  const colorNuevoHover = "#115293";

  return (
    <div className={`p-4 rounded-xl shadow-md ${fondo}`}>
      <h2 className={`text-2xl font-bold mb-4 ${texto}`}>Rescate y Evaluación</h2>

      <BuscadorBase
        valor={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar..."
        modoOscuro={modoOscuro}
        texto={texto}
      />

      {/* CONTADORES */}
      <div className="flex flex-wrap justify-between items-center gap-6 mb-6">
        <div className="flex flex-wrap justify-center gap-6 flex-grow min-w-[250px]">
          {/* En Proceso */}
          <div
            style={{
              ...contenedorEstilo,
              background: "linear-gradient(135deg, #f0ad4e, #d48806)", // amarillo
              color: "white",
              boxShadow: "0 3px 8px rgba(212, 143, 0, 0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #d48806, #a35f00)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #f0ad4e, #d48806)")
            }
          >
            <FaClock /> En Proceso
            <div style={{ fontSize: 26, marginLeft: 8 }}>{enProceso}</div>
          </div>

          {/* Completado */}
          <div
            style={{
              ...contenedorEstilo,
              background: "linear-gradient(135deg, #4caf50, #087f23)", // verde
              color: "white",
              boxShadow: "0 3px 8px rgba(46, 125, 50, 0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #087f23, #045a12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #4caf50, #087f23)")
            }
          >
            <FaCheckCircle /> Completado
            <div style={{ fontSize: 26, marginLeft: 8 }}>{completados}</div>
          </div>

          {/* Total */}
          <div
            style={{
              ...contenedorEstilo,
              background: "linear-gradient(135deg, #0960a8ff, #20262dff)",
              color: "white",
              boxShadow: "0 3px 8px rgba(25,118,210,0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #20262dff, #0d47a1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #0960a8ff, #20262dff)")
            }
          >
            <FaUser /> Total
            <div style={{ fontSize: 26, marginLeft: 8 }}>{filtrados.length}</div>
          </div>
        </div>

        {/* Botón "Nuevo" */}
        <button
          onClick={abrirModalNuevo}
          style={{
            backgroundColor: colorNuevo,
            border: "none",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            userSelect: "none",
            transition: "background-color 0.3s ease",
            whiteSpace: "nowrap",
            marginTop: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorNuevoHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorNuevo)}
          type="button"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      {/* TABLA */}
      {loading ? (
        <p className="text-gray-400 italic p-4">Cargando datos...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-400 p-4">No hay datos para mostrar.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg shadow-md">
          <table className="table-auto min-w-full border-collapse">
            <thead className={encabezado}>
              <tr>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">ID</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Persona</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Materia</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Periodo</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Observaciones</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Calificación Rescate</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Fecha Solicitud</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Creador</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Fecha Creación</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Fecha Modificación</th>
                <th className="py-2 text-sm font-semibold whitespace-nowrap select-none text-left px-4">Modificador</th>
                <th className="py-2 px-4 text-sm font-semibold whitespace-nowrap select-none text-left">Estado</th>
                <th className="py-2 w-24 text-center whitespace-nowrap select-none">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
              {filtrados.map((item) => (
                <tr
                  key={item.idRescate}
                  className={`transition-colors ${
                    modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  }`}
                >
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{item.idRescate}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{getNombrePorId(usuarios, item.idUsuario)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{getNombrePorId(materias, item.idMateria)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{getNombrePorId(periodos, item.idPeriodo)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{item.observaciones}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{item.calificacionRescate}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{formatearFecha(item.fechaSolicitud)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{getUsuarioNombrePorId(item.idCreador)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{formatearFecha(item.fechaCreacion)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{formatearFecha(item.fechaModificacion)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>{getUsuarioNombrePorId(item.idModificador)}</td>
                  <td className={`py-2 px-4 text-sm whitespace-nowrap align-middle ${texto}`}>
                    {item.idEstado === 8 ? (
                    <FaCheckCircle className="text-green-600" />
                   ) : item.idEstado === 9 ? (
                    <FaClock className="text-yellow-600" />
                    ) : null}
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => abrirModalEditar(item)}
                      title="Editar"
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      type="button"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para formulario */}
      <ModalBase
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modoEdicion ? "Editar Rescate Evaluación" : "Nuevo Rescate Evaluación"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          loading={formLoading}
          error={formError}
          onSubmit={guardar}     
          modoOscuro={modoOscuro}
          onCancel={() => setModalOpen(false)}
          modoEdicion={modoEdicion}
          titulo="Solicitud de Rescate"
        >
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Observaciones</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Estado</label>
            <select
              className="w-full p-2 border rounded"
              value={form.idEstado}
              onChange={(e) => setForm({ ...form, idEstado: parseInt(e.target.value) })}
              required
            >
              {estados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Usuario</label>
            <select
              className="w-full p-2 border rounded"
              value={form.idUsuario}
              onChange={(e) => setForm({ ...form, idUsuario: parseInt(e.target.value) })}
              required
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Materia</label>
            <select
              className="w-full p-2 border rounded"
              value={form.idMateria}
              onChange={(e) => setForm({ ...form, idMateria: parseInt(e.target.value) })}
              required
            >
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Periodo</label>
            <select
              className="w-full p-2 border rounded"
              value={form.idPeriodo}
              onChange={(e) => setForm({ ...form, idPeriodo: parseInt(e.target.value) })}
              required
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Calificación Rescate</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={form.calificacionRescate}
              onChange={(e) =>
                setForm({ ...form, calificacionRescate: parseFloat(e.target.value) || 0 })
              }
              min={0}
              max={100}
            />
          </div>

          <div className="flex justify-end gap-3">
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default FrmRescateEvaluacion;
