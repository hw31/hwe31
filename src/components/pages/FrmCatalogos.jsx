import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";

import catalogoService from "../../services/Catalogos";
import tipoCatalogoService from "../../services/TipoCatalogo";
import usuarioService from "../../services/Usuario";
import BuscadorBase from "../Shared/BuscadorBase";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";

const FrmCatalogosUnificado = () => {
  const { idUsuario } = useSelector((state) => state.auth.usuario);
  const { modoOscuro } = useSelector((state) => state.theme);

  const [catalogos, setCatalogos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [formData, setFormData] = useState({
    idTipo: 0,
    nombreTipoCatalogo: "",
    activoTipo: true,

    idCatalogo: 0,
    descripcionCatalogo: "",
    activoCatalogo: true,
    idTipoSeleccionado: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resTipos, resCatalogos, resUsuarios] = await Promise.all([
        tipoCatalogoService.listarTiposCatalogo(),
        catalogoService.listarCatalogo(),
        usuarioService.listarUsuario(),
      ]);
      setTipos(resTipos.data || []);
      setCatalogos(resCatalogos.resultado || []);
      setUsuarios(resUsuarios.data || []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  };

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

  const obtenerNombreUsuario = (usuarioId) =>
    usuarios.find((u) => u.id_Usuario === usuarioId)?.persona?.trim() || "ND";

  // Datos unificados y filtrados por búsqueda
  const dataUnificada = catalogos
    .map((c) => {
      const tipo = tipos.find((t) => t.idTipoCatalogo === c.idTipoCatalogo);
      return {
        idCatalogo: c.idCatalogo,
        descripcionCatalogo: c.descripcionCatalogo,
        activoCatalogo: c.activo,
        creadoPorCatalogo: c.creador || obtenerNombreUsuario(c.idCreador),
        modificadoPorCatalogo: c.modificador || obtenerNombreUsuario(c.idModificador),
        fechaCreacionCatalogo: formatearFecha(c.fechaCreacion),
        fechaModificacionCatalogo: formatearFecha(c.fechaModificacion),

        idTipo: tipo?.idTipoCatalogo || 0,
        nombreTipoCatalogo: tipo?.nombreTipoCatalogo || "ND",
        activoTipo: tipo?.activo ?? true,
        creadoPorTipo: obtenerNombreUsuario(tipo?.idCreador),
        modificadoPorTipo: obtenerNombreUsuario(tipo?.idModificador),
        fechaCreacionTipo: formatearFecha(tipo?.fechaCreacion),
        fechaModificacionTipo: formatearFecha(tipo?.fechaModificacion),
      };
    })
    .filter(
      (item) =>
        item.descripcionCatalogo.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.nombreTipoCatalogo.toLowerCase().includes(busqueda.toLowerCase())
    );

  // Controlar paginación: calcular slice
  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados = dataUnificada.slice(indexPrimeraFila, indexUltimaFila);
  const totalPaginas = Math.ceil(dataUnificada.length / filasPorPagina);

  // Resetear página actual cuando cambia búsqueda o filas por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  const resetForm = () => {
    setFormData({
      idTipo: 0,
      nombreTipoCatalogo: "",
      activoTipo: true,
      idCatalogo: 0,
      descripcionCatalogo: "",
      activoCatalogo: true,
      idTipoSeleccionado: 0,
    });
  };

  const handleEditar = (item) => {
    setFormData({
      idTipo: item.idTipo,
      nombreTipoCatalogo: item.nombreTipoCatalogo,
      activoTipo: item.activoTipo,
      idCatalogo: item.idCatalogo,
      descripcionCatalogo: item.descripcionCatalogo,
      activoCatalogo: item.activoCatalogo,
      idTipoSeleccionado: item.idTipo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleAgregar = () => {
    resetForm();
    setModoEdicion(false);
    setModalOpen(true);
  };

  const handleGuardarTipo = async () => {
    if (!formData.nombreTipoCatalogo.trim()) {
      Swal.fire("Error", "El nombre del tipo es obligatorio", "warning");
      return;
    }

    try {
      const now = new Date();
      const tipoObj = {
        idTipoCatalogo: formData.idTipo,
        nombreTipoCatalogo: formData.nombreTipoCatalogo.trim(),
        activo: formData.activoTipo,
        id_Creador: modoEdicion ? undefined : idUsuario,
        fecha_Creacion: modoEdicion ? undefined : now,
        id_Modificador: modoEdicion ? idUsuario : undefined,
        fecha_Modificacion: modoEdicion ? now : undefined,
      };

      if (modoEdicion) {
        await tipoCatalogoService.actualizarTipoCatalogo(tipoObj);

        // Actualizar catálogos relacionados para que tengan mismo estado activo/inactivo que el tipo
        const relacionados = catalogos.filter(
          (c) => c.idTipoCatalogo === formData.idTipo && c.activo !== formData.activoTipo
        );

        for (const c of relacionados) {
          await catalogoService.actualizarCatalogo({
            ...c,
            activo: formData.activoTipo,
            id_Modificador: idUsuario,
            fecha_Modificacion: now,
          });
        }

        Swal.fire("Éxito", "Tipo actualizado correctamente", "success");
      } else {
        await tipoCatalogoService.insertarTipoCatalogo(tipoObj);
        Swal.fire("Éxito", "Tipo creado correctamente", "success");
      }
      cargarDatos();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar el tipo", "error");
    }
  };

  const handleGuardarCatalogo = async () => {
    if (!formData.descripcionCatalogo.trim()) {
      Swal.fire("Error", "La descripción del catálogo es obligatoria", "warning");
      return;
    }
    if (!formData.idTipoSeleccionado || formData.idTipoSeleccionado === 0) {
      Swal.fire("Error", "Debe seleccionar un tipo válido", "warning");
      return;
    }

    try {
      const now = new Date();
      const catObj = {
        idCatalogo: formData.idCatalogo,
        descripcionCatalogo: formData.descripcionCatalogo.trim(),
        idTipoCatalogo: formData.idTipoSeleccionado,
        activo: formData.activoCatalogo,
        id_Creador: modoEdicion ? undefined : idUsuario,
        fecha_Creacion: modoEdicion ? undefined : now,
        id_Modificador: modoEdicion ? idUsuario : undefined,
        fecha_Modificacion: modoEdicion ? now : undefined,
      };

      if (modoEdicion) {
        await catalogoService.actualizarCatalogo(catObj);
        Swal.fire("Éxito", "Catálogo actualizado correctamente", "success");
      } else {
        await catalogoService.insertarCatalogo(catObj);
        Swal.fire("Éxito", "Catálogo creado correctamente", "success");
      }
      cargarDatos();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar catálogo", "error");
    }
  };

  // Estilos modo oscuro
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-900";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900";
  const inputClass =
    "w-full px-3 py-2 border rounded focus:outline-none " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600");

  const selectClass =
    "w-full px-3 py-2 border rounded focus:outline-none " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600");

  // Estilos para el botón Nuevo
  const estiloBotonNuevo = {
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
  };

  const onMouseEnterBoton = (e) => (e.currentTarget.style.backgroundColor = "#115293");
  const onMouseLeaveBoton = (e) => (e.currentTarget.style.backgroundColor = "#1976d2");

 return (
    <div className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${fondo} ${texto}`}>
    <div
      className={`w-full max-w-[900px] px-4 rounded-2xl shadow-md p-6 ${
        modoOscuro
          ? "bg-gray-900 text-white shadow-gray-700"
          : "bg-white text-gray-900 shadow-gray-300"
      }`}
    >
  <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">Catálogos</h2>
        <BuscadorBase
          placeholder="Buscar por descripción o tipo"
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
         />
     <ContadoresBase
          activos={catalogos.filter((c) => c.activo === true).length}
          inactivos={catalogos.filter((c) => c.activo === false).length}
          total={catalogos.length}
          onNuevo={handleAgregar}
          modoOscuro={modoOscuro}
        />

     <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
  <label htmlFor="filasPorPagina" className="font-semibold">
    Filas por página:
  </label>
  <select
    id="filasPorPagina"
    value={filasPorPagina}
    onChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
    className={selectClass + " text-sm py-1 px-2"}
    style={{ maxWidth: "5rem" }}
  >
    {[10, 30, 45, 60, 100].map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}
  </select>
</div>
      <div className="overflow-x-auto w-full mt-4">
        <div className="min-w-[700px]">
          <TablaBase
            datos={datosPaginados}
            columnas={[
              { key: "descripcionCatalogo", label: "Catálogo" },
              { key: "nombreTipoCatalogo", label: "Tipo" },
              { key: "creadoPorCatalogo", label: "Creado por (Catálogo)" },
              { key: "modificadoPorCatalogo", label: "Modificado por (Catálogo)" },
              { key: "fechaCreacionCatalogo", label: "Fecha creación catálogo" },
              { key: "fechaModificacionCatalogo", label: "Fecha modif catálogo" },
              {
                key: "activoCatalogo",
                label: "Activo",
                render: (item) =>
                  item.activoCatalogo ? (
                    <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                  ) : (
                    <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                  ),
              },
            ]}
            onEditar={handleEditar}
            modoOscuro={modoOscuro}
            encabezadoClase={encabezado}
            texto={texto}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
          className={`px-4 py-2 rounded ${
            paginaActual === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Anterior
        </button>

        <div className="text-lg font-semibold">
          Página {paginaActual} de {totalPaginas}
        </div>

        <button
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
          className={`px-4 py-2 rounded ${
            paginaActual === totalPaginas || totalPaginas === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Siguiente
        </button>
      </div>

      <ModalBase isOpen={modalOpen} onClose={() => setModalOpen(false)} modoOscuro={modoOscuro}>
        <div className="space-y-6 w-full max-w-md mx-auto px-2 sm:px-0">
          <FormularioBase
            titulo="Tipo de Catálogo"
            modoEdicion={modoEdicion}
            onCancel={() => setModalOpen(false)}
            onSubmit={handleGuardarTipo}
            modoOscuro={modoOscuro}
          >
            <input
              type="text"
              value={formData.nombreTipoCatalogo}
              onChange={(e) => setFormData({ ...formData, nombreTipoCatalogo: e.target.value })}
              placeholder="Nombre del tipo"
              className={`${selectClass} mb-4 w-full`}
              autoFocus
            />
            <select
              value={formData.activoTipo.toString()}
              onChange={(e) =>
                setFormData({ ...formData, activoTipo: e.target.value === "true" })
              }
              className={`${selectClass} mb-4 w-full`}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </FormularioBase>

          <FormularioBase
            titulo="Catálogo"
            modoEdicion={modoEdicion}
            onCancel={() => setModalOpen(false)}
            onSubmit={handleGuardarCatalogo}
            modoOscuro={modoOscuro}
          >
            <input
              type="text"
              value={formData.descripcionCatalogo}
              onChange={(e) =>
                setFormData({ ...formData, descripcionCatalogo: e.target.value })
              }
              placeholder="Descripción del catálogo"
              className={`${selectClass} mb-4 w-full`}
            />
            <select
              value={formData.activoCatalogo.toString()}
              onChange={(e) =>
                setFormData({ ...formData, activoCatalogo: e.target.value === "true" })
              }
              className={`${selectClass} mb-4 w-full`}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
            <select
              value={formData.idTipoSeleccionado}
              onChange={(e) =>
                setFormData({ ...formData, idTipoSeleccionado: parseInt(e.target.value) })
              }
              className={`${selectClass} mb-4 w-full`}
            >
              <option value={0}>Seleccione un tipo</option>
              {tipos.map((t) => (
                <option key={t.idTipoCatalogo} value={t.idTipoCatalogo}>
                  {t.nombreTipoCatalogo}
                </option>
              ))}
            </select>
          </FormularioBase>
        </div>
      </ModalBase>
    </div>
    </div>
  );
};

export default FrmCatalogosUnificado;
