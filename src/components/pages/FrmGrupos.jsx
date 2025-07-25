import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import grupoService from "../../services/Grupos";
import estadoService from "../../services/Estado";

import {
  FaEdit,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

const FrmGrupos = ({ modoOscuro }) => {
  const [grupos, setGrupos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    idcodigoGrupo: 0,
    codigoGrupo: "",
    idEstado: 1,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Obtener grupos
  const obtenerGrupos = async () => {
    try {
      const data = await grupoService.listarGrupos();

      const gruposMapeados = data.map((g) => ({
        idGrupo: g.idGrupo ?? g.iD_Grupo ?? g.idcodigoGrupo,
        codigoGrupo: g.codigoGrupo ?? g.codigo_Grupo ?? "",
        idEstado: g.idEstado ?? g.iD_Estado ?? 1,
        creador: g.creador ?? "N/D",
        modificador: g.modificador ?? "N/D",
        fechaCreacion: g.fechaCreacion ?? g.fecha_Creacion ?? "",
        fechaModificacion: g.fechaModificacion ?? g.fecha_Modificacion ?? "",
      }));
      setGrupos(gruposMapeados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los grupos", "error");
    }
  };

  // Obtener estados filtrados (solo activos e inactivos)
  const obtenerEstados = async () => {
    try {
      const response = await estadoService.listarEstados();

      // Detecta la estructura de respuesta
      const data = Array.isArray(response)
        ? response
        : response.datos
        ? response.datos
        : response.data
        ? response.data
        : [];

      const filtrados = data
        .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
        .map((e) => ({
          idEstado: e.iD_Estado,
          nombreEstado: e.nombre_Estado,
        }));

      setEstados(filtrados);
      return filtrados;
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los estados", "error");
      return [];
    }
  };

  useEffect(() => {
    obtenerGrupos();
    obtenerEstados();
  }, []);

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  const gruposFiltrados = grupos.filter((g) =>
    g.codigoGrupo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Contadores
  const total = grupos.length;
  const activos = grupos.filter((g) => g.idEstado === 1).length;
  const inactivos = grupos.filter((g) => g.idEstado === 2).length;

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormData({ idcodigoGrupo: 0, codigoGrupo: "", idEstado: 1 });
    setFormError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (grupo) => {
    setModoEdicion(true);
    setFormData({
      idcodigoGrupo: grupo.idGrupo,
      codigoGrupo: grupo.codigoGrupo,
      idEstado: grupo.idEstado,
    });
    setFormError("");
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "idEstado" ? Number(value) : value,
    });
    setFormError("");
  };
const handleGuardar = async () => {
  if (!formData.codigoGrupo.trim()) {
    await Swal.fire("Error", "El código del grupo es obligatorio", "error");
    return;
  }

  setFormLoading(true);

  const payload = {
    codigoGrupo: formData.codigoGrupo.trim(),
    idEstado: Number(formData.idEstado),
  };

  try {
    if (modoEdicion) {
      const res = await grupoService.actualizarGrupo({
        idcodigoGrupo: formData.idcodigoGrupo,
        ...payload,
      });

      if (res?.numero === -1) {
        cerrarModal(); // Cerramos modal antes de mostrar el error
        await Swal.fire("Error", res.mensaje, "error");
        return; // Salimos para no continuar
      } else {
        cerrarModal();
        await Swal.fire("Actualizado", "Grupo actualizado correctamente", "success");
        obtenerGrupos();
      }
    } else {
      const res = await grupoService.insertarGrupos(payload);

      if (res?.numero === -1) {
        cerrarModal(); // Igual para inserción por si acaso
        await Swal.fire("Error", res.mensaje, "error");
        return;
      } else {
        cerrarModal();
        await Swal.fire("Registrado", "Grupo registrado correctamente", "success");
        obtenerGrupos();
      }
    }
  } catch (error) {
    console.error(error);

    let mensajeError = "No se pudo guardar el grupo";
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.mensaje) mensajeError = data.mensaje;
      else if (typeof data === "string") mensajeError = data;
    } else if (error.message) {
      mensajeError = error.message;
    }
    cerrarModal(); // También cerramos modal si hay error en catch
    await Swal.fire("Error", mensajeError, "error");
  } finally {
    setFormLoading(false);
  }
};

  // Renderiza íconos de estado con check y X en círculos
  const renderEstadoIcono = (idEstado) => {
    if (idEstado === 1)
      return (
        <FaCheckCircle
          title="Activo"
          aria-label="Activo"
          className="text-green-500 text-xl mx-auto"
        />
      );
    if (idEstado === 2)
      return (
        <FaTimesCircle
          title="Inactivo"
          aria-label="Inactivo"
          className="text-red-500 text-xl mx-auto"
        />
      );
    return null;
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-6 rounded-lg shadow-lg ${
        modoOscuro
          ? "bg-blue-900 text-white shadow-blue-900/50"
          : "bg-white text-gray-900 shadow-lg"
      }`}
      style={{ minHeight: "85vh" }}
    >
      {/* Buscador + botón nuevo en línea con contadores */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex-grow max-w-[600px] w-full mx-auto sm:mx-0">
          <input
            type="text"
            placeholder="Buscar grupo por código..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className={`w-full px-4 py-2 rounded-full border ${
              modoOscuro
                ? "border-blue-300 bg-blue-800 text-white placeholder-blue-300 focus:border-blue-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-600"
            } transition-colors duration-300 outline-none`}
            aria-label="Buscar grupo por código"
          />
        </div>

        {/* Contenedores + Botón Nuevo */}
        <div className="flex items-center gap-6 ml-auto flex-wrap sm:flex-nowrap">
          {/* Activos */}
          <div
            role="region"
            aria-label={`Grupos activos: ${activos}`}
            tabIndex={0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white cursor-pointer transition duration-300"
            style={{
              background: "linear-gradient(135deg, #127f45ff, #0c0b0bff)",
              boxShadow: "0 3px 8px rgba(2, 79, 33, 0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #0c0b0bff,  #084b27 )")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #127f45ff, #0c0b0bff)")
            }
          >
            <FaCheckCircle size={20} />
            Activos
            <span className="ml-2 text-2xl font-bold">{activos}</span>
          </div>

          {/* Inactivos */}
          <div
            role="region"
            aria-label={`Grupos inactivos: ${inactivos}`}
            tabIndex={0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white cursor-pointer transition duration-300"
            style={{
              background: "linear-gradient(135deg, #ef5350, #0c0b0bff)",
              boxShadow: "0 3px 8px rgba(244,67,54,0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #101010ff, #de1717ff)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #ef5350, #0c0b0bff)")
            }
          >
            <FaTimesCircle size={20} />
            Inactivos
            <span className="ml-2 text-2xl font-bold">{inactivos}</span>
          </div>

          {/* Total */}
          <div
            role="region"
            aria-label={`Total de grupos: ${total}`}
            tabIndex={0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white cursor-pointer transition duration-300"
            style={{
              background: "linear-gradient(135deg, #0960a8ff, #20262dff)",
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
            <FaUser size={20} />
            Total
            <span className="ml-2 text-2xl font-bold">{total}</span>
          </div>

          {/* Botón Nuevo */}
          <button
            onClick={abrirModalNuevo}
            type="button"
            aria-label="Agregar nuevo grupo"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow-md transition-colors whitespace-nowrap"
            style={{ minWidth: 130 }}
          >
            <FaPlus />
            Nuevo
          </button>
        </div>
      </div>

      {/* Tabla */}
      {gruposFiltrados.length === 0 ? (
        <p
          className={`text-center italic ${
            modoOscuro ? "text-blue-300" : "text-gray-500"
          }`}
        >
          No hay grupos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded shadow-md">
          <table
            className={`min-w-full border border-gray-300 text-sm rounded-md ${
              modoOscuro
                ? "bg-blue-900 text-white border-blue-800"
                : "bg-white text-gray-900"
            }`}
          >
            <thead
              className={`${
                modoOscuro
                  ? "bg-blue-800 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Creador</th>
                <th className="px-4 py-2 text-left">Modificador</th>
                <th className="px-4 py-2 text-left">Creación</th>
                <th className="px-4 py-2 text-left">Modificación</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gruposFiltrados.map((grupo) => (
                <tr
                  key={grupo.idGrupo}
                  className={`border-t border-blue-800 cursor-pointer transition-colors duration-300 ${
                    modoOscuro ? "hover:bg-blue-800" : "hover:bg-blue-50"
                  }`}
                >
                  <td className="px-4 py-2">{grupo.codigoGrupo}</td>
                  <td className="px-4 py-2 flex items-center gap-2 justify-center">
                    {renderEstadoIcono(grupo.idEstado)}
                  </td>
                  <td className="px-4 py-2">{grupo.creador}</td>
                  <td className="px-4 py-2">{grupo.modificador}</td>
                  <td className="px-4 py-2">
                    {grupo.fechaCreacion
                      ? new Date(grupo.fechaCreacion).toLocaleString()
                      : "N/D"}
                  </td>
                  <td className="px-4 py-2">
                    {grupo.fechaModificacion
                      ? new Date(grupo.fechaModificacion).toLocaleString()
                      : "N/D"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => abrirModalEditar(grupo)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white transition-colors"
                      aria-label={`Editar grupo ${grupo.codigoGrupo}`}
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
            <h3
              id="tituloModal"
              style={{ marginBottom: 20, color: "#1976d2" }}
            >
              {modoEdicion ? "Editar Grupo" : "Nuevo Grupo"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              {/* Código Grupo */}
              <label
                className="block mb-2 font-semibold"
                htmlFor="codigoGrupo"
              >
                Código del grupo:
                <input
                  id="codigoGrupo"
                  type="text"
                  name="codigoGrupo"
                  value={formData.codigoGrupo}
                  onChange={handleChange}
                  className={`w-full p-2 mt-1 mb-4 rounded border ${
                    modoOscuro
                      ? "border-gray-600 bg-gray-800 text-white"
                      : "border-gray-400"
                  }`}
                  required
                  autoFocus
                  aria-label="Código del grupo"
                />
              </label>

              {/* Estado */}
              <label
                className="block mb-4 font-semibold"
                htmlFor="idEstado"
              >
                Estado:
                <select
                  id="idEstado"
                  name="idEstado"
                  value={formData.idEstado}
                  onChange={handleChange}
                  className={`w-full p-2 mt-1 rounded border ${
                    modoOscuro
                      ? "border-gray-600 bg-gray-800 text-white"
                      : "border-gray-400"
                  }`}
                  required
                  aria-label="Estado del grupo"
                >
                  {estados.length === 0 ? (
                    <option value="">Cargando estados...</option>
                  ) : (
                    estados.map((e) => (
                      <option key={e.idEstado} value={e.idEstado}>
                        {e.nombreEstado}
                      </option>
                    ))
                  )}
                </select>
              </label>

              {formError && (
                <p className="text-red-500 mb-3 font-semibold">{formError}</p>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className={`px-4 py-2 rounded border ${
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
                  {formLoading
                    ? "Guardando..."
                    : modoEdicion
                    ? "Actualizar"
                    : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmGrupos;
