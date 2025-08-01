import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import tipoTransaccionService from "../../services/TiposTransaccion";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmTipoTransacciones = ({ busqueda = "" }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-800" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idTipoTransaccion: 0,
    descripcion: "",
    activo: true,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const cargarTipos = async () => {
    setLoading(true);
    try {
      const res = await tipoTransaccionService.listarTiposTransaccion();
      const tiposData = res?.data || (Array.isArray(res) ? res : []);
      const tiposFormateados = tiposData.map((t) => ({
        ...t,
        fechaCreacionFormat: formatearFecha(t.fechaCreacion),
        fechaModificacionFormat: formatearFecha(t.fechaModificacion),
        // Usamos directamente las propiedades 'creador' y 'modificador' que vienen en la API
      }));
      setTipos(tiposFormateados);
      setFormError("");
    } catch {
      setTipos([]);
      setFormError("Error al cargar tipos de transacciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const abrirModalNuevo = () => {
    setForm({ idTipoTransaccion: 0, descripcion: "", activo: true });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const cargarParaEditar = (tipo) => {
    setForm({
      idTipoTransaccion: tipo.idTipoTransaccion,
      descripcion: tipo.descripcion,
      activo: tipo.activo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "activo" ? value === "true" : value,
    }));
  };

  const handleGuardar = async () => {
    if (!form.descripcion.trim()) {
      setFormError("La descripción es obligatoria.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        descripcion: form.descripcion.trim(),
        activo: form.activo,
      };

      let res;
      if (modoEdicion) {
        payload.idTipoTransaccion = form.idTipoTransaccion;
        res = await tipoTransaccionService.actualizarTipoTransaccion(payload);
      } else {
        res = await tipoTransaccionService.insertarTipoTransaccion(payload);
      }

      cerrarModal();
      const mensaje = res?.mensaje || res?.message || "Operación realizada.";
      const esExito = res?.success || res?.numero > 0;

      await Swal.fire({
        icon: esExito ? "success" : "error",
        title: esExito ? "Éxito" : "Error",
        text: mensaje,
        confirmButtonColor: esExito ? "#3085d6" : "#d33",
      });

      if (esExito) cargarTipos();
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Error inesperado";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const busquedaLower = busqueda.toLowerCase();
  const tiposFiltrados = tipos.filter((t) =>
    t.descripcion?.toLowerCase().includes(busquedaLower)
  );

  const activos = tiposFiltrados.filter((t) => t.activo).length;
  const inactivos = tiposFiltrados.length - activos;

  const columnas = [
    { key: "idTipoTransaccion", label: "ID", className: "text-center w-12" },
    { key: "descripcion", label: "Descripción" },
    { key: "creador", label: "Creador" },          // Directo del API
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "modificador", label: "Modificador" },  // Directo del API
    { key: "fechaModificacionFormat", label: "Fecha Modificación" },
    { key: "activo", label: "Activo", className: "text-center w-16" },
  ];

  return (
    <div className={`p-4 rounded-xl shadow-md ${fondo}`}>
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-bold cursor-pointer select-none ${texto}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-controls="tipoTransaccionContent"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          {isCollapsed ? "►" : "▼"} Tipos de Transacción
        </h2>
      </div>

      {!isCollapsed && (
        <div id="tipoTransaccionContent">
          <ContadoresBase
            activos={activos}
            inactivos={inactivos}
            total={tiposFiltrados.length}
            modoOscuro={modoOscuro}
            onNuevo={abrirModalNuevo}
          />

          <TablaBase
            datos={tiposFiltrados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
            onEditar={cargarParaEditar}
          />
        </div>
      )}

      <ModalBase
        isOpen={modalOpen}
        onClose={cerrarModal}
        titulo={modoEdicion ? "Editar Tipo de Transacción" : "Nuevo Tipo de Transacción"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Tipo Transacción"
        >
          <div className="space-y-4">
            <input
              type="text"
              name="descripcion"
              placeholder="Descripción *"
              value={form.descripcion}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
              required
              autoFocus
            />
            <label className={`block ${texto}`}>
              Estado:
              <select
                name="activo"
                value={form.activo}
                onChange={handleInputChange}
                className={`w-full mt-1 px-3 py-2 border rounded ${
                  modoOscuro
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </label>
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default FrmTipoTransacciones;
