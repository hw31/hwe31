import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import tipoCalificacionService from "../../services/TipoCalificacion";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmTipoCalificacion = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const usuarioActual = useSelector((state) => state.auth.usuario);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [tipoCalificaciones, setTipoCalificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idTipoCalificacion: 0,
    nombre: "",
    valorMaximo: "",
    activo: true,
    creadoPor: "",
    modificadoPor: "",
    fechaCreacion: null,
    fechaModificacion: null,
  });

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

  const adaptarDatos = (datos) =>
    (datos || []).map((item) => ({
      idTipoCalificacion: item.idTipoCalificacion ?? 0,
      nombre: item.tipoCalificacionNombre ?? "",
      valorMaximo: item.valorMaximo ?? 0,
      activo: item.activo !== undefined ? item.activo : true,
      creadoPor: item.creador || "N/D",
      modificadoPor: item.modificador || "N/D",
      fechaCreacion: formatearFecha(item.fechaCreacion),
      fechaModificacion: formatearFecha(item.fechaModificacion),
    }));

  useEffect(() => {
    cargarTiposCalificacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTiposCalificacion = async () => {
    try {
      setLoading(true);
      const res = await tipoCalificacionService.listarTiposCalificacion();
      const datos = res.resultado ?? [];
      setTipoCalificaciones(adaptarDatos(datos));
      setPaginaActual(1); // Reinicia página al cargar
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los tipos de calificación", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "activo") {
      setForm({ ...form, activo: value === "Activo" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      idTipoCalificacion: 0,
      nombre: "",
      valorMaximo: "",
      activo: true,
      creadoPor: usuarioActual?.nombreUsuario || "UsuarioActual",
      modificadoPor: "",
      fechaCreacion: null,
      fechaModificacion: null,
    });
    setFormError("");
    setFormSuccess("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
    setFormSuccess("");
  };

  const handleEditar = (item) => {
    setForm({
      idTipoCalificacion: item.idTipoCalificacion,
      nombre: item.nombre,
      valorMaximo: item.valorMaximo.toString(),
      activo: item.activo,
      creadoPor: item.creadoPor || "N/D",
      modificadoPor: usuarioActual?.nombreUsuario || "UsuarioActual",
      fechaCreacion: item.fechaCreacion,
      fechaModificacion: item.fechaModificacion,
    });
    setFormError("");
    setFormSuccess("");
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setFormError("");
    setFormSuccess("");

    if (!form.nombre.trim()) return setFormError("El nombre es obligatorio");
    if (!form.valorMaximo || isNaN(Number(form.valorMaximo)))
      return setFormError("El valor máximo debe ser un número");

    try {
      setFormLoading(true);
      let res;

      if (modoEdicion) {
        const datos = {
          idTipoCalificacion: form.idTipoCalificacion,
          tipoCalificacionNombre: form.nombre.trim(),
          valorMaximo: Number(form.valorMaximo),
          activo: form.activo,
        };
        res = await tipoCalificacionService.actualizarTipoCalificacion(datos);
      } else {
        const datos = {
          tipoCalificacionNombre: form.nombre.trim(),
          valorMaximo: Number(form.valorMaximo),
          activo: form.activo,
        };
        res = await tipoCalificacionService.insertarTipoCalificacion(datos);
      }

      const mensajeLower = (res.mensaje || "").toLowerCase();
      const esExito =
        res.success === true ||
        (res.numero !== undefined && res.numero > 0) ||
        mensajeLower.includes("correctamente") ||
        mensajeLower.includes("exitosamente");

      if (esExito) {
        setFormSuccess(
          modoEdicion
            ? "Tipo de calificación actualizado correctamente"
            : "Tipo de calificación insertado correctamente"
        );
        setFormLoading(false);

        cerrarModal(); // Cerrar modal ANTES de mostrar Swal

        await Swal.fire({
          icon: "success",
          title: "Éxito",
          text:
            res.mensaje ||
            (modoEdicion
              ? "Tipo de calificación actualizado correctamente"
              : "Tipo de calificación insertado correctamente"),
          confirmButtonColor: "#3085d6",
        });

        cargarTiposCalificacion();
      } else {
        setFormLoading(false);
        await Swal.fire("Error", res.mensaje || "Error desconocido", "error");
      }
    } catch (error) {
      cerrarModal();
      setFormLoading(false);
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Hubo un problema al guardar";
      await Swal.fire("Error", mensajeError, "error");
    }
  };

  // Filtrado
  const datosFiltrados = tipoCalificaciones.filter((item) =>
    (item.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación: calcular datos a mostrar
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const indiceFin = indiceInicio + filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indiceInicio, indiceFin);

  // Columnas para tabla
  const columnas = [
    { key: "nombre", label: "Nombre" },
    {
      key: "valorMaximo",
      label: "Valor Máximo",
      render: (item) => <div className="text-center font-medium">{item.valorMaximo}</div>,
    },
    { key: "creadoPor", label: "Creado Por" },
    { key: "modificadoPor", label: "Modificado Por" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    {
      key: "activo",
      label: "Estado",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Activo
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Inactivo
          </span>
        ),
    },
  ];

  return (
  <div className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${fondo} ${texto}`}>
    <div
      className={`w-full max-w-[900px] px-4 rounded-2xl shadow-md p-6 ${
        modoOscuro
          ? "bg-gray-900 text-white shadow-gray-700"
          : "bg-white text-gray-900 shadow-gray-300"
      }`}
      style={{ minHeight: "80vh" }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">
        Gestión de Tipos de Calificación
      </h2>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1); // Reset página al cambiar búsqueda
          }}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={tipoCalificaciones.filter((r) => r.activo === true).length}
          inactivos={tipoCalificaciones.filter((r) => r.activo === false).length}
          total={tipoCalificaciones.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        {/* Contenedor para select filas por página con margen inferior */}
        <div className="mt-4 mb-4 flex items-center space-x-2">
          <label
            htmlFor="filasPorPagina"
            className={modoOscuro ? "text-gray-200" : "text-gray-700"}
          >
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            className="border rounded px-2 py-1"
            value={filasPorPagina}
            onChange={(e) => {
              setFilasPorPagina(Number(e.target.value));
              setPaginaActual(1); // Reiniciar página al cambiar filas
            }}
          >
            {[5, 10, 30, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla con margen inferior para separar de paginación */}
        <div className="mb-6">
          <TablaBase
            datos={datosPaginados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            onEditar={handleEditar}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
          />
        </div>

        {/* Controles de paginación con margen arriba */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className={`px-3 py-1 rounded ${
              paginaActual === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Anterior
          </button>

          <span
            className={`flex-grow text-center ${
              modoOscuro ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Página {paginaActual} de {totalPaginas || 1}
          </span>

          <button
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            className={`px-3 py-1 rounded ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Siguiente
          </button>
        </div>

        <ModalBase
          isOpen={modalOpen}
          onClose={cerrarModal}
          titulo={modoEdicion ? "Editar Tipo Calificación" : "Nuevo Tipo Calificación"}
          modoOscuro={modoOscuro}
        >
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            formSuccess={formSuccess}
            modoEdicion={modoEdicion}
            titulo="Tipo Calificación"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del tipo de calificación"
                value={form.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                autoFocus
              />
              <input
                type="number"
                name="valorMaximo"
                placeholder="Valor máximo"
                value={form.valorMaximo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <select
                name="activo"
                value={form.activo ? "Activo" : "Inactivo"}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </FormularioBase>
        </ModalBase>
      </div>
    </div>
  );
};

export default FrmTipoCalificacion;
