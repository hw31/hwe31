import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import estadoService from "../../services/Estado";
import usuarioService from "../../services/Usuario";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmEstados = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idEstado: 0,
    nombre: "",
    descripcion: "", // Activo / Inactivo
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

  const adaptarDatosEstados = (estadosData, usuarios) =>
    estadosData.map((e) => {
      const creador = usuarios.find((u) => u.id_Usuario === e.iD_Creador);
      const modificador = usuarios.find((u) => u.id_Usuario === e.iD_Modificador);
      return {
        idEstado: e.iD_Estado,
        nombre: e.nombre_Estado,
        activo: e.activo,
        fechaCreacion: formatearFecha(e.fecha_Creacion),
        fechaModificacion: formatearFecha(e.fecha_Modificacion),
        nombreCreador: creador ? creador.persona.trim() : "ND",
        nombreModificador: modificador ? modificador.persona.trim() : "ND",
      };
    });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resEstados, resUsuarios] = await Promise.all([
        estadoService.listarEstados(),
        usuarioService.listarUsuario(),
      ]);

      if (resEstados.success && resUsuarios.success) {
        setEstados(adaptarDatosEstados(resEstados.data, resUsuarios.data));
      } else {
        setEstados([]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setForm({ idEstado: 0, nombre: "", descripcion: "" });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (estado) => {
    setForm({
      idEstado: estado.idEstado,
      nombre: estado.nombre,
      descripcion: estado.activo ? "Activo" : "Inactivo",
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError("");
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return setFormError("El nombre es obligatorio");
    if (!form.descripcion) return setFormError("Debe seleccionar un estado");

    try {
      setFormLoading(true);
      const datos = {
        id_Estado: form.idEstado,
        nombre_Estado: form.nombre.trim(),
        activo: form.descripcion === "Activo",
      };

      let res;
      if (modoEdicion) {
        res = await estadoService.actualizarEstado(datos);
      } else {
        res = await estadoService.insertarEstado({
          nombreEstado: datos.nombre_Estado,
          activo: datos.activo,
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
        "Error al guardar el estado";
      await Swal.fire("Error", msg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const datosFiltrados = estados.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimera, indexUltima);

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "nombreCreador", label: "Creador" },
    { key: "nombreModificador", label: "Modificador" },
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
    <div className="mx-auto max-w-[900px] w-full rounded-2xl p-6">
      <div
        className={`w-full px-4 rounded-2xl shadow-md p-6 ${
          modoOscuro
            ? "bg-gray-900 text-white shadow-gray-700"
            : "bg-white text-gray-900 shadow-gray-300"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">
          Gestión de Estados
        </h2>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={estados.filter((e) => e.activo).length}
          inactivos={estados.filter((e) => !e.activo).length}
          total={estados.length}
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
          titulo="Estado"
        >
          <div className="mb-4">
            <label className="block font-semibold mb-1">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
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
            <label className="block font-semibold mb-1">Estado:</label>
            <select
              name="descripcion"
              value={form.descripcion}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded border ${
                modoOscuro
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option value="">Seleccione</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default FrmEstados;
