import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import catalogoService from "../../services/Catalogos";
import tipoCatalogoService from "../../services/TipoCatalogo";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const Catalogo = ({busqueda=''}) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [datos, setDatos] = useState([]);
  const [tiposCatalogo, setTiposCatalogo] = useState([]);

  const [loading, setLoading] = useState(false);

 
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    idCatalogo: 0,
    idTipoCatalogo: "",
    descripcionCatalogo: "",
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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCatalogo, resTipos] = await Promise.all([
        catalogoService.listarCatalogo(),
        tipoCatalogoService.listarTiposCatalogo(),
      ]);

      const tiposActivos = (resTipos?.data || []).filter((t) => t.activo);
      setTiposCatalogo(tiposActivos);

      const datosCatalogo = (resCatalogo?.resultado || []).map((c) => {
        const tipo = tiposActivos.find((t) => t.idTipoCatalogo === c.idTipoCatalogo);
        return {
          ...c,
          nombreTipoCatalogo: tipo?.nombreTipoCatalogo || "-",
          fechaCreacionFormat: formatearFecha(c.fechaCreacion),
          fechaModificacionFormat: formatearFecha(c.fechaModificacion),
          activo: c.activo ?? true,
        };
      });

      setDatos(datosCatalogo);
      setFormError("");
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setDatos([]);
      setFormError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const busquedaLower = busqueda.toLowerCase();
  const filtrados = datos.filter(
    (d) =>
      (d.descripcionCatalogo || "").toLowerCase().includes(busquedaLower) ||
      (d.nombreTipoCatalogo || "").toLowerCase().includes(busquedaLower)
  );

  const totalPaginas = Math.ceil(filtrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = filtrados.slice(indexPrimera, indexUltima);

  const activos = filtrados.filter((d) => d.activo).length;
  const inactivos = filtrados.length - activos;

  const abrirModalNuevo = () => {
    setForm({
      idCatalogo: 0,
      idTipoCatalogo: "",
      descripcionCatalogo: "",
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
      idCatalogo: item.idCatalogo,
      idTipoCatalogo: item.idTipoCatalogo,
      descripcionCatalogo: item.descripcionCatalogo,
      activo: item.activo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setFormError("");
  };

  const handleGuardar = async () => {
    if (!form.idTipoCatalogo || !form.descripcionCatalogo.trim()) {
      setFormError("Debe completar los campos requeridos.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        idCatalogo: form.idCatalogo,
        idTipoCatalogo: parseInt(form.idTipoCatalogo),
        descripcionCatalogo: form.descripcionCatalogo.trim(),
        activo: form.activo,
      };

      let res;
      if (modoEdicion) {
        res = await catalogoService.actualizarCatalogo(payload);
      } else {
        res = await catalogoService.insertarCatalogo(payload);
      }

      cerrarModal();

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

  const columnas = [
    { key: "idCatalogo", label: "ID", className: "text-center w-12" },
    { key: "nombreTipoCatalogo", label: "Tipo de Catálogo" },
    { key: "descripcionCatalogo", label: "Descripción" },
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "fechaModificacionFormat", label: "Fecha Modificación" },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
    {
      key: "activo",
      label: "Activo",
      className: "text-center w-16",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold select-none">✔</span>
        ) : (
          <span className="text-red-500 font-semibold select-none">✘</span>
        ),
    },
  ];

  return (
      <div>
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left select-none">
        Catálogos
        </h2>       

        <ContadoresBase
          activos={activos}
          inactivos={inactivos}
          total={filtrados.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        {/* Select filas */}
        <div className="mb-2 flex justify-start items-center gap-2 text-sm">
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
            {[10, 30, 45, 60, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <TablaBase
          datos={datosPaginados}
          columnas={columnas}
          modoOscuro={modoOscuro}
          onEditar={cargarParaEditar}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
        />

        {/* Botones paginación */}
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

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={
              handleGuardar
            }
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Catálogo"
          >
            <div className="space-y-4">
              <label className={`${texto} font-semibold`}>Tipo de Catálogo:</label>
              <select
                name="idTipoCatalogo"
                value={form.idTipoCatalogo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <option value="">-- Seleccione --</option>
                {tiposCatalogo.map((t) => (
                  <option key={t.idTipoCatalogo} value={t.idTipoCatalogo}>
                    {t.nombreTipoCatalogo}
                  </option>
                ))}
              </select>

              <label className={`${texto} font-semibold`}>Descripción:</label>
              <input
                type="text"
                name="descripcionCatalogo"
                value={form.descripcionCatalogo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              />

              <label className={`${texto} font-semibold flex items-center gap-2`}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleInputChange}
                  className="mt-0"
                />
                Activo
              </label>
            </div>
          </FormularioBase>
        </ModalBase>
      </div>
    
  );
};

export default Catalogo;
