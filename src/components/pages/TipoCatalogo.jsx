import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import tipoCatalogoService from "../../services/TipoCatalogo";
import usuarioService from "../../services/Usuario";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const TipoCatalogo = ({ busqueda = "" }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-800" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [tipos, setTipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idTipoCatalogo: 0,
    nombreTipoCatalogo: "",
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

  const cargarUsuarios = async () => {
    try {
      const res = await usuarioService.listarUsuario();
      if (res?.success && Array.isArray(res.data)) {
        setUsuarios(res.data);
      }
    } catch {
      setUsuarios([]);
    }
  };

  const obtenerNombreUsuario = (id) => {
    const usuario = usuarios.find((u) => u.idUsuario === id);
    return usuario?.nombreCompleto || usuario?.nombreUsuario || "N/D";
  };

  const cargarTipos = async () => {
    setLoading(true);
    try {
      const res = await tipoCatalogoService.listarTiposCatalogo();
      const tiposData = res?.data || (Array.isArray(res) ? res : []);
      const tiposConNombres = tiposData.map((t) => ({
        ...t,
        nombreCreador: obtenerNombreUsuario(t.idCreador),
        nombreModificador: obtenerNombreUsuario(t.idModificador),
        fechaCreacionFormat: formatearFecha(t.fechaCreacion),
        fechaModificacionFormat: formatearFecha(t.fechaModificacion),
      }));
      setTipos(tiposConNombres);
      setFormError("");
    } catch {
      setTipos([]);
      setFormError("Error al cargar tipos de catálogo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarios.length > 0) cargarTipos();
  }, [usuarios]);

  const abrirModalNuevo = () => {
    setForm({ idTipoCatalogo: 0, nombreTipoCatalogo: "", activo: true });
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
      idTipoCatalogo: tipo.idTipoCatalogo,
      nombreTipoCatalogo: tipo.nombreTipoCatalogo,
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
    if (!form.nombreTipoCatalogo.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        nombreTipoCatalogo: form.nombreTipoCatalogo.trim(),
        activo: form.activo,
      };

      let res;
      if (modoEdicion) {
        payload.idTipoCatalogo = form.idTipoCatalogo;
        res = await tipoCatalogoService.actualizarTipoCatalogo(payload);
      } else {
        res = await tipoCatalogoService.insertarTipoCatalogo(payload);
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
    t.nombreTipoCatalogo?.toLowerCase().includes(busquedaLower)
  );

  const activos = tiposFiltrados.filter((t) => t.activo).length;
  const inactivos = tiposFiltrados.length - activos;

  const columnas = [
    { key: "idTipoCatalogo", label: "ID", className: "text-center w-12" },
    { key: "nombreTipoCatalogo", label: "Nombre" },
    { key: "nombreCreador", label: "Creador" },
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "nombreModificador", label: "Modificador" },
    { key: "fechaModificacionFormat", label: "Fecha Modificación" },
    { key: "activo", label: "Activo", className: "text-center w-16" },
  ];

  return (
    <div className="p-4">
      <div className={`shadow-lg rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide cursor-pointer select-none ${texto}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-controls="tipoCatalogoContent"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsCollapsed(!isCollapsed);
              }
            }}
          >
            {isCollapsed ? "►" : "▼"} Tipos de Catálogo
          </h2>
        </div>

        {!isCollapsed && (
          <div id="tipoCatalogoContent">
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
          titulo={modoEdicion ? "Editar Tipo de Catálogo" : "Nuevo Tipo de Catálogo"}
          modoOscuro={modoOscuro}
        >
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Tipo Catálogo"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombreTipoCatalogo"
                placeholder="Nombre *"
                value={form.nombreTipoCatalogo}
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
    </div>
  );
};

export default TipoCatalogo;
