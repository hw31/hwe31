import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import transaccionPermisoService from "../../services/TransaccionesPermiso";
import tipoTransaccionService from "../../services/TiposTransaccion";
import permisoService from "../../services/Permiso";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const TransaccionesPermisos = ({ busqueda = "" }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-800" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idTransaccionPermiso: 0,
    idTipoTransaccion: "",
    idPermiso: "",
    activo: true,
  });

  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [permisos, setPermisos] = useState([]);

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
const cargarDatos = async () => {
  setLoading(true);
  try {
    const [resTP, resTipos, resPerms] = await Promise.all([
      transaccionPermisoService.listarTransaccionesPermisos(),
      tipoTransaccionService.listarTiposTransaccion(),
      permisoService.listarPermisos(),
    ]);

    const tipos = resTipos?.data || resTipos?.resultado || [];
    const permisos = resPerms?.data || resPerms?.resultado || [];
    const transacciones = resTP?.data || resTP?.resultado || [];

    setTiposTransaccion(tipos);
    setPermisos(permisos);

    const listaFormateada = transacciones.map((item) => ({
      ...item,
      tipoTransaccionNombre:
        tipos.find((tt) => tt.idTipoTransaccion === item.idTipoTransaccion)?.descripcion || "Desconocido",
      permisoNombre:
        permisos.find((p) => p.idPermiso === item.idPermiso)?.nombrePermiso || "Desconocido",
      fechaCreacionFormat: formatearFecha(item.fechaCreacion),
      fechaModificacionFormat: formatearFecha(item.fechaModificacion),
    }));

    setDatos(listaFormateada);
    setFormError("");
  } catch (error) {
    console.error("Error cargando datos:", error);
    setDatos([]);
    setFormError("Error al cargar los datos.");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setForm({
      idTransaccionPermiso: 0,
      idTipoTransaccion: "",
      idPermiso: "",
      activo: true,
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const cargarParaEditar = (item) => {
    setForm({
      idTransaccionPermiso: item.idTransaccionPermiso,
      idTipoTransaccion: item.idTipoTransaccion,
      idPermiso: item.idPermiso,
      activo: item.activo,
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
    if (!form.idTipoTransaccion || !form.idPermiso) {
      setFormError("Debe seleccionar transacción y permiso.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        idTipoTransaccion: parseInt(form.idTipoTransaccion),
        idPermiso: parseInt(form.idPermiso),
        activo: form.activo,
      };

      let res;
      if (modoEdicion) {
        payload.idTransaccionPermiso = form.idTransaccionPermiso;
        res = await transaccionPermisoService.actualizarTransaccionPermiso(payload);
      } else {
        res = await transaccionPermisoService.insertarTransaccionPermiso(payload);
      }

      cerrarModal();
      const mensaje = res?.mensaje || res?.message || "Operación realizada.";
      const exito = res?.success || res?.numero > 0;

      await Swal.fire({
        icon: exito ? "success" : "error",
        title: exito ? "Éxito" : "Error",
        text: mensaje,
        confirmButtonColor: exito ? "#3085d6" : "#d33",
      });

      if (exito) cargarDatos();
    } catch (error) {
      cerrarModal();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error inesperado",
        confirmButtonColor: "#d33",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const busquedaLower = busqueda.toLowerCase();
  const filtrados = datos.filter(
    (t) =>
      t.tipoTransaccionNombre?.toLowerCase().includes(busquedaLower) ||
      t.permisoNombre?.toLowerCase().includes(busquedaLower)
  );

  const activos = filtrados.filter((t) => t.activo).length;
  const inactivos = filtrados.length - activos;

  const columnas = [
    { key: "idTransaccionPermiso", label: "ID", className: "text-center w-12" },
    { key: "tipoTransaccionNombre", label: "Tipo Transacción" },
    { key: "permisoNombre", label: "Permiso" },
    { key: "creador", label: "Creador" },
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "modificador", label: "Modificador" },
    { key: "fechaModificacionFormat", label: "Fecha Modificación" },
    { key: "activo", label: "Activo", className: "text-center w-16" },
  ];

  return (
    <div className={`p-4 rounded-xl shadow-md ${fondo}`}>
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-bold cursor-pointer select-none ${texto}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "►" : "▼"} Transacciones-Permisos
        </h2>
      </div>

      {!isCollapsed && (
        <div>
          <ContadoresBase
            activos={activos}
            inactivos={inactivos}
            total={filtrados.length}
            modoOscuro={modoOscuro}
            onNuevo={abrirModalNuevo}
          />

          <TablaBase
            datos={filtrados}
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
        titulo={modoEdicion ? "Editar Transacción-Permiso" : "Nuevo Transacción-Permiso"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Transacción-Permiso"
        >
          <div className="space-y-4">
            <label className={`${texto}`}>Tipo de Transacción:</label>
            <select
              name="idTipoTransaccion"
              value={form.idTipoTransaccion}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <option value="">-- Seleccione --</option>
              {tiposTransaccion.map((t) => (
                <option key={t.idTipoTransaccion} value={t.idTipoTransaccion}>
                  {t.descripcion}
                </option>
              ))}
            </select>

            <label className={`${texto}`}>Permiso:</label>
            <select
              name="idPermiso"
              value={form.idPermiso}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <option value="">-- Seleccione --</option>
              {permisos.map((p) => (
                <option key={p.idPermiso} value={p.idPermiso}>
                  {p.nombrePermiso}
                </option>
              ))}
            </select>

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

export default TransaccionesPermisos;
