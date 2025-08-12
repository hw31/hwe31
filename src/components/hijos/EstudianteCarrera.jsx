// IMPORTS
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import estudianteCarreraService from "../../services/EstudiantesCarreras";
import usuarioService from "../../services/Usuario";
import carreraService from "../../services/Carreras";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const EstudianteCarrera = ({ busqueda = "", onResultados }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [datos, setDatos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [estados, setEstados] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    iD_EstudianteCarrera: 0,
    iD_Usuario: "",
    iD_Carrera: "",
    fecha_Inicio: "",
    fecha_Fin: "",
    iD_Estado: "",
  });

  // Autocompletado
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [mostrarDropdownUsuario, setMostrarDropdownUsuario] = useState(false);
  const inputRefUsuario = useRef(null);
  const dropdownRefUsuario = useRef(null);

  const [busquedaCarrera, setBusquedaCarrera] = useState("");
  const [mostrarDropdownCarrera, setMostrarDropdownCarrera] = useState(false);
  const inputRefCarrera = useRef(null);
  const dropdownRefCarrera = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRefUsuario.current &&
        !inputRefUsuario.current.contains(e.target) &&
        dropdownRefUsuario.current &&
        !dropdownRefUsuario.current.contains(e.target)
      ) {
        setMostrarDropdownUsuario(false);
      }

      if (
        inputRefCarrera.current &&
        !inputRefCarrera.current.contains(e.target) &&
        dropdownRefCarrera.current &&
        !dropdownRefCarrera.current.contains(e.target)
      ) {
        setMostrarDropdownCarrera(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resEC, resUsuarios, resCarreras, resEstados] = await Promise.all([
        estudianteCarreraService.listarTodos(),
        usuarioService.listarUsuario(),
        carreraService.listarCarreras(),
        estadoService.listarEstados(),
      ]);

      setDatos(resEC || []);
      setUsuarios(resUsuarios?.data?.filter((u) => u.id_Estado === 1) || []);
      setCarreras(resCarreras?.resultado?.filter((c) => c.activo) || []);
      setEstados(resEstados?.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setForm({
      iD_EstudianteCarrera: 0,
      iD_Usuario: "",
      iD_Carrera: "",
      fecha_Inicio: "",
      fecha_Fin: "",
      iD_Estado: "",
    });
    setBusquedaUsuario("");
    setBusquedaCarrera("");
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setForm({
      iD_EstudianteCarrera: item.iD_EstudianteCarrera,
      iD_Usuario: item.iD_Usuario,
      iD_Carrera: item.iD_Carrera,
      fecha_Inicio: item.fecha_Inicio?.slice(0, 10),
      fecha_Fin: item.fecha_Fin?.slice(0, 10),
      iD_Estado: item.iD_Estado,
    });

    const usuario = usuarios.find((u) => u.id_Usuario === item.iD_Usuario);
    setBusquedaUsuario(usuario?.usuario || "");

    const carrera = carreras.find((c) => c.iD_Carrera === item.iD_Carrera);
    setBusquedaCarrera(carrera?.nombreCarrera || "");

    setFormError("");
    setModoEdicion(true);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("iD") ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    const { iD_Usuario, iD_Carrera, fecha_Inicio, fecha_Fin, iD_Estado } = form;
    if (!iD_Usuario || !iD_Carrera || !fecha_Inicio || !fecha_Fin || !iD_Estado) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    setFormLoading(true);
    try {
      const res = modoEdicion
        ? await estudianteCarreraService.actualizarEstudianteCarrera(form)
        : await estudianteCarreraService.insertarEstudianteCarrera(form);

      Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
      cerrarModal();
      cargarDatos();
    } catch (error) {
      cerrarModal();
      Swal.fire("Error", error.message || "Error en la operación", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Filtrado global de datos para la tabla, según busqueda (prop)
  const datosFiltrados = datos.filter((item) => {
    const usuarioMatch = item.usuario?.toLowerCase().includes(busqueda.toLowerCase());
    const carreraMatch = item.nombreCarrera?.toLowerCase().includes(busqueda.toLowerCase());
    return usuarioMatch || carreraMatch;
  });

  // Paginar sobre datos filtrados
  const datosPaginados = datosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const activos = datosFiltrados.filter((d) => d.iD_Estado === 1).length;

  // Autocompletados para modal (sin relación directa con la búsqueda global)
  const usuariosFiltrados = usuarios.filter((u) =>
    u.usuario.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );
  const carrerasFiltradas = carreras.filter((c) =>
    c.nombreCarrera.toLowerCase().includes(busquedaCarrera.toLowerCase())
  );

  // Avisar al padre si hay resultados en tabla filtrada
  useEffect(() => {
    if (typeof onResultados === "function") {
      onResultados(datosFiltrados.length > 0);
    }
  }, [datosFiltrados, onResultados]);

  // Si no hay resultados y no está cargando, no mostrar nada
  if (!loading && datosFiltrados.length === 0) {
    return null;
  }

  const columnas = [
    {
      key: "usuario",
      label: "Usuario",
      render: (item) => item.usuario || "-",
    },
    {
      key: "carrera",
      label: "Carrera",
      render: (item) => item.nombreCarrera || "-",
    },
    {
      key: "fechaInicio",
      label: "Inicio",
      render: (item) => formatearFecha(item.fecha_Inicio),
    },
    {
      key: "fechaFin",
      label: "Fin",
      render: (item) => formatearFecha(item.fecha_Fin),
    },
    {
      key: "estado",
      label: "Estado",
      className: "text-center",
      render: (item) =>
        item.iD_Estado === 1 ? (
          <FaCheckCircle className="text-green-500 mx-auto" />
        ) : (
          <FaTimesCircle className="text-red-500 mx-auto" />
        ),
    },
  ];

  return (
    <>
      <h2 className={`text-2xl font-bold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
        Estudiantes Carreras
      </h2>

      <ContadoresBase
        activos={activos}
        inactivos={datosFiltrados.length - activos}
        total={datosFiltrados.length}
        modoOscuro={modoOscuro}
        onNuevo={abrirModalNuevo}
      />

      <TablaBase
        datos={datosPaginados}
        columnas={columnas}
        modoOscuro={modoOscuro}
        loading={loading}
        onEditar={abrirModalEditar}
      />

      <div className="my-4 flex justify-between items-center text-sm">
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span className="font-semibold">
          Página {paginaActual} de {totalPaginas || 1}
        </span>
        <button
          onClick={() => setPaginaActual((prev) => (prev < totalPaginas ? prev + 1 : prev))}
          disabled={paginaActual === totalPaginas}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
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
          titulo={modoEdicion ? "Editar Estudiante-Carrera" : "Nuevo Estudiante-Carrera"}
        >
          <div className="space-y-4">
            {/* Autocompletado usuario */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                onFocus={() => setMostrarDropdownUsuario(true)}
                ref={inputRefUsuario}
                disabled={modoEdicion}
                className="w-full px-3 py-2 border rounded"
              />
              {mostrarDropdownUsuario && usuariosFiltrados.length > 0 && (
                <ul
                  ref={dropdownRefUsuario}
                  className="absolute z-10 w-full max-h-48 overflow-y-auto border rounded bg-white shadow"
                >
                  {usuariosFiltrados.map((u) => (
                    <li
                      key={u.id_Usuario}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, iD_Usuario: u.id_Usuario }));
                        setBusquedaUsuario(u.usuario);
                        setMostrarDropdownUsuario(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {u.usuario}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Autocompletado carrera */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar carrera..."
                value={busquedaCarrera}
                onChange={(e) => setBusquedaCarrera(e.target.value)}
                onFocus={() => setMostrarDropdownCarrera(true)}
                ref={inputRefCarrera}
                className="w-full px-3 py-2 border rounded"
              />
              {mostrarDropdownCarrera && carrerasFiltradas.length > 0 && (
                <ul
                  ref={dropdownRefCarrera}
                  className="absolute z-10 w-full max-h-48 overflow-y-auto border rounded bg-white shadow"
                >
                  {carrerasFiltradas.map((c) => (
                    <li
                      key={c.iD_Carrera}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, iD_Carrera: c.iD_Carrera }));
                        setBusquedaCarrera(c.nombreCarrera);
                        setMostrarDropdownCarrera(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {c.nombreCarrera}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fecha inicio */}
            <input
              type="date"
              name="fecha_Inicio"
              value={form.fecha_Inicio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />

            {/* Fecha fin */}
            <input
              type="date"
              name="fecha_Fin"
              value={form.fecha_Fin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />

            {/* Estado */}
            <select
              name="iD_Estado"
              value={form.iD_Estado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Seleccione Estado</option>
              {estados
                .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
                .map((e) => (
                  <option key={e.iD_Estado} value={e.iD_Estado}>
                    {e.nombre_Estado}
                  </option>
                ))}
            </select>
          </div>
        </FormularioBase>
      </ModalBase>
    </>
  );
};

export default EstudianteCarrera;
