import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import transaccionRolService from "../../services/TransaccionxRol";
import tipoTransaccionService from "../../services/TiposTransaccion";
import rolService from "../../services/Roles";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const TransaccionesRoles = ({ busqueda = "" }) => {
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
    idTransaccionesxRol: 0,
    idRol: "",
    idTransaccion: "",
    idEstado: 1,
  });

  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
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
      const [resTR, resTipos, resRoles, resEstados] = await Promise.all([
        transaccionRolService.listarTransaccionesPorRol(),
        tipoTransaccionService.listarTiposTransaccion(),
        rolService.listarRoles(),
        estadoService.listarEstados(),
      ]);

      // Normalizar tipos de transacción
      setTiposTransaccion(resTipos?.data || resTipos?.resultado || []);

      // Normalizar roles
      const rolesRes = resRoles?.data || resRoles?.resultado || [];
      const rolesNormalizados = rolesRes.map((r) => ({
        idRol: r.iD_Rol ?? r.idRol,
        nombreRol: r.nombre_Rol ?? r.nombreRol,
        activo: r.activo,
        fechaCreacion: r.fecha_Creacion ?? r.fechaCreacion,
        fechaModificacion: r.fecha_Modificacion ?? r.fechaModificacion,
        idCreador: r.iD_Creador ?? r.idCreador,
        nombreCreador: r.nombre_Creador ?? r.nombreCreador,
        idModificador: r.iD_Modificador ?? r.idModificador,
        nombreModificador: r.nombre_Modificador ?? r.nombreModificador,
      }));
      setRoles(rolesNormalizados);

      // Depurar estructura de estados
      console.log("Respuesta cruda de estados:", resEstados);

      // Normalizar estados — dependiendo si vienen en resEstados.data o resEstados.datos o resEstados.resultado
      const estadosRaw = resEstados?.data || resEstados?.datos || resEstados?.resultado || [];
      console.log("Estados sin filtrar:", estadosRaw);

      // Normalizar propiedades de estado para evitar problemas de mayúsculas/minúsculas
      const estadosNormalizados = estadosRaw.map((e) => ({
        iD_Estado: e.iD_Estado ?? e.idEstado ?? e.ID_Estado ?? e.id_estado,
        nombre_Estado: e.nombre_Estado ?? e.nombreEstado ?? e.nombre_estado ?? e.Nombre_Estado,
      }));

      // Filtrar sólo activos e inactivos (id 1 y 2)
      const estadosFiltrados = estadosNormalizados.filter(
        (e) => e.iD_Estado === 1 || e.iD_Estado === 2
      );

      console.log("Estados filtrados:", estadosFiltrados);
      setEstados(estadosFiltrados);

      // Normalizar transacciones por rol
      const transacciones = resTR?.data || resTR?.resultado || [];
      const listaFormateada = transacciones.map((item) => ({
        ...item,
        fechaCreacionFormat: formatearFecha(item.fechaCreacion),
        fechaModificacionFormat: formatearFecha(item.fechaModificacion),
        activo: item.idEstado === 1,
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
      idTransaccionesxRol: 0,
      idRol: "",
      idTransaccion: "",
      idEstado: 1,
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
      idTransaccionesxRol: item.idTransaccionesxRol,
      idRol: item.idRol,
      idTransaccion: item.idTransaccion,
      idEstado: item.idEstado,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "idEstado" ? parseInt(value) : value,
    }));
  };
const handleGuardar = async () => {
  if (!form.idRol || !form.idTransaccion) {
    setFormError("Debe seleccionar Rol y Transacción.");
    return;
  }

  try {
    setFormLoading(true);
    const payload = {
      idRol: parseInt(form.idRol),
      idTransaccion: parseInt(form.idTransaccion),
      idEstado: form.idEstado,
    };

    let res;
    if (modoEdicion) {
      payload.idTransaccionesxRol = form.idTransaccionesxRol;
      res = await transaccionRolService.actualizarTransaccionPorRol(payload);
    } else {
      res = await transaccionRolService.insertarTransaccionPorRol(payload);
    }

    cerrarModal();

    // Interpretar resultado según API
    const numero = res?.numero;
    const mensaje = res?.mensaje || res?.message || "Operación realizada.";
    const exito = typeof numero === "number" ? numero > 0 : (res?.success ?? true);

    await Swal.fire({
      icon: exito ? "success" : "error",
      title: exito ? "Éxito" : "Error",
      text: mensaje,
      confirmButtonColor: exito ? "#3085d6" : "#d33",
    });

    if (exito) cargarDatos();
  } catch (error) {
    cerrarModal();

  // error aquí puede ser objeto { numero: -1, mensaje: "ERROR: ..." }
  // o un error genérico
  let mensajeError = "Error inesperado";

  if (error && typeof error === "object") {
    if ("mensaje" in error) {
      mensajeError = error.mensaje;
    } else if ("message" in error) {
      mensajeError = error.message;
    }
  } else if (typeof error === "string") {
    mensajeError = error;
  }

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
  const filtrados = datos.filter(
    (t) =>
      t.descripcion?.toLowerCase().includes(busquedaLower) ||
      t.nombreRol?.toLowerCase().includes(busquedaLower)
  );

  const activos = filtrados.filter((t) => t.activo).length;
  const inactivos = filtrados.length - activos;

  const columnas = [
    { key: "idTransaccionesxRol", label: "ID", className: "text-center w-12" },
    { key: "descripcion", label: "Transacción" },
    { key: "nombreRol", label: "Rol" },
    { key: "nombreCreador", label: "Creador" },
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "nombreModificador", label: "Modificador" },
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
          {isCollapsed ? "►" : "▼"} Transacciones por Rol
        </h2>
      </div>

      {!isCollapsed && (
        <>
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
        </>
      )}

      <ModalBase
        isOpen={modalOpen}
        onClose={cerrarModal}
        titulo={modoEdicion ? "Editar Transacción-Rol" : "Nueva Transacción-Rol"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Transacción por Rol"
        >
          <div className="space-y-4">
            <label className={`${texto}`}>Transacción:</label>
            <select
              name="idTransaccion"
              value={form.idTransaccion}
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

            <label className={`${texto}`}>Rol:</label>
            <select
              name="idRol"
              value={form.idRol}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <option value="">-- Seleccione --</option>
              {roles.map((r) => (
                <option key={r.idRol} value={r.idRol}>
                  {r.nombreRol}
                </option>
              ))}
            </select>

            <label className={`${texto}`}>Estado:</label>
            <select
              name="idEstado"
              value={form.idEstado}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <option value="">-- Seleccione --</option>
              {estados.map((e) => (
                <option key={e.iD_Estado} value={e.iD_Estado}>
                  {e.nombre_Estado}
                </option>
              ))}
            </select>
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default TransaccionesRoles;
