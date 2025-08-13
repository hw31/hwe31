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
import AutocompleteSelect from "../Shared/AutocompleteSelect";
import periodoService from "../../services/PeriodoAcademico";
const AsignacionDocenteList = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  /*ocultar columna editar */
 const rol = useSelector((state) => state.auth.rol);
  const rolLower = rol ? rol.toLowerCase() : null;
const mostrarDocente = rolLower === "administrador" || rolLower === "estudiante";


const [loading, setLoading] = useState(false);
console.log("ROL:", rol, "ROL LOWER:", rolLower, "LOADING:", loading);
/*hasta aqui */

  const [formData, setFormData] = useState({
    UsuarioDocente: "",
    IdMateria: "",
    IdGrupo: "",
    IdAula: "",
    IdHorario: "",
     IdPeriodo: "",
    IdEstado: "",
  });

  const [listas, setListas] = useState({
    usuariosRoles: [],
    materias: [],
    grupos: [],
    aulas: [],
    horarios: [],
      periodos: [],
    estados: [],
  });

 
const cargarListas = async () => {
  try {
    const [
      usuariosRolesTodos,
      materias,
      grupos,
      aulasResult,
      horariosResult,
      estadosResult,
      periodosResult
    ] = await Promise.all([
      usuarioService.listarUsuariosRoles(),
      materiaService.listarMaterias(),
      grupoService.listarGrupos(),
      aulaService.listarAula(),
      horarioService.listarHorarios(),
      estadoService.listarEstados(),
      periodoService.listarPeriodosAcademicos()
    ]);

    const usuariosRoles = (usuariosRolesTodos ?? []).filter(
      (u) => u.iD_Rol === 2
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

    // ✅ Aquí corregido para leer "resultado" y filtrar activos
    const periodosRaw = periodosResult?.resultado ?? [];
    const periodos = periodosRaw.filter(p => p.activo === true);

    setListas({
      usuariosRoles,
      materias: materias ?? [],
      grupos: grupos ?? [],
      aulas: aulasResult?.data ?? [],
      horarios,
      estados,
      periodos,
    });
  } catch (err) {
    console.error("Error al cargar listas:", err);
  }
};

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

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  useEffect(() => {
    const init = async () => {
      await cargarListas();
      await cargarAsignaciones();
    };
    init();
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
      IdPeriodo: "",
      IdEstado: "",
    });
  };
