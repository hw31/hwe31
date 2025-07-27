import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import catalogoService from "../../services/Catalogos";
import tipoCatalogoService from "../../services/TipoCatalogo";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const Catalogos = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-800" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [catalogos, setCatalogos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    idCatalogo: 0,
    descripcionCatalogo: "",
    idTipoCatalogo: 0,
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

  const adaptarTipos = (datos) =>
    datos.map((t) => ({
      idTipoCatalogo: t.idTipoCatalogo,
      nombre: t.nombreTipoCatalogo,
      activo: t.activo,
    }));

  const adaptarCatalogos = (datos) =>
    datos.map((c) => ({
      idCatalogo: c.idCatalogo || c.iD_Catalogo,
      descripcionCatalogo: c.descripcionCatalogo || c.descripcion_Catalogo || "",
      idTipoCatalogo: c.idTipoCatalogo || c.id_TipoCatalogo || 0,
      activo: c.activo === undefined ? true : c.activo,
      fechaCreacion: c.fechaCreacion || c.fecha_Creacion || null,
      fechaModificacion: c.fechaModificacion || c.fecha_Modificacion || null,
      creador: c.creador || c.nombre_Creador || "-",
      modificador: c.modificador || c.nombre_Modificador || "-",
    }));

  useEffect(() => {
    cargarTipos();
    cargarCatalogos();
  }, []);

  const cargarTipos = async () => {
    try {
      const res = await tipoCatalogoService.listarTiposCatalogo();
      if (res && res.success && Array.isArray(res.data)) {
        setTipos(adaptarTipos(res.data));
      } else {
        setTipos([]);
      }
    } catch {
      Swal.fire("Error", "No se pudieron cargar los tipos de catálogo", "error");
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoading(true);
      const res = await catalogoService.listarCatalogo();
      if (res && Array.isArray(res.resultado)) {
        setCatalogos(adaptarCatalogos(res.resultado));
      } else {
        setCatalogos([]);
      }
    } catch {
      Swal.fire("Error", "No se pudieron cargar los catálogos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "activo"
          ? value === "Activo"
          : name === "idTipoCatalogo"
          ? Number(value)
          : value,
    }));
  };

  const abrirModalNuevo = () => {
    setForm({ idCatalogo: 0, descripcionCatalogo: "", idTipoCatalogo: 0, activo: true });
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
      idCatalogo: item.idCatalogo,
      descripcionCatalogo: item.descripcionCatalogo,
      idTipoCatalogo: item.idTipoCatalogo,
      activo: item.activo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setFormError("");
    if (!form.descripcionCatalogo.trim()) return setFormError("La descripción es obligatoria");
    if (!form.idTipoCatalogo || form.idTipoCatalogo === 0)
      return setFormError("Seleccione un tipo de catálogo");

    try {
      setFormLoading(true);
      let res;
      if (modoEdicion) {
        res = await catalogoService.actualizarCatalogo({
          idCatalogo: form.idCatalogo,
          descripcionCatalogo: form.descripcionCatalogo.trim(),
          idTipoCatalogo: form.idTipoCatalogo,
          activo: form.activo,
        });
      } else {
        res = await catalogoService.insertarCatalogo({
          descripcionCatalogo: form.descripcionCatalogo.trim(),
          idTipoCatalogo: form.idTipoCatalogo,
          activo: form.activo,
        });
      }

      if ((res.numero === undefined && res.success) || (res.numero && res.numero > 0)) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          modoEdicion
            ? "Catálogo actualizado correctamente"
            : "Catálogo insertado correctamente",
          "success"
        );
        cargarCatalogos();
      } else {
        cerrarModal();
        await Swal.fire("Error", res.mensaje || "Error desconocido", "error");
        setFormLoading(false);
      }
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Hubo un problema al guardar el catálogo";
      await Swal.fire("Error", mensajeError, "error");
      setFormLoading(false);
    }
  };

  const busquedaLower = busqueda.toLowerCase();
  const catalogosFiltrados = catalogos.filter((c) => {
    const descOk = c.descripcionCatalogo?.toLowerCase().includes(busquedaLower);
    const tipo = tipos.find((t) => t.idTipoCatalogo === c.idTipoCatalogo);
    const tipoOk = tipo?.nombre?.toLowerCase().includes(busquedaLower);
    return descOk || tipoOk;
  });

  const activos = catalogosFiltrados.filter((c) => c.activo).length;
  const inactivos = catalogosFiltrados.filter((c) => !c.activo).length;

  const columnas = [
    { key: "idCatalogo", label: "ID", className: "text-center w-12" },
    { key: "descripcionCatalogo", label: "Descripción" },
    {
      key: "idTipoCatalogo",
      label: "Tipo",
      render: (item) => tipos.find((t) => t.idTipoCatalogo === item.idTipoCatalogo)?.nombre ?? "ND",
    },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (item) => formatearFecha(item.fechaCreacion),
    },
    {
      key: "fechaModificacion",
      label: "Fecha Modificación",
      render: (item) => formatearFecha(item.fechaModificacion),
    },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
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
    <div className="p-4">
      <div className={`shadow-lg rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide cursor-pointer select-none ${texto}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-controls="catalogosContent"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsCollapsed(!isCollapsed);
              }
            }}
          >
            {isCollapsed ? "►" : "▼"} Catálogos
          </h2>
        </div>

        {!isCollapsed && (
          <div id="catalogosContent">
            <ContadoresBase
              activos={activos}
              inactivos={inactivos}
              total={catalogosFiltrados.length}
              onNuevo={abrirModalNuevo}
              modoOscuro={modoOscuro}
            />

            <TablaBase
              datos={catalogosFiltrados}
              columnas={columnas}
              modoOscuro={modoOscuro}
              onEditar={handleEditar}
              loading={loading}
              texto={texto}
              encabezadoClase={encabezado}
            />
          </div>
        )}

        <ModalBase
          isOpen={modalOpen}
          onClose={cerrarModal}
          titulo={modoEdicion ? "Editar Catálogo" : "Nuevo Catálogo"}
          modoOscuro={modoOscuro}
        >
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Catálogo"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="descripcionCatalogo"
                placeholder="Descripción"
                value={form.descripcionCatalogo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                autoFocus
              />
              <select
                name="idTipoCatalogo"
                value={form.idTipoCatalogo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value={0}>Seleccione un tipo</option>
                {tipos.map((t) => (
                  <option key={t.idTipoCatalogo} value={t.idTipoCatalogo}>
                    {t.nombre}
                  </option>
                ))}
              </select>
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

export default Catalogos;
