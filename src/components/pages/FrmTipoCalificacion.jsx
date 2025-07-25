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
  const [form, setForm] = useState({
    idTipoCalificacion: 0,
    nombre: "",
    valorMaximo: "",
    activo: true,
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
    fechaCreacion: formatearFecha(item.fechaCreacion),
    fechaModificacion: formatearFecha(item.fechaModificacion),
  }));

  useEffect(() => {
    cargarTiposCalificacion();
  }, []);

  const cargarTiposCalificacion = async () => {
    try {
      setLoading(true);
      const res = await tipoCalificacionService.listarTiposCalificacion();
      const datos = res.resultado ?? [];
      setTipoCalificaciones(adaptarDatos(datos));
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
    setForm({ idTipoCalificacion: 0, nombre: "", valorMaximo: "", activo: true });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (item) => {
    setForm({
      idTipoCalificacion: item.idTipoCalificacion,
      nombre: item.nombre,
      valorMaximo: item.valorMaximo.toString(),
      activo: item.activo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setFormError("");

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

      if (res.success || (res.numero !== undefined && res.numero > 0)) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          modoEdicion
            ? "Tipo de calificación actualizado correctamente"
            : "Tipo de calificación insertado correctamente",
          "success"
        );
        cargarTiposCalificacion();
      } else {
        await Swal.fire("Error", res.mensaje || "Error desconocido", "error");
        setFormLoading(false);
      }
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Hubo un problema al guardar";
      await Swal.fire("Error", mensajeError, "error");
    }
  };

  const datosFiltrados = tipoCalificaciones.filter((item) =>
    (item.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

const columnas = [
  { key: "nombre", label: "Nombre" },
  {
    key: "valorMaximo",
    label: "Valor Máximo",
    render: (item) => (
      <div className="text-center font-medium">{item.valorMaximo}</div>
    ),
  },
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
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
  ];

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
            Gestión de Tipos de Calificación
          </h2>
        </div>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={tipoCalificaciones.filter((r) => r.activo === true).length}
          inactivos={tipoCalificaciones.filter((r) => r.activo === false).length}
          total={tipoCalificaciones.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />
 {/* Contenedor para aplicar estilos solo a esta tabla */}
<div className="tipocalificacion-table-container">
  <style>{`
    .tipocalificacion-table-container table th,
    .tipocalificacion-table-container table td {
      padding-left: 6px !important;
      padding-right: 6px !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tipocalificacion-table-container table th:nth-child(1),
    .tipocalificacion-table-container table td:nth-child(1) {
      max-width: 150px;
      width: 150px;
    }
    .tipocalificacion-table-container table th:nth-child(2),
    .tipocalificacion-table-container table td:nth-child(2) {
      text-align: center;
      max-width: 150px;
      width: 150px;
    }
  `}</style>

  <TablaBase
    datos={datosFiltrados}
    columnas={columnas}
    modoOscuro={modoOscuro}
    onEditar={handleEditar}
    loading={loading}
    texto={texto}
    encabezadoClase={encabezado}
  />
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