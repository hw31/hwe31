import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import estudianteCarreraService from "../../services/EstudiantesCarreras";
import usuarioService from "../../services/Usuario";
import carreraService from "../../services/Carreras";
import estadoService from "../../services/Estado";
import catalogoService from "../../services/Catalogos";
import usuariosRolesService from "../../services/UsuariosRoles";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const EstudianteCarrera = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [datos, setDatos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [turnos, setTurnos] = useState([]);
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
    iD_Usuario: 0,
    iD_Carrera: 0,
    iD_Turno: 0,
    fecha_Inicio: "",
    fecha_Fin: "",
    iD_Estado: 0,
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
      const [
        resEC,
        resUsuariosRoles,
        resUsuarios,
        resCarreras,
        resEstados,
        resTurnos,
      ] = await Promise.all([
        estudianteCarreraService.listarTodos(),
        usuariosRolesService.listarUsuariosRoles(),
        usuarioService.listarUsuario(),
        carreraService.listarCarreras(),
        estadoService.listarEstados(),
        catalogoService.filtrarPorTipoCatalogo(10),
      ]);

      const usuariosConRol3Ids = resUsuariosRoles
        .filter((ur) => ur.iD_Rol === 3 && ur.id_Estado === 1)
        .map((ur) => ur.iD_Usuario);

      const usuariosEstudiantes = (resUsuarios?.data || []).filter(
        (u) =>
          usuariosConRol3Ids.includes(u.id_Usuario || u.iD_Usuario) &&
          ((u.id_Estado === 1 || u.iD_Estado === 1) ?? false)
      );

      setDatos(resEC || []);
      setUsuarios(usuariosEstudiantes);
      setCarreras(
        (Array.isArray(resCarreras)
          ? resCarreras
          : resCarreras?.resultado || []
        ).filter((c) => c.activo)
      );
      setEstados(resEstados?.data || []);
      setTurnos(resTurnos?.resultado.filter((t) => t.activo) || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
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
      iD_Usuario: 0,
      iD_Carrera: 0,
      iD_Turno: 0,
      fecha_Inicio: "",
      fecha_Fin: "",
      iD_Estado: 0,
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
      iD_Turno: item.iD_Turno,
      fecha_Inicio: item.fecha_Inicio?.slice(0, 10) || "",
      fecha_Fin: item.fecha_Fin?.slice(0, 10) || "",
      iD_Estado: item.iD_Estado,
    });

    const usuario = usuarios.find(
      (u) => u.iD_Usuario === item.iD_Usuario || u.id_Usuario === item.iD_Usuario
    );
    setBusquedaUsuario(usuario?.nombre_Usuario || usuario?.usuario || "");

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

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombre_Usuario || u.usuario || "").toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  const carrerasFiltradas = carreras.filter(
    (c) =>
      !busquedaCarrera.trim() ||
      (c.nombreCarrera || "").toLowerCase().includes(busquedaCarrera.toLowerCase())
  );

  const datosPaginados = datos.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );
  const totalPaginas = Math.ceil(datos.length / filasPorPagina);
  const activos = datos.filter((d) => d.iD_Estado === 1).length;

  const exportarPorCarrera = (idCarrera) => {
    const estudiantes = datos.filter(
      (d) => d.iD_Carrera === idCarrera && d.iD_Estado === 1
    );
    const csv = [
      ["Usuario", "Carrera", "Fecha Inicio", "Fecha Fin"],
      ...estudiantes.map((e) => [
        e.usuario,
        e.nombreCarrera,
        formatearFecha(e.fecha_Inicio),
        formatearFecha(e.fecha_Fin),
      ]),
    ]
      .map((fila) => fila.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `estudiantes_carrera_${idCarrera}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      key: "turno",
      label: "Turno",
      render: (item) => {
        if (item.nombreTurno) return item.nombreTurno;
        const turno = turnos.find((t) => t.idCatalogo === item.iD_Turno);
        return turno ? turno.descripcionCatalogo : "-";
      },
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
      <h2
        className={`text-2xl font-bold mb-4 ${
          modoOscuro ? "text-white" : "text-gray-800"
        }`}
      >
        Estudiantes - Carreras
      </h2>

      <ContadoresBase
        activos={activos}
        inactivos={datos.length - activos}
        total={datos.length}
        modoOscuro={modoOscuro}
        onNuevo={abrirModalNuevo}
      />

      {/* Controles arriba */}
      <div className="flex justify-start items-center mb-3">
        <label className="mr-2">Filas por página:</label>
        <select
          value={filasPorPagina}
          onChange={(e) => {
            setFilasPorPagina(Number(e.target.value));
            setPaginaActual(1);
          }}
          className="border rounded px-2 py-1"
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <TablaBase
        datos={datosPaginados}
        columnas={columnas}
        modoOscuro={modoOscuro}
        loading={loading}
        onEditar={abrirModalEditar}
      />

      {/* Paginación abajo */}
      <div className="flex justify-between items-center mt-3">
        {/* Botón anterior */}
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
        >
          Anterior
        </button>

        {/* Info de página en el centro */}
        <span className="font-semibold">
          Página {paginaActual} de {totalPaginas || 1}
        </span>

        {/* Botón siguiente */}
        <button
          onClick={() =>
            setPaginaActual((prev) => (prev < totalPaginas ? prev + 1 : prev))
          }
          disabled={paginaActual === totalPaginas}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>

      {/* Modal */}
      <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo={modoEdicion ? "Estudiante-Carrera" : "Estudiante-Carrera"}
        >
          <div className="space-y-4">
            {/* Autocompletado usuario */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={busquedaUsuario}
                onChange={(e) => {
                  setBusquedaUsuario(e.target.value);
                  setForm((prev) => ({ ...prev, iD_Usuario: 0 }));
                }}
                onFocus={() => setMostrarDropdownUsuario(true)}
                ref={inputRefUsuario}
                disabled={modoEdicion}
                className="w-full px-3 py-2 border rounded"
                autoComplete="off"
              />
              {mostrarDropdownUsuario && usuariosFiltrados.length > 0 && (
                <ul
                  ref={dropdownRefUsuario}
                  className={`absolute z-10 w-full max-h-52 overflow-auto border rounded shadow-lg ${
                    modoOscuro
                      ? "bg-gray-800 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {usuariosFiltrados.map((u) => (
                    <li
                      key={u.iD_Usuario || u.id_Usuario}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          iD_Usuario: u.iD_Usuario || u.id_Usuario,
                        }));
                        setBusquedaUsuario(u.nombre_Usuario || u.usuario);
                        setMostrarDropdownUsuario(false);
                      }}
                      className={`px-3 py-2 cursor-pointer ${
                        modoOscuro ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      {u.nombre_Usuario || u.usuario}
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
                onChange={(e) => {
                  setBusquedaCarrera(e.target.value);
                  setForm((prev) => ({ ...prev, iD_Carrera: 0 }));
                }}
                onFocus={() => setMostrarDropdownCarrera(true)}
                ref={inputRefCarrera}
                className="w-full px-3 py-2 border rounded"
                autoComplete="off"
              />
              {mostrarDropdownCarrera && carrerasFiltradas.length > 0 && (
                <ul
                  ref={dropdownRefCarrera}
                  className={`absolute z-10 w-full max-h-52 overflow-auto border rounded shadow-lg ${
                    modoOscuro
                      ? "bg-gray-800 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {carrerasFiltradas.map((c) => (
                    <li
                      key={c.iD_Carrera}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, iD_Carrera: c.iD_Carrera }));
                        setBusquedaCarrera(c.nombreCarrera);
                        setMostrarDropdownCarrera(false);
                      }}
                      className={`px-3 py-2 cursor-pointer ${
                        modoOscuro ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      {c.nombreCarrera}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Autocompletado turno */}
            <select
              name="iD_Turno"
              value={form.iD_Turno}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value={0}>Seleccione Turno</option>
              {turnos.map((t) => (
                <option key={t.idCatalogo} value={t.idCatalogo}>
                  {t.descripcionCatalogo}
                </option>
              ))}
            </select>

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
              <option value={0}>Seleccione Estado</option>
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
