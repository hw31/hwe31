import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import inscripcionesmateriaService from "../../services/InscripcionesMaterias";
import inscripcionService from "../../services/Inscripcion";
import materiaService from "../../services/Materias";
import estadoService from "../../services/Estado";
import usuarioService from "../../services/Usuario";
 
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaUserCheck, FaUserTimes, FaUser,FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const FrmInscripcionesMaterias = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [inscripcionesMaterias, setInscripcionesMaterias] = useState([]);
  const [listas, setListas] = useState({
    materias: [],
    estados: [],
    usuarios: [],
    inscripciones: [],
  });

  const [loadingListas, setLoadingListas] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    idInscripcion: "",
    idMateria: "",
    idEstado: "",
  });
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar listas maestras (materias, estados, usuarios)
  const cargarListas = async () => {
    setLoadingListas(true);
    try {
      const [materiasResp, estadosResp, usuariosResp,] = await Promise.all([
        materiaService.listarMaterias(),
        estadoService.listarEstados(),
        usuarioService.listarUsuario(),
      ]);

      const materias = materiasResp?.resultado ?? materiasResp ?? [];

      const estados = estadosResp.success ? estadosResp.data : [];
      const usuarios = usuariosResp.success ? usuariosResp.data : [];

      setListas((prev) => ({
        ...prev,
        materias,
        estados,
        usuarios,
      }));
    } catch (err) {
      console.error("Error al cargar listas:", err);
      setError("Error al cargar listas.");
    } finally {
      setLoadingListas(false);
    }
  };

  // Cargar inscripciones materias (detalle materias)
  const cargarInscripcionesMaterias = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await inscripcionesmateriaService.listarInscripcionesMaterias();
      setInscripcionesMaterias(data);
    } catch (err) {
      console.error(err);
      setError("Error al listar inscripciones materias.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar inscripciones para obtener los nombres de estudiantes
const cargarInscripciones = async () => {
  try {
    const resultado = await inscripcionService.listarInscripciones();
    setListas((prev) => ({
      ...prev,
      inscripciones: resultado,
    }));
  } catch (err) {
    console.error(err);
    setError("Error al listar inscripciones.");
  }
};


  useEffect(() => {
    cargarListas();
    cargarInscripciones();
    cargarInscripcionesMaterias();
  }, []);

  // Funciones para obtener nombres según IDs
const buscarNombreEstudiante = (idInscripcion) =>
  listas.inscripciones.find((i) => Number(i.iD_Inscripcion) === Number(idInscripcion))
    ?.nombreEstudiante ?? "N/A";


  const buscarNombreMateria = (id) =>
    listas.materias.find((m) => Number(m.idMateria) === Number(id))?.nombreMateria ?? "";

  const buscarNombreEstado = (id) => {
    const e = listas.estados.find((e) => Number(e.iD_Estado ?? e.idEstado) === Number(id));
    return e?.nombre_Estado ?? e?.nombreEstado ?? "";
  };

  const buscarNombreUsuario = (id) => {
  const usuario = listas.usuarios.find((u) => Number(u.id_Usuario) === Number(id));
  return usuario?.usuario ?? `ID: ${id}`;/*friltrar usuario*/
};
  // Filtrado para búsqueda
  const inscripcionesFiltradas = inscripcionesMaterias.filter((i) => {
    const texto = busqueda.toLowerCase();
    return (
      buscarNombreMateria(i.idMateria).toLowerCase().includes(texto) ||
      buscarNombreEstado(i.idEstado).toLowerCase().includes(texto) ||
      buscarNombreEstudiante(i.idInscripcion).toLowerCase().includes(texto)
    );
  });

  // Contadores para estado
  const activos = inscripcionesMaterias.filter((i) => Number(i.idEstado) === 1).length;
  const inactivos = inscripcionesMaterias.filter((i) => Number(i.idEstado) !== 1).length;
  const total = inscripcionesMaterias.length;

  // Manejo inputs
  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormData({ idInscripcion: "", idMateria: "", idEstado: "" });
    setInscripcionSeleccionada(null);
    setFormError("");
    setModalOpen(true);
  };

  // Abrir modal editar
  const abrirModalEditar = (inscripcion) => {
    setModoEdicion(true);
    setFormData({
      idInscripcion: inscripcion.idInscripcion,
      idMateria: inscripcion.idMateria,
      idEstado: inscripcion.idEstado,
    });
    setInscripcionSeleccionada(inscripcion);
    setFormError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!formData.idInscripcion) {
      setFormError("Debe seleccionar una inscripción válida.");
      return false;
    }
    if (!formData.idMateria) {
      setFormError("Debe seleccionar una materia.");
      return false;
    }
    if (!formData.idEstado) {
      setFormError("Debe seleccionar un estado.");
      return false;
    }
    setFormError("");
    return true;
  };

