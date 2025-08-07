import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import tipoCatalogoService from "../../services/TipoCatalogo";
import usuarioService from "../../services/Usuario"; // Asegúrate de tener este servicio

import TablaBase from "../Shared/TablaBase";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import ContadoresBase from "../Shared/Contadores";

const TipoCatalogo = ({busqueda=''}) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

 
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    idTipoCatalogo: 0,
    nombreTipoCatalogo: "",
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

  const cargarUsuarios = async () => {
    try {
      const res = await usuarioService.listarUsuario();
      return res?.data || [];
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      return [];
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resTipos, usuariosCargados] = await Promise.all([
        tipoCatalogoService.listarTiposCatalogo(),
        cargarUsuarios(),
      ]);

      setUsuarios(usuariosCargados);

      const tipos = resTipos?.data || [];

      const datosFormateados = tipos.map((t) => {
        const creador = usuariosCargados.find((u) => u.id_Usuario === t.idCreador)?.usuario || "-";
        const modificador = usuariosCargados.find((u) => u.id_Usuario === t.idModificador)?.usuario || "-";

        return {
          ...t,
          fechaCreacionFormat: formatearFecha(t.fechaCreacion),
          fechaModificacionFormat: formatearFecha(t.fechaModificacion),
          activo: t.activo ?? true,
          creador,
          modificador,
        };
      });

      setDatos(datosFormateados);
    } catch (err) {
      console.error("Error al cargar tipos de catálogo:", err);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  

  const abrirModalNuevo = () => {
    setForm({
      idTipoCatalogo: 0,
      nombreTipoCatalogo: "",
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
      idTipoCatalogo: item.idTipoCatalogo,
      nombreTipoCatalogo: item.nombreTipoCatalogo,
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
    if (!form.nombreTipoCatalogo.trim()) {
      setFormError("El nombre del tipo de catálogo es requerido.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        idTipoCatalogo: form.idTipoCatalogo,
        nombreTipoCatalogo: form.nombreTipoCatalogo.trim(),
        activo: form.activo,
      };

      const res = modoEdicion
        ? await tipoCatalogoService.actualizarTipoCatalogo(payload)
        : await tipoCatalogoService.insertarTipoCatalogo(payload);

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

  const busquedaLower = busqueda.toLowerCase();
  const filtrados = datos.filter((d) =>
    (d.nombreTipoCatalogo || "").toLowerCase().includes(busquedaLower)
  );

  const totalPaginas = Math.ceil(filtrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = filtrados.slice(indexPrimera, indexUltima);

  const activos = filtrados.filter((d) => d.activo).length;
  const inactivos = filtrados.length - activos;

  const columnas = [
    { key: "idTipoCatalogo", label: "ID", className: "text-center w-12" },
    { key: "nombreTipoCatalogo", label: "Nombre" },
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
        Tipos de Catálogo
      </h2>

      <ContadoresBase
        activos={activos}
        inactivos={inactivos}
        total={filtrados.length}
        onNuevo={abrirModalNuevo}
        modoOscuro={modoOscuro}
      />

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
            modoOscuro
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
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

      {/* Paginación */}
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
          onClick={() =>
            setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))
          }
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
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Tipo de Catálogo"
        >
          <div className="space-y-4">
            <label className={`${texto} font-semibold`}>Nombre del Tipo:</label>
            <input
              type="text"
              name="nombreTipoCatalogo"
              value={form.nombreTipoCatalogo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded ${
                modoOscuro
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
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

export default TipoCatalogo;
