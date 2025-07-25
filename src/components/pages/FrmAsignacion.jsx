import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import asignacionDocenteService from "../../services/AsignacionDocente";
import usuarioService from "../../services/UsuariosRoles"; // listarUsuariosRoles
import materiaService from "../../services/Materias"; // listarMaterias
import grupoService from "../../services/Grupos"; // listarGrupos
import aulaService from "../../services/Aulas"; // listarAula
import horarioService from "../../services/Horarios"; // listarHorarios
import estadoService from "../../services/Estado"; // listarEstados

import { FaPlus, FaEdit, FaUser, FaUserCheck, FaUserTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const AsignacionDocenteList = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    UsuarioDocente: "",
    IdMateria: "",
    IdGrupo: "",
    IdAula: "",
    IdHorario: "",
    IdEstado: "",
  });

  const [listas, setListas] = useState({
    usuariosRoles: [],
    materias: [],
    grupos: [],
    aulas: [],
    horarios: [],
    estados: [],
  });

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await asignacionDocenteService.listarAsignaciones();
      setAsignaciones(data);
      setError("");
    } catch (err) {
      setError(err.message || "Error al cargar asignaciones");
    } finally {
      setLoading(false);
    }
  };

  const cargarListas = async () => {
    try {
      const [
        usuariosRolesTodos,
        materias,
        grupos,
        aulasResult,
        horariosResult,
        estadosResult,
      ] = await Promise.all([
        usuarioService.listarUsuariosRoles(),
        materiaService.listarMaterias(),
        grupoService.listarGrupos(),
        aulaService.listarAula(),
        horarioService.listarHorarios(),
        estadoService.listarEstados(),
      ]);

      const usuariosRoles = (usuariosRolesTodos ?? []).filter(
        (u) => u.iD_Rol === 2 // Solo docentes
      );

      const estadosRaw = estadosResult?.data ?? [];
      const estados = estadosRaw.map((e) => ({
        idEstado: e.iD_Estado ?? e.idEstado,
        nombreEstado: e.nombre_Estado ?? e.nombreEstado,
      }));

      const horariosRaw = Array.isArray(horariosResult)
        ? horariosResult
        : horariosResult?.resultado ?? [];

      const horarios = horariosRaw.map((h) => ({
        idHorario: h.iD_Horario ?? h.idHorario,
        nombreHorario: h.nombreDiaSemana ?? "",
        descripcionHorario: `${h.nombreDiaSemana ?? "Día"} ${h.horaInicio ?? ""} - ${h.horaFin ?? ""}`,
      }));

      setListas({
        usuariosRoles,
        materias: materias ?? [],
        grupos: grupos ?? [],
        aulas: aulasResult?.data ?? [],
        horarios,
        estados,
      });
    } catch (err) {
      console.error("Error al cargar listas:", err);
    }
  };

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  useEffect(() => {
    cargarAsignaciones();
    cargarListas();
  }, []);

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
    setModoEdicion(false);
    setAsignacionSeleccionada(null);
    setFormData({
      UsuarioDocente: "",
      IdMateria: "",
      IdGrupo: "",
      IdAula: "",
      IdHorario: "",
      IdEstado: "",
    });
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setAsignacionSeleccionada(null);
    setFormData({
      UsuarioDocente: "",
      IdMateria: "",
      IdGrupo: "",
      IdAula: "",
      IdHorario: "",
      IdEstado: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (asignacion) => {
    setModoEdicion(true);
    setAsignacionSeleccionada(asignacion);
    setFormData({
      UsuarioDocente: asignacion.usuarioDocenteId || "",
      IdMateria: asignacion.idMateria || "",
      IdGrupo: asignacion.idGrupo || "",
      IdAula: asignacion.idAula || "",
      IdHorario: asignacion.idHorario || "",
      IdEstado: asignacion.idEstado || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    const { UsuarioDocente, IdMateria, IdGrupo, IdAula, IdHorario, IdEstado } = formData;
    if (!UsuarioDocente || !IdMateria || !IdGrupo || !IdAula || !IdHorario || !IdEstado) {
      setFormError("Por favor, complete todos los campos.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;
    setFormLoading(true);

    const datosEnviar = { ...formData };

    try {
      let respuesta;
      if (modoEdicion && asignacionSeleccionada) {
        respuesta = await asignacionDocenteService.actualizarDocente({
          ...datosEnviar,
          IdAsignacion: asignacionSeleccionada.idAsignacion,
        });
      } else {
        respuesta = await asignacionDocenteService.insertarDocente(datosEnviar);
      }

      cerrarModal();

      if (respuesta?.error || respuesta?.success === false) {
        throw new Error(respuesta.message || "Error desconocido al guardar.");
      }

      await cargarAsignaciones();
      await cargarListas(); // ✅ Refrescar también listas

      await Swal.fire({
        icon: "success",
        title: modoEdicion ? "Actualizado" : "Guardado",
        text: modoEdicion
          ? "La asignación se actualizó correctamente."
          : "La asignación se guardó correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al guardar:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al guardar la asignación",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const asignacionesFiltradas = asignaciones.filter((asig) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      (asig.nombreDocente?.toLowerCase().includes(textoBusqueda)) ||
      (listas.usuariosRoles.find((u) => u.iD_Usuario === asig.usuarioDocenteId)?.nombre_Usuario
        ?.toLowerCase()
        .includes(textoBusqueda)) ||
      (asig.nombreMateria?.toLowerCase().includes(textoBusqueda)) ||
      (asig.nombreGrupo?.toLowerCase().includes(textoBusqueda)) ||
      (asig.nombreAula?.toLowerCase().includes(textoBusqueda)) ||
      (listas.horarios.find((h) => h.idHorario === asig.idHorario)?.descripcionHorario
        ?.toLowerCase()
        .includes(textoBusqueda)) ||
      (asig.nombreEstado?.toLowerCase().includes(textoBusqueda))
    );
  });

  const total = asignaciones.length;
  const activos = asignaciones.filter((a) => a.nombreEstado?.toLowerCase() === "activo").length;
  const inactivos = total - activos;

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  return (
    
   <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}
     style={{ paddingTop: 1 }}  >
      <div className={`shadow-md rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
            ASIGNACIONES
          </h2>
        </div>
          

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
            color: texto,
          
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

        {/* Mensajes */}
        {loading && <p className="text-gray-400 italic">Cargando asignaciones...</p>}
        {error && <p className="text-red-500 font-medium">Error: {error}</p>}
        {!loading && asignaciones.length === 0 && (
          <p className="text-gray-400">No hay asignaciones para mostrar.</p>
        )}

        {/* Tabla */}
        {!loading && asignaciones.length > 0 && (
           <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={encabezado}>
                <tr>
                  {/*<th className="px-4 py-2 text-left text-sm font-semibold">ID</th>*/}
                  <th className="px-4 py-2 text-left text-sm font-semibold">Docente</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Materia</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Grupo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Aula</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Horario</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {asignacionesFiltradas.map((asig) => (
               
                  <tr
                    key={asig.idAsignacion}
                    className={`transition-colors ${
                      modoOscuro ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    }`}
                  >
                    <td className={`px-4 py-2 text-sm ${texto}`}>
                      {
                        listas.usuariosRoles.find(
                          (u) => u.iD_Usuario === asig.usuarioDocenteId
                        )?.nombre_Usuario || "N/D"
                      }
                    </td>

                    <td className={`px-4 py-2 text-sm ${texto}`}>
                      {asig.nombreMateria || "N/D"}
                    </td>
                    <td className={`px-4 py-2 text-sm ${texto}`}>
                      {asig.nombreGrupo || "N/D"}
                    </td>
                    <td className={`px-4 py-2 text-sm ${texto}`}>
                      {asig.nombreAula || "N/D"}
                    </td>
                    <td className={`px-4 py-2 text-sm ${texto}`}>
                      {(() => {
                        const horario = listas.horarios.find(h => h.idHorario === asig.idHorario);
                        return horario ? horario.descripcionHorario : "N/D";
                      })()}
                    </td>

                    <td className="px-4 py-2 text-center">
                        {asig.nombreEstado?.toLowerCase() === "activo" ? (
                          <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                        ) : (
                          <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                        )}
                    </td>

                    <td className="px-4 py-2 text-sm">
                     <button
                      className="text-blue-600 hover:text-blue-800 text-xl flex justify-center items-center w-full"
                      onClick={() => abrirModalEditar(asig)}
                      aria-label="Editar asignación"
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
                maxHeight: "80vh", // max 80% viewport height
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="tituloModal" style={{ marginBottom: 20, color: "#1976d2" }}>
                {modoEdicion ? "Editar Asignación" : "Nueva Asignación"}
              </h3>

              {/* Formulario */}
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
                    name="UsuarioDocente"
                    value={formData.UsuarioDocente}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 mb-4 rounded border"
                    required
                  >
                    <option value="">Seleccione un docente</option>
                    {listas.usuariosRoles.map((u, idx) => (
                      <option
                        key={u.iD_Usuario_Roles ?? idx}
                        value={u.iD_Usuario ?? ""}
                      >
                        {u.nombre_Usuario ?? "Sin nombre"}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Materia */}
                <label className="block mb-2 font-semibold">
                  Materia:
                  <select
                    name="IdMateria"
                    value={formData.IdMateria}
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

                {/* Grupo */}
                <label className="block mb-2 font-semibold">
                  Grupo:
                  <select
                    name="IdGrupo"
                    value={formData.IdGrupo}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 mb-4 rounded border"
                    required
                  >
                    <option value="">Seleccione un grupo</option>
                    {listas.grupos.map((g, idx) => (
                      <option key={g.idGrupo ?? idx} value={g.idGrupo ?? ""}>
                        {g.codigoGrupo ?? "Sin nombre"}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Aula */}
                <label className="block mb-2 font-semibold">
                  Aula:
                  <select
                    name="IdAula"
                    value={formData.IdAula}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 mb-4 rounded border"
                    required
                  >
                    <option value="">Seleccione un aula</option>
                    {listas.aulas.map((a, idx) => (
                      <option key={a.idAula ?? idx} value={a.idAula ?? ""}>
                        {a.nombreAula ?? "Sin nombre"}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Horario */}
                <label className="block mb-2 font-semibold">Horario:</label>
                <select
                  name="IdHorario"
                  value={formData.IdHorario}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 mb-4 rounded border"
                  required
                >
                  <option value="">Seleccione un horario</option>
                  {listas.horarios.map((h, idx) => (
                    <option key={h.idHorario ?? idx} value={h.idHorario ?? ""}>
                      {h.descripcionHorario || "Sin descripción"}
                    </option>
                  ))}
                </select>


                {/* Estado */}
                <label className="block mb-2 font-semibold">
                  Estado:
                  <select
                    name="IdEstado"
                    value={formData.IdEstado}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 mb-4 rounded border"
                    required
                  >
                    <option value="">Seleccione un estado</option>
                   {listas.estados
                    .filter(e => e.idEstado === 1 || e.idEstado === 2)
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
                      modoOscuro
                        ? "border-gray-600 text-gray-300"
                        : "border-gray-400 text-gray-700"
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

export default AsignacionDocenteList;