const handleGuardar = async () => {
  if (!validarFormulario()) return;

  try {
    setFormLoading(true);
    let res;

    if (modoEdicion && inscripcionSeleccionada) {
      res = await inscripcionesmateriaService.actualizarInscripcionMateria({
        idInscripcionMateria: inscripcionSeleccionada.idInscripcionMateria,
        ...formData,
      });
    } else {
      res = await inscripcionesmateriaService.insertarInscripcionMateria(formData);
    }

    // Si todo va bien (no entró en catch), mostramos éxito
    if (res.success) {
      await cargarInscripcionesMaterias();
      cerrarModal();
      Swal.fire({
        icon: "success",
        title: modoEdicion ? "Actualizado" : "Guardado",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      cerrarModal();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.mensaje || "Ocurrió un error",
      });
    }
  } catch (err) {
    cerrarModal(); 

    const mensaje =
      err.response?.data?.mensaje || err.message || "Error inesperado";

    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje,
    });
  } finally {
    setFormLoading(false);
  }
};


  // Estilos condicionales
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`} style={{ paddingTop: 1 }}>
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
              boxShadow: modoOscuro ? "inset 0 1px 4px rgba(234, 227, 227, 0.1)" : "inset 0 1px 4px rgba(0,0,0,0.1)",
              color: texto,
              transition: "border-color 0.3s ease",
              display: "block",
              margin: "0 auto",
            }}
            onFocus={(e) => (e.target.style.borderColor = modoOscuro ? "#90caf9" : "#1976d2")}
            onBlur={(e) => (e.target.style.borderColor = modoOscuro ? "#444" : "#ccc")}
          />
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
  {/* Contenedores de contadores centrados */}
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
      aria-label={`Usuarios activos: ${activos}`}
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
      aria-label={`Usuarios inactivos: ${inactivos}`}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(135deg, #101010ff, #de1717ff)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(135deg, #ef5350, #0c0b0bff)")
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
      aria-label={`Total de usuarios: ${total}`}
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

  {/* Botón "Nuevo" alineado a la derecha */}
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
    aria-label="Agregar nueva asignación docente"
  >
    <FaPlus /> Nuevo
  </button>
</div>


        {/* Mensajes de estado */}
        {(loading || loadingListas) && <p className="text-gray-400 italic">Cargando datos...</p>}
        {error && <p className="text-red-500 font-medium">Error: {error}</p>}
        {!loading && inscripcionesMaterias.length === 0 && (
          <p className="text-gray-400">No hay inscripciones para mostrar.</p>
        )}

        {/* Tabla */}
        {!loading && inscripcionesMaterias.length > 0 && (
          <div className="scroll-modern overflow-x-auto">
            <table className="min-w-full border-collapse rounded overflow-hidden">
              <thead className={encabezado}>
                <tr>
                  {/*<th className="px-4 py-2 text-left text-sm font-semibold">ID</th>*/}
                  <th className="px-4 py-2 text-left text-sm font-semibold">Estudiante</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Materia</th>
                
                  <th className="px-4 py-2 text-left text-sm font-semibold">Creador</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Modificador</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Creado</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Modificado</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>                     
                  <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-gray-100">
  {inscripcionesFiltradas.map((i) => {
    console.log("InscripcionMateria fila:", i);
    return (
      <tr
        key={i.idInscripcionMateria}
        className={`transition-colors ${modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}
      >
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {buscarNombreEstudiante(i.idInscripcion)}
        </td>
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {buscarNombreMateria(i.idMateria)}
        </td>
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {buscarNombreUsuario(i.idCreador)}
        </td>
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {buscarNombreUsuario(i.idModificador)}
        </td>
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {new Date(i.fechaCreacion).toLocaleString()}
        </td>
        <td className={`px-4 py-2 text-sm ${texto}`}>
          {new Date(i.fechaModificacion).toLocaleString()}
        </td>
        <td className="px-4 py-2 text-center">
          {buscarNombreEstado(i.idEstado).toLowerCase() === "activo" ? (
            <FaCheckCircle className="text-green-500 text-xl mx-auto" />
          ) : (
            <FaTimesCircle className="text-red-500 text-xl mx-auto" />
          )}
        </td>
        <td className="px-4 py-2 text-sm">
          <button
            className="text-blue-600 hover:text-blue-800 text-xl flex justify-center items-center w-full"
            onClick={() => abrirModalEditar(i)}
            aria-label="Editar inscripción"
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
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            aria-modal="true"
            role="dialog"
          >
            <div
              style={{
                backgroundColor: modoOscuro ? "#121212" : "white",
                padding: 20,
                borderRadius: 10,
                width: 350,
                maxWidth: "90%",
                boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
              }}
            >
              <h2 className={`mb-4 text-xl font-semibold ${texto}`}>
                {modoEdicion ? "Editar Inscripción" : "Nueva Inscripción"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGuardar();
                }}
              >
                <label className={`${texto} block mb-1 font-semibold`} htmlFor="idInscripcion">
                  Estudiante (Inscripción)
                </label>
                <select
                  id="idInscripcion"
                  name="idInscripcion"
                  value={formData.idInscripcion}
                  onChange={handleChange}
                  className={`w-full mb-3 p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  aria-required="true"
                >
                  <option value="">Seleccione un estudiante</option>
                  {listas.inscripciones.map((insc) => (
                    <option key={insc.iD_Inscripcion} value={insc.iD_Inscripcion}>
                      {insc.nombreEstudiante}
                    </option>
                  ))}
                </select>

                <label className={`${texto} block mb-1 font-semibold`} htmlFor="idMateria">
                  Materia
                </label>
                <select
                  id="idMateria"
                  name="idMateria"
                  value={formData.idMateria}
                  onChange={handleChange}
                  className={`w-full mb-3 p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  aria-required="true"
                >
                  <option value="">Seleccione una materia</option>
                  {listas.materias.map((m) => (
                    <option key={m.idMateria} value={m.idMateria}>
                      {m.nombreMateria}
                    </option>
                  ))}
                </select>

                <label className={`${texto} block mb-1 font-semibold`} htmlFor="idEstado">
                  Estado
                </label>
                <select
                  id="idEstado"
                  name="idEstado"
                  value={formData.idEstado}
                  onChange={handleChange}
                  className={`w-full mb-3 p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  aria-required="true"
                >
                  <option value="">Seleccione un estado</option>
                    {listas.estados
                      .filter(e => (e.iD_Estado ?? e.idEstado) === 1 || (e.iD_Estado ?? e.idEstado) === 2)
                      .map((e) => (
                        <option key={e.iD_Estado ?? e.idEstado} value={e.iD_Estado ?? e.idEstado}>
                          {e.nombre_Estado ?? e.nombreEstado}
                        </option>
                      ))}
                </select>
                

                {formError && <p className="text-red-500 mb-3">{formError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={formLoading}
                    className="px-4 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500 transition"
                    aria-label="Cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
                      formLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    aria-label={modoEdicion ? "Guardar cambios" : "Guardar nueva inscripción"}
                  >
                    {formLoading ? "Guardando..." : modoEdicion ? "Guardar" : "Crear"}
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

export default FrmInscripcionesMaterias;