const abrirModalNuevo = () => {
  const periodoActivo = listas.periodos?.[0]; // primer periodo activo
  setFormData({
    UsuarioDocente: "", // aquí el select debe asignar iD_Usuario
    IdMateria: "",
    IdGrupo: "",
    IdAula: "",
    IdHorario: "",
    IdPeriodo: periodoActivo?.idPeriodoAcademico || "", // CORRECTO
    IdEstado: "",
  });
  setModoEdicion(false);
  setAsignacionSeleccionada(null);
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
    IdPeriodo: asignacion.idPeriodo || "", // ⚡ coincide con tu API
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
  const { UsuarioDocente, IdMateria, IdGrupo, IdAula, IdHorario, IdPeriodo, IdEstado } = formData;

  if (!UsuarioDocente || !IdMateria || !IdGrupo || !IdAula || !IdHorario || !IdPeriodo || !IdEstado) {
    setFormError("Por favor, complete todos los campos, incluido el periodo académico.");
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

 // ---------- FILTRAR ASIGNACIONES POR PERIODO ACTIVO + BUSQUEDA ----------
  const asignacionesFiltradas = (asignaciones || []).filter(a => {
    const periodosActivosIds = (listas.periodos || []).map(p => p.idPeriodoAcademico);
    if (!periodosActivosIds.includes(a.idPeriodo)) return false; // solo periodo activo

    const texto = busqueda.toLowerCase();
    return (
      (a.nombreDocente?.toLowerCase().includes(texto)) ||
      (listas.usuariosRoles.find(u => u.iD_Usuario === a.usuarioDocenteId)?.nombre_Usuario?.toLowerCase().includes(texto)) ||
      (a.nombreMateria?.toLowerCase().includes(texto)) ||
      (a.nombreGrupo?.toLowerCase().includes(texto)) ||
      (a.nombreAula?.toLowerCase().includes(texto)) ||
      (listas.horarios.find(h => h.idHorario === a.idHorario)?.descripcionHorario?.toLowerCase().includes(texto)) ||
      (a.nombreEstado?.toLowerCase().includes(texto))
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
<>
<div
  style={{
    maxWidth: 800,
    margin: "0 auto 20px",
    width: "90%",
    display: "flex",
    alignItems: "center",
    gap: "20px", // <-- ajusta este valor para acercar o alejar
  }}
>
  <h2
    style={{
      fontSize: "1.75rem",
      fontWeight: "800",
      color: modoOscuro ? "#fff" : "#2d2d2d",
      margin: 0,
    }}
  >
Asignaciones
  </h2>

{rolLower === "administrador" && (
  <input
    type="text"
    placeholder="Buscar..."
    value={busqueda}
    onChange={handleBusquedaChange}
    style={{
      width: "100%",          // ocupa todo el ancho disponible
      maxWidth: "380px",      // máximo ancho en desktop
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
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",  // importante para que padding no agrande ancho
    }}
    onFocus={(e) =>
      (e.target.style.borderColor = modoOscuro ? "#90caf9" : "#1976d2")
    }
    onBlur={(e) =>
      (e.target.style.borderColor = modoOscuro ? "#444" : "#ccc")
    }
  />
)}


</div>

 {rolLower === "administrador" && (
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
    {rolLower === "administrador" && (
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
  </button>)}
</div>)}


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
          {/* Mostrar columna Docente solo si es administrador o estudiante */}
          {(rolLower === "administrador" || rolLower === "estudiante") && (
            <th className="px-4 py-2 text-left text-sm font-semibold">Docente</th>
          )}
          <th className="px-4 py-2 text-left text-sm font-semibold">Materia</th>
          <th className="px-4 py-2 text-left text-sm font-semibold">Grupo</th>
          <th className="px-4 py-2 text-left text-sm font-semibold">Aula</th>
          <th className="px-4 py-2 text-left text-sm font-semibold">Horario</th>
           <th className="px-4 py-2 text-left text-sm font-semibold">Periodo</th>
          {rolLower === "administrador" && (
            <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
          )}
          {rolLower === "administrador" && (
            <th className="px-4 py-2 text-left text-sm font-semibold">Acciones</th>
          )}
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
            {(rolLower === "administrador" || rolLower === "estudiante") && (
              <td className={`px-4 py-2 text-sm ${texto}`}>
                {
                  listas.usuariosRoles.find(
                    (u) => u.iD_Usuario === asig.usuarioDocenteId
                  )?.nombre_Usuario || "N/D"
                }
              </td>
            )}
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
                const horario = listas.horarios.find(
                  (h) => h.idHorario === asig.idHorario
                );
                return horario ? horario.descripcionHorario : "N/D";
              })()}
              
            </td>
              <td className={`px-4 py-2 text-sm ${texto}`}>
  {asig.nombrePeriodo || "N/D"}
</td>

            {rolLower === "administrador" && (
              <td className="px-4 py-2 text-center">
                {asig.nombreEstado?.toLowerCase() === "activo" ? (
                  <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                )}
              </td>
            )}
            {rolLower === "administrador" && (
              <td className="px-4 py-2 text-sm">
                <button
                  className="text-blue-600 hover:text-blue-800 text-xl flex justify-center items-center w-full"
                  onClick={() => abrirModalEditar(asig)}
                  aria-label="Editar asignación"
                >
                  <FaEdit />
                </button>
              </td>
            )}
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
               <AutocompleteSelect
                label="Docente"
                value={formData.UsuarioDocente}
                onChange={(val) => setFormData({ ...formData, UsuarioDocente: val })}
                options={listas.usuariosRoles}
                getOptionLabel={(u) => u.nombre_Usuario ?? "Sin nombre"}
                getOptionValue={(u) => u.iD_Usuario}
              />
  {/* Periodo */}
<AutocompleteSelect
  label="Periodo Académico"
  value={formData.IdPeriodo}
  onChange={(val) =>
    setFormData((prev) => ({ ...prev, IdPeriodo: val }))
  }
  options={listas.periodos?.map((p) => ({
    value: p.idPeriodoAcademico, // ⚡ cambiar a idPeriodoAcademico
    label: p.nombrePeriodo,
  }))}
/>








              <AutocompleteSelect
                label="Materia"
                value={formData.IdMateria}
                onChange={(val) => setFormData({ ...formData, IdMateria: val })}
                options={listas.materias}
                getOptionLabel={(m) => m.nombreMateria ?? "Sin nombre"}
                getOptionValue={(m) => m.idMateria}
              />

              <AutocompleteSelect
                label="Grupo"
                value={formData.IdGrupo}
                onChange={(val) => setFormData({ ...formData, IdGrupo: val })}
                options={listas.grupos}
                getOptionLabel={(g) => g.codigoGrupo ?? "Sin nombre"}
                getOptionValue={(g) => g.idGrupo}
              />

              <AutocompleteSelect
                label="Aula"
                value={formData.IdAula}
                onChange={(val) => setFormData({ ...formData, IdAula: val })}
                options={listas.aulas}
                getOptionLabel={(a) => a.nombreAula ?? "Sin nombre"}
                getOptionValue={(a) => a.idAula}
              />

              <AutocompleteSelect
                label="Horario"
                value={formData.IdHorario}
                onChange={(val) => setFormData({ ...formData, IdHorario: val })}
                options={listas.horarios}
                getOptionLabel={(h) => h.descripcionHorario ?? "Sin descripción"}
                getOptionValue={(h) => h.idHorario}
              />

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

   </>
  );
};

export default AsignacionDocenteList;


