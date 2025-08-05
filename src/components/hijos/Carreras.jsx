import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

import carreraService from "../../services/Carreras";

const FrmCarreras = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  const [carreras, setCarreras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idCarrera: 0,
    nombreCarrera: "",
    codigoCarrera: "",
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [filasPorPagina, busqueda]);

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

  const adaptarDatosCarreras = (data) =>
    data.map((c) => ({
      idCarrera: c.iD_Carrera,
      nombreCarrera: c.nombreCarrera,
      codigoCarrera: c.codigoCarrera,
      activo: c.activo,
      fechaCreacion: formatearFecha(c.fecha_Creacion),
      fechaModificacion: formatearFecha(c.fecha_Modificacion),
      creador: c.creador || "ND",
      modificador: c.modificador || "ND",
    }));

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await carreraService.listarCarreras();
      if (res && Array.isArray(res)) {
        setCarreras(adaptarDatosCarreras(res));
      } else {
        setCarreras([]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las carreras", "error");
      setCarreras([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({
      idCarrera: 0,
      nombreCarrera: "",
      codigoCarrera: "",
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

  const handleEditar = (carrera) => {
    setForm({
      idCarrera: carrera.idCarrera,
      nombreCarrera: carrera.nombreCarrera,
      codigoCarrera: carrera.codigoCarrera,
      activo: carrera.activo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const handleGuardar = async () => {
    if (!form.nombreCarrera.trim())
      return setFormError("El nombre de la carrera es obligatorio");
    if (!form.codigoCarrera.trim())
      return setFormError("El código de la carrera es obligatorio");

    try {
      setFormLoading(true);
      let res;
      if (modoEdicion) {
        res = await carreraService.actualizarCarrera({
          idCarrera: form.idCarrera,
          nombreCarrera: form.nombreCarrera.trim(),
          codigoCarrera: form.codigoCarrera.trim(),
          activo: form.activo,
        });
      } else {
        res = await carreraService.insertarCarrera({
          nombreCarrera: form.nombreCarrera.trim(),
          codigoCarrera: form.codigoCarrera.trim(),
          activo: form.activo,
        });
      }

      const mensaje = res?.mensaje || "";
      const success =
        res?.numero > 0 ||
        res?.success ||
        /(correctamente|exitosamente)/i.test(mensaje);

      if (success) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          mensaje || "Operación exitosa",
          "success"
        );
        cargarDatos();
      } else {
        cerrarModal();
        await Swal.fire("Error", mensaje || "Error desconocido", "error");
      }
    } catch (error) {
      cerrarModal();
      const msg =
        error.response?.data?.mensaje ||
        error.message ||
        "Error al guardar la carrera";
      await Swal.fire("Error", msg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const datosFiltrados = carreras.filter(
    (c) =>
      c.nombreCarrera.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigoCarrera.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimera, indexUltima);

  const columnas = [
    { key: "nombreCarrera", label: "Nombre Carrera" },
    { key: "codigoCarrera", label: "Código" },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    {
      key: "activo",
      label: "Estado",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold">✔ Activo</span>
        ) : (
          <span className="text-red-500 font-semibold">✘ Inactivo</span>
        ),
    },
  ];

  return (
    <div
      className={`mx-auto rounded-2xl p-6 max-w-[900px] w-full ${
        modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-5xl mx-auto rounded-2xl shadow-md p-6 ${
          modoOscuro
            ? "bg-gray-900 shadow-gray-700"
            : "bg-white shadow-gray-300"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">
         Carreras
        </h2>

        <BuscadorBase
          placeholder="Buscar por nombre o código..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={carreras.filter((c) => c.activo).length}
          inactivos={carreras.filter((c) => !c.activo).length}
          total={carreras.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
          <label htmlFor="filasPorPagina" className="font-semibold">
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            value={filasPorPagina}
            onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
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
          onEditar={handleEditar}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
        />

        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Anterior
          </button>
          <span className="font-semibold">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() =>
              setPaginaActual((p) =>
                p < totalPaginas ? p + 1 : totalPaginas
              )
            }
            className={`rounded px-4 py-2 text-white ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>

      <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Carrera"
        >
          <div className="mb-4">
            <label className="block font-semibold mb-1">Nombre de la Carrera:</label>
            <input
              type="text"
              name="nombreCarrera"
              value={form.nombreCarrera}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded border ${
                modoOscuro
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Código de la Carrera:</label>
            <input
              type="text"
              name="codigoCarrera"
              value={form.codigoCarrera}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded border ${
                modoOscuro
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleInputChange}
              id="activo"
              className={`rounded border ${
                modoOscuro ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
              }`}
            />
            <label htmlFor="activo" className="font-semibold select-none">
              Activo
            </label>
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default FrmCarreras;
