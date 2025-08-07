// Código completo con autocompletado para Tipo de Transacción y paginación
import React, { useState, useEffect, useRef } from "react";
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
  const [filtroTransaccion, setFiltroTransaccion] = useState("");
  const [mostrarDropdownTransaccion, setMostrarDropdownTransaccion] = useState(false);
  const inputTransaccionRef = useRef(null);

  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

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

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (inputTransaccionRef.current && !inputTransaccionRef.current.contains(e.target)) {
        setMostrarDropdownTransaccion(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const abrirModalNuevo = () => {
    setForm({ idTransaccionPermiso: 0, idTipoTransaccion: "", idPermiso: "", activo: true });
    setFiltroTransaccion("");
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
    setFiltroTransaccion(
      tiposTransaccion.find((t) => t.idTipoTransaccion === item.idTipoTransaccion)?.descripcion || ""
    );
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

  const totalPaginas = Math.ceil(filtrados.length / filasPorPagina);
  const inicio = (paginaActual - 1) * filasPorPagina;
  const paginados = filtrados.slice(inicio, inicio + filasPorPagina);

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
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide ${modoOscuro ? "text-white" : "text-gray-800"}`}>
          Transaccion Usuario
        </h2>
      </div>

        <div>
          <ContadoresBase
            activos={activos}
            inactivos={inactivos}
            total={filtrados.length}
            modoOscuro={modoOscuro}
            onNuevo={abrirModalNuevo}
          />
           {/* SELECT FILAS */}
          <div className="mb-2 flex justify-start items-center gap-2 text-sm mt-4">
            <label htmlFor="filasPorPagina" className="font-semibold select-none">
              Filas por página:
            </label>
            <select
              id="filasPorPagina"
              value={filasPorPagina}
              onChange={(e) => {
                setFilasPorPagina(parseInt(e.target.value));
                setPaginaActual(1);
              }}
              className={`w-[5rem] px-3 py-1 rounded border ${
                modoOscuro ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              {[1, 10, 30, 45, 60, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <TablaBase
            datos={paginados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
            onEditar={cargarParaEditar}
          />

          {/* BOTONES SIGUIENTES */}
          <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              className={`rounded px-4 py-2 text-white ${
                paginaActual === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              Anterior
            </button>
            <span className="font-semibold select-none">
              Página {paginaActual} de {totalPaginas || 1}
            </span>
            <button
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              onClick={() => setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))}
              className={`rounded px-4 py-2 text-white ${
                paginaActual === totalPaginas || totalPaginas === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              Siguiente
            </button>
          </div>
        </div>
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
            <div className="relative" ref={inputTransaccionRef}>
              <input
                type="text"
                value={
                  filtroTransaccion ||
                  tiposTransaccion.find((t) => t.idTipoTransaccion === parseInt(form.idTipoTransaccion))?.descripcion ||
                  ""
                }
                onChange={(e) => {
                  setFiltroTransaccion(e.target.value);
                  setMostrarDropdownTransaccion(true);
                }}
                onFocus={() => setMostrarDropdownTransaccion(true)}
                placeholder="Buscar tipo de transacción..."
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              />
              {mostrarDropdownTransaccion && (
                <ul
                  className={`absolute z-10 w-full max-h-40 overflow-auto border rounded mt-1 ${
                    modoOscuro ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  {tiposTransaccion
                    .filter((t) => t.descripcion.toLowerCase().includes(filtroTransaccion.toLowerCase()))
                    .map((t) => (
                      <li
                        key={t.idTipoTransaccion}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, idTipoTransaccion: t.idTipoTransaccion }));
                          setFiltroTransaccion(t.descripcion);
                          setMostrarDropdownTransaccion(false);
                        }}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-500 hover:text-white"
                      >
                        {t.descripcion}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <label className={`${texto}`}>Permiso:</label>
            <select
              name="idPermiso"
              value={form.idPermiso}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 border rounded ${
                modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
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
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </label>
          </div>
        </FormularioBase>
      </ModalBase>
   </>
  );
};

export default TransaccionesPermisos;
