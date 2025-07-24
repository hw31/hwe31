import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import calificacionService from "../../services/Calificaciones";
import usuarioRolService from "../../services/UsuariosRoles"; // para listarUsuariosRoles
import usuarioService from "../../services/Usuario"; // para nombres de usuarios
import inscripcionService from "../../services/Inscripcion";
import materiaService from "../../services/Materias";
import tipoCalificacionService from "../../services/TipoCalificacion";
import estadoService from "../../services/Estado";

import {
  FaPlus,
  FaEdit,
  FaUserCheck,
  FaUserTimes,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const FrmCalificaciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  // Estados
  const [busqueda, setBusqueda] = useState("");
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Datos para selects
  const [listas, setListas] = useState({
    docentes: [],
    usuarios: [], // para mapear nombres completos de estudiantes y docentes
    inscripciones: [],
    materias: [],
    tiposCalificacion: [],
    estados: [],
  });

  // Formulario controlado
  const [formData, setFormData] = useState({
    idDocente: "",
    idInscripcion: "",
    idMateria: "",
    idTipoCalificacion: "",
    valor: "",
    idEstado: "",
  });

  // Cargar datos iniciales
  const cargarListas = async () => {
    try {
      const [
        usuariosRoles,
        usuariosRaw,
        inscripcionesRaw,
        materiasRaw,
        tiposCalificacionRaw,
        estadosResult,
      ] = await Promise.all([
        usuarioRolService.listarUsuariosRoles(),
        usuarioService.listarUsuario(),
        inscripcionService.listarInscripciones(),
        materiaService.listarMaterias(),
        tipoCalificacionService.listarTiposCalificacion(),
        estadoService.listarEstados(),
      ]);

      // Normalizar usuarios: aseguramos array
      const usuarios = Array.isArray(usuariosRaw) ? usuariosRaw : usuariosRaw.resultado ?? [];

      // Normalizar inscripciones:
      const inscripciones = Array.isArray(inscripcionesRaw) ? inscripcionesRaw : inscripcionesRaw.resultado ?? [];

      // Filtrar solo docentes (idRol === 2)
      const docentesRaw = Array.isArray(usuariosRoles) ? usuariosRoles.filter(
        (u) => Number(u.idRol) === 2
      ) : [];

      // Mapear docentes con nombre completo usando usuarios
      const docentes = docentesRaw.map((doc) => {
        // En usuarios la propiedad que relaciona es id_Usuario con idUsuario de usuarioRoles
        const usuario = usuarios.find((u) => u.id_Usuario == doc.idUsuario);
        return {
          idUsuario: doc.idUsuario,
          nombre: usuario?.persona?.trim() || `Docente ${doc.idUsuario}`,
        };
      });

      // Normalizar materias:
      const materias = Array.isArray(materiasRaw) ? materiasRaw : materiasRaw.resultado ?? [];

      // Normalizar tiposCalificacion:
      const tiposCalificacion = Array.isArray(tiposCalificacionRaw)
        ? tiposCalificacionRaw
        : tiposCalificacionRaw.resultado ?? [];

      // Normalizar estados:
      const estadosRaw = estadosResult?.data ?? [];
      const estados = estadosRaw.map((e) => ({
        idEstado: e.iD_Estado ?? e.idEstado,
        nombreEstado: e.nombre_Estado ?? e.nombreEstado,
      }));

      setListas({
        docentes,
        usuarios,
        inscripciones,
        materias,
        tiposCalificacion,
        estados,
      });
    } catch (err) {
      console.error("Error al cargar listas:", err);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    }
  };

  // Cargar calificaciones
  const cargarCalificaciones = async () => {
    try {
      setLoading(true);
      const respuesta = await calificacionService.listarCalificacion();
      console.log("Calificaciones recibidas:", respuesta);

      if (respuesta && Array.isArray(respuesta.data)) {
        setCalificaciones(respuesta.data);
        setError("");
      } else {
        setCalificaciones([]);
        setError("No se recibieron calificaciones válidas");
      }
    } catch (err) {
      setCalificaciones([]);
      setError(err.message || "Error al cargar calificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListas();
    cargarCalificaciones();
  }, []);

  // Manejo búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // En el filtro de búsqueda:
  const calificacionesFiltradas = calificaciones.filter((cal) => {
    const texto = busqueda.toLowerCase();

    // Docente: busca en listas.docentes (suponiendo que ahí está)
    const docenteNombre = listas.docentes.find((d) => d.idUsuario === cal.idUsuarioDocente)?.nombre.toLowerCase() ?? "";

    // Usar nombreEstudiante directo del cal (ya viene completo)
    const estudianteNombre = cal.nombreEstudiante?.toLowerCase() ?? "";

    const materiaNombre = listas.materias.find((m) => m.idMateria === cal.idMateria)?.nombreMateria.toLowerCase() ?? "";
    const tipoCalifNombre = listas.tiposCalificacion.find((t) => t.idTipoCalificacion === cal.idTipoCalificacion)?.tipoCalificacionNombre.toLowerCase() ?? "";
    const estadoNombre = cal.estado?.toLowerCase() ?? ""; // viene directo en el objeto

    return (
      docenteNombre.includes(texto) ||
      estudianteNombre.includes(texto) ||
      materiaNombre.includes(texto) ||
      tipoCalifNombre.includes(texto) ||
      estadoNombre.includes(texto)
    );
  });

  // Contadores
  const total = calificaciones.length;
  const activos = calificaciones.filter((c) => {
    const estadoObj = listas.estados.find((e) => e.idEstado === c.idEstado);
    return estadoObj?.nombreEstado?.toLowerCase() === "activo";
  }).length;
  const inactivos = total - activos;

  // Clases para modo oscuro
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  // Manejo modal
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setCalificacionSeleccionada(null);
    setFormData({
      idDocente: "",
      idInscripcion: "",
      idMateria: "",
      idTipoCalificacion: "",
      valor: "",
      idEstado: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (calificacion) => {
    setModoEdicion(true);
    setCalificacionSeleccionada(calificacion);
    setFormData({
      idDocente: calificacion.idUsuarioDocente || "",
      idInscripcion: calificacion.idInscripcion || "",
      idMateria: calificacion.idMateria || "",
      idTipoCalificacion: calificacion.idTipoCalificacion || "",
      valor: calificacion.calificacion?.toString() || "",
      idEstado: calificacion.idEstado || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
    setModoEdicion(false);
    setCalificacionSeleccionada(null);
    setFormData({
      idDocente: "",
      idInscripcion: "",
      idMateria: "",
      idTipoCalificacion: "",
      valor: "",
      idEstado: "",
    });
  };

  // Manejar cambios formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar formulario
  const validarFormulario = () => {
    const { idDocente, idInscripcion, idMateria, idTipoCalificacion, valor, idEstado } = formData;
    if (
      !idDocente ||
      !idInscripcion ||
      !idMateria ||
      !idTipoCalificacion ||
      valor === "" ||
      !idEstado
    ) {
      setFormError("Por favor, complete todos los campos.");
      return false;
    }
    if (isNaN(parseFloat(valor))) {
      setFormError("El valor debe ser un número válido.");
      return false;
    }
    setFormError("");
    return true;
  };

  // Guardar calificación (insertar o actualizar)
  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setFormLoading(true);

    const datosEnviar = {
      idDocente: Number(formData.idDocente),
      idInscripcion: Number(formData.idInscripcion),
      idMateria: Number(formData.idMateria),
      idTipoCalificacion: Number(formData.idTipoCalificacion),
      valor: parseFloat(formData.valor),
      idEstado: Number(formData.idEstado),
    };

    try {
      let respuesta;
      if (modoEdicion && calificacionSeleccionada) {
        respuesta = await calificacionService.actualizarCalificaciones({
          ...datosEnviar,
          idCalificacion: calificacionSeleccionada.idCalificacion,
        });
      } else {
        respuesta = await calificacionService.insertarCalificaciones(datosEnviar);
      }

      // Validación respuesta
      if (respuesta?.error || respuesta?.success === false) {
        throw new Error(respuesta.message || "Error desconocido al guardar.");
      }

      cerrarModal();
      await cargarCalificaciones();

      await Swal.fire({
        icon: "success",
        title: modoEdicion ? "Actualizado" : "Guardado",
        text: modoEdicion
          ? "La calificación se actualizó correctamente."
          : "La calificación se guardó correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al guardar:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al guardar la calificación",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div
      className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}
      style={{ paddingTop: 1 }}
    >
      <div className={`shadow-md rounded-xl p-6 ${fondo}`}>
        <div style={{ maxWidth: 600, margin: "20px auto 30px", width: "90%" }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={handleBusquedaChange}
            style={{
              width: "50%",
              padding: "8px 16px",
              fontSize: 16,
              borderRadius: "9999px",
              border: `1.2px solid ${modoOscuro ? "#444" : "#ccc"}`,
              outline: "none",
              boxShadow: modoOscuro
                ? "inset 0 1px 4px rgba(234, 227, 227, 0.1)"
                : "inset 0 1px 4px rgba(0,0,0,0.1)",
              color: modoOscuro ? "white" : "black",
              transition: "border-color 0.3s ease",
              display: "block",
              margin: "0 auto",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = modoOscuro ? "#90caf9" : "#1976d2")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = modoOscuro ? "#444" : "#ccc")
            }
          />
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          {/* Contadores */}
          <div className="flex flex-wrap justify-center gap-6 flex-grow min-w-[250px]">
            {/* Activos */}
            <div
              style={{
                background: "linear-gradient(135deg, #127f45ff, #0c0b0bff)",
                color: "white",
                padding: "14px 24px",
                borderRadius: 10,
                fontWeight: "700",
                fontSize: 18,
                minWidth: 140,
                textAlign: "center",
                boxShadow: "0 3px 8px rgba(2, 79, 33, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                userSelect: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              aria-label={`Calificaciones activas: ${activos}`}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #0c0b0bff,  #084b27 )")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #127f45ff, #0c0b0bff)")
              }
            >
              <FaUserCheck /> Activos
              <div style={{ fontSize: 26, marginLeft: 8 }}>{activos}</div>
            </div>

            {/* Inactivos */}
            <div
              style={{
                background: "linear-gradient(135deg, #ef5350, #0c0b0bff)",
                color: "white",
                padding: "14px 24px",
                borderRadius: 10,
                fontWeight: "700",
                fontSize: 18,
                minWidth: 140,
                textAlign: "center",
                boxShadow: "0 3px 8px rgba(244,67,54,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                userSelect: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              aria-label={`Calificaciones inactivas: ${inactivos}`}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #101010ff, #de1717ff)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(135deg, #ef5350, #0c0b0ff)")
              }
            >
              <FaUserTimes /> Inactivos
              <div style={{ fontSize: 26, marginLeft: 8 }}>{inactivos}</div>
            </div>

            {/* Total */}
            <div
              style={{
                background: "linear-gradient(135deg, #0960a8ff, #20262dff)",
                color: "white",
                padding: "14px 24px",
                borderRadius: 10,
                fontWeight: "700",
                fontSize: 18,
                minWidth: 140,
                textAlign: "center",
                boxShadow: "0 3px 8px rgba(25,118,210,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                userSelect: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              aria-label={`Total de calificaciones: ${total}`}
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
              <div style={{ fontSize: 26, marginLeft: 8 }}>{total}</div>
            </div>
          </div>

          {/* Botón Nuevo */}
          <button
            onClick={abrirModalNuevo}
            style={{
              backgroundColor: "#1976d2",
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#115293")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
            type="button"
            aria-label="Agregar nueva calificación"
          >
            <FaPlus /> Nuevo
          </button>
        </div>

        {/* Mensajes */}
        {loading && <p className="text-gray-400 italic">Cargando calificaciones...</p>}
        {error && <p className="text-red-500 font-medium">Error: {error}</p>}
        {!loading && calificaciones.length === 0 && (
          <p className="text-gray-400">No hay calificaciones para mostrar.</p>
        )}

       
{!loading && calificacionesFiltradas.length > 0 && (
  <div className="scroll-modern overflow-x-auto">
    <table className="min-w-full text-sm text-left">
      <thead className={encabezado}>
        <tr>
          <th className="px-4 py-2 font-semibold">Docente</th>
          <th className="px-4 py-2 font-semibold">Estudiante</th>
          <th className="px-4 py-2 font-semibold">Materia</th>
          <th className="px-4 py-2 font-semibold">Tipo Calificación</th>
          <th className="px-4 py-2 font-semibold">Valor</th>
          <th className="px-4 py-2 font-semibold text-center">Estado</th>
          <th className="px-4 py-2 font-semibold">Fecha de Registro</th>
          <th className="px-4 py-2 font-semibold">Creador</th>
          <th className="px-4 py-2 font-semibold">Fecha de Creación</th>
          <th className="px-4 py-2 font-semibold">Modificador</th>
          <th className="px-4 py-2 font-semibold">Fecha de Modificación</th>
          <th className="px-4 py-2 font-semibold text-center">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {calificaciones.map((cal) => {
          const docente = listas.usuarios.find((u) => u.id_Usuario === cal.idUsuarioDocente);
          const nombreDocente = docente?.persona ?? "N/D";

          const inscripcion = listas.inscripciones?.find((i) => i.iD_Inscripcion === cal.idInscripcion);
          const estudiante = listas.usuarios.find((u) => u.id_Usuario === inscripcion?.idEstudiante);
          const estudianteNombre = cal.nombreEstudiante?.trim() || estudiante?.persona || "N/D";

          const materiaNombre = listas.materias?.find((m) => m.idMateria === cal.idMateria)?.nombreMateria || "N/D";
          const tipoCalifNombre = listas.tiposCalificacion?.find((t) => t.idTipoCalificacion === cal.idTipoCalificacion)?.tipoCalificacionNombre || "N/D";
          const estado = listas.estados?.find((e) => e.idEstado === cal.idEstado);

          const formatoFecha = (f) => f ? new Date(f).toLocaleString("es-NI") : "N/D";

          return (
            <tr key={cal.idCalificacion} className={`transition-colors ${modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}>
              <td className={`px-4 py-2 ${texto}`}>{nombreDocente}</td>
              <td className={`px-4 py-2 ${texto}`}>{estudianteNombre}</td>
              <td className={`px-4 py-2 ${texto}`}>{materiaNombre}</td>
              <td className={`px-4 py-2 ${texto}`}>{tipoCalifNombre}</td>
              <td className={`px-4 py-2 ${texto}`}>{cal.calificacion}</td>
              <td className="px-4 py-2 text-center">
                {estado?.nombreEstado?.toLowerCase() === "activo" ? (
                  <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                )}
              </td>
              <td className={`px-4 py-2 ${texto}`}>{formatoFecha(cal.fechaRegistro)}</td>
              <td className={`px-4 py-2 ${texto}`}>{cal.creador?.trim() || "N/D"}</td>
              <td className={`px-4 py-2 ${texto}`}>{formatoFecha(cal.fechaCreacion)}</td>
              <td className={`px-4 py-2 ${texto}`}>{cal.modificador?.trim() || "N/D"}</td>
              <td className={`px-4 py-2 ${texto}`}>{formatoFecha(cal.fechaModificacion)}</td>
              <td className="px-4 py-2 text-center">
                <button
                  className="text-blue-600 hover:text-blue-800 text-xl"
                  onClick={() => abrirModalEditar(cal)}
                  aria-label="Editar calificación"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

{/* Modal */}
{modalOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 20,
    }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tituloModal"
    onClick={cerrarModal}
  >
    <div
      style={{
        backgroundColor: modoOscuro ? "#222" : "#fff",
        borderRadius: 15,
        maxWidth: 500,
        width: "100%",
        padding: 25,
        boxShadow: modoOscuro
          ? "0 8px 20px rgba(255,255,255,0.2)"
          : "0 8px 20px rgba(0,0,0,0.2)",
        color: modoOscuro ? "#eee" : "#222",
        animation: "fadeInScale 0.3s ease forwards",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 id="tituloModal" style={{ marginBottom: 20, color: "#1976d2" }}>
        {modoEdicion ? "Editar Calificación" : "Nueva Calificación"}
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardar();
        }}
      >
        {/* Docente */}
        <label className="block mb-2 font-semibold">
          Docente:
          <select
            name="idDocente"
            value={formData.idDocente}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
          >
            <option value="">Seleccione un docente</option>
            {listas.docentes.map((d, idx) => (
              <option key={d.idUsuario ?? idx} value={d.idUsuario ?? ""}>
                {d.nombre ?? "Sin nombre"}
              </option>
            ))}
          </select>
        </label>

        {/* Inscripción */}
        <label className="block mb-2 font-semibold">
          Estudiante (Inscripción):
          <select
            name="idInscripcion"
            value={formData.idInscripcion}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
          >
            <option value="">Seleccione una inscripción</option>
            {Array.isArray(listas.inscripciones) &&
              listas.inscripciones.map((i, idx) => {
                const estudiante = listas.usuarios.find((u) => u.id_Usuario === i.idEstudiante);
                const nombreEst = estudiante?.persona ?? `Estudiante ${i.idEstudiante}`;

                return (
                  <option key={i.iD_Inscripcion ?? idx} value={i.iD_Inscripcion ?? ""}>
                    {nombreEst}
                  </option>
                );
              })}
          </select>
        </label>

        {/* Materia */}
        <label className="block mb-2 font-semibold">
          Materia:
          <select
            name="idMateria"
            value={formData.idMateria}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
          >
            <option value="">Seleccione una materia</option>
            {listas.materias.map((m, idx) => (
              <option key={m.idMateria ?? idx} value={m.idMateria ?? ""}>
                {m.nombreMateria ?? "Sin nombre"}
              </option>
            ))}
          </select>
        </label>

        {/* Tipo Calificación */}
        <label className="block mb-2 font-semibold">
          Tipo Calificación:
          <select
            name="idTipoCalificacion"
            value={formData.idTipoCalificacion}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
          >
            <option value="">Seleccione un tipo de calificación</option>
            {listas.tiposCalificacion.map((t, idx) => (
              <option key={t.idTipoCalificacion ?? idx} value={t.idTipoCalificacion ?? ""}>
                {t.tipoCalificacionNombre ?? "Sin nombre"}
              </option>
            ))}
          </select>
        </label>

        {/* Valor */}
        <label className="block mb-2 font-semibold">
          Valor:
          <input
            type="number"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
            step="any"
          />
        </label>

        {/* Estado */}
        <label className="block mb-2 font-semibold">
          Estado:
          <select
            name="idEstado"
            value={formData.idEstado}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 rounded border"
            required
          >
            <option value="">Seleccione un estado</option>
            {listas.estados
              .filter((e) => e.idEstado === 1 || e.idEstado === 2)
              .map((e, idx) => (
                <option key={e.idEstado ?? idx} value={e.idEstado ?? ""}>
                  {e.nombreEstado ?? "Sin nombre"}
                </option>
              ))}
          </select>
        </label>

        {formError && (
          <p className="text-red-500 mb-3 font-semibold">{formError}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={cerrarModal}
            className={`mr-4 px-4 py-2 rounded border ${
              modoOscuro ? "border-gray-600 text-gray-300" : "border-gray-400 text-gray-700"
            }`}
            disabled={formLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${
              formLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={formLoading}
          >
            {formLoading ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default FrmCalificaciones;
