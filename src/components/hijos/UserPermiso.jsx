// Archivo: UserPermiso.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import usuariosPermisoService from "../../services/UsuariosPermiso";
import usuarioService from "../../services/Usuario";
import permisoService from "../../services/Permiso";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const UserPermiso = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

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

  const [usuariosPermiso, setUsuariosPermiso] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [filtros, setFiltros] = useState({ texto: "" });

  const [form, setForm] = useState({
    idUsuarioPermiso: 0,
    idUsuario: "",
    idPermiso: "",
    activo: null,
  });

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [mostrarDropdownUsuario, setMostrarDropdownUsuario] = useState(false);
  const inputRefUsuario = useRef(null);
  const dropdownRefUsuario = useRef(null);

  const usuariosFiltrados = usuarios.filter((u) =>
    u.usuario.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRefUsuario.current &&
        !inputRefUsuario.current.contains(event.target) &&
        dropdownRefUsuario.current &&
        !dropdownRefUsuario.current.contains(event.target)
      ) {
        setMostrarDropdownUsuario(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [resUsuariosPermiso, resUsuarios, resPermisos] = await Promise.all([
        usuariosPermisoService.listarUsuariosPermiso(),
        usuarioService.listarUsuario(),
        permisoService.listarPermisos(),
      ]);

      setUsuariosPermiso(resUsuariosPermiso.data || []);
      setUsuarios(resUsuarios.data || []);
      setPermisos(resPermisos.resultado || []);
      setFormError("");
    } catch (error) {
      console.error("Error cargando datos UsuariosPermiso:", error);
      setUsuariosPermiso([]);
      setFormError("Error al cargar las relaciones usuario-permiso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const abrirModalNuevo = () => {
    setForm({ idUsuarioPermiso: 0, idUsuario: "", idPermiso: "", activo: null });
    setBusquedaUsuario("");
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    const usuario = usuarios.find((u) => u.id_Usuario === item.idUsuario);
    setForm({
      idUsuarioPermiso: item.idUsuarioPermiso,
      idUsuario: item.idUsuario,
      idPermiso: item.idPermiso,
      activo: item.activo,
    });
    setBusquedaUsuario(usuario?.usuario || "");
    setFormError("");
    setModoEdicion(true);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "activo") {
      if (value === "true") val = true;
      else if (value === "false") val = false;
      else val = null;
    } else if (name === "idPermiso") {
      val = Number(value);
    }

    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.idUsuario) return setFormError("Debe seleccionar un usuario.");
    if (!form.idPermiso) return setFormError("Debe seleccionar un permiso.");
    if (form.activo === null) return setFormError("Debe seleccionar un estado.");

    setFormLoading(true);
    const datosEnviar = modoEdicion
      ? {
          IdUsuarioPermiso: form.idUsuarioPermiso,
          IdUsuario: form.idUsuario,
          IdPermiso: form.idPermiso,
          Activo: form.activo,
        }
      : {
          IdUsuario: form.idUsuario,
          IdPermiso: form.idPermiso,
          Activo: form.activo,
        };

    try {
      const res = modoEdicion
        ? await usuariosPermisoService.actualizarUsuarioPermiso(datosEnviar)
        : await usuariosPermisoService.insertarUsuarioPermiso(datosEnviar);

      if (res?.numero > 0 || res?.mensaje?.toLowerCase().includes("correctamente")) {
        cerrarModal();
        Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
        cargarTodo();
      } else {
        cerrarModal();
        Swal.fire("Error", res.mensaje || "Error en la operación", "error");
      }
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error inesperado";
      Swal.fire("Error", mensajeError, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const textoBusqueda = (busqueda || filtros.texto || "").toLowerCase().trim();
  const usuariosPermisoFiltrados = usuariosPermiso.filter((item) => {
    const usuarioNombre = usuarios.find((u) => u.id_Usuario === item.idUsuario)?.usuario?.toLowerCase() || "";
    const permisoNombre = permisos.find((p) => p.idPermiso === item.idPermiso)?.nombrePermiso?.toLowerCase() || "";
    return usuarioNombre.includes(textoBusqueda) || permisoNombre.includes(textoBusqueda);
  });

  const totalPaginas = Math.ceil(usuariosPermisoFiltrados.length / filasPorPagina);
  const datosPaginados = usuariosPermisoFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const activos = usuariosPermisoFiltrados.filter((u) => u.activo === true).length;
  const inactivos = usuariosPermisoFiltrados.length - activos;

  const columnas = [
    {
      key: "nombreUsuario",
      label: "Usuario",
      render: (item) => usuarios.find((u) => u.id_Usuario === item.idUsuario)?.usuario || "-",
    },
    {
      key: "nombrePermiso",
      label: "Permiso",
      render: (item) => permisos.find((p) => p.idPermiso === item.idPermiso)?.nombrePermiso || "-",
    },
    {
      key: "nombreCreador",
      label: "Creado por",
      render: (item) => item.nombreCreador || "-",
    },
    {
      key: "nombreModificador",
      label: "Modificado por",
      render: (item) => item.nombreModificador || "-",
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
    {
      key: "activo",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">Activo</span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">Inactivo</span>
        ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide ${modoOscuro ? "text-white" : "text-gray-800"}`}>
          Usuario-Permiso
        </h2>
      </div>

      <ContadoresBase
        activos={activos}
        inactivos={inactivos}
        total={usuariosPermisoFiltrados.length}
        modoOscuro={modoOscuro}
        onNuevo={abrirModalNuevo}
      />
       <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
        <label htmlFor="filasPorPagina" className="font-semibold">
          Filas por página:
        </label>
        <select
          id="filasPorPagina"
          value={filasPorPagina}
          onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
          className={`w-[5rem] px-3 py-1 rounded border ${modoOscuro ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
        >
          {[10, 30, 45, 60, 100].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <TablaBase
        datos={datosPaginados}
        columnas={columnas}
        modoOscuro={modoOscuro}
        loading={loading}
        texto={texto}
        encabezadoClase={encabezado}
        onEditar={abrirModalEditar}
      />

      <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
          className={`rounded px-4 py-2 text-white ${paginaActual === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
        >
          Anterior
        </button>
        <span className="font-semibold select-none">
          Página {paginaActual} de {totalPaginas || 1}
        </span>
        <button
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))}
          className={`rounded px-4 py-2 text-white ${paginaActual === totalPaginas || totalPaginas === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
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
          titulo={modoEdicion ? "Editar Permiso Usuario" : "Nuevo Permiso Usuario"}
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                onFocus={() => setMostrarDropdownUsuario(true)}
                ref={inputRefUsuario}
                disabled={modoEdicion}
                className="w-full px-3 py-2 border rounded bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {mostrarDropdownUsuario && usuariosFiltrados.length > 0 && (
                <ul
                  ref={dropdownRefUsuario}
                  className="absolute z-10 w-full max-h-48 overflow-y-auto border rounded bg-white text-gray-800 shadow dark:bg-gray-800 dark:text-white dark:border-gray-600"
                >
                  {usuariosFiltrados.map((u) => (
                    <li
                      key={u.id_Usuario}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, idUsuario: u.id_Usuario }));
                        setBusquedaUsuario(u.usuario);
                        setMostrarDropdownUsuario(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {u.usuario}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              name="idPermiso"
              value={form.idPermiso || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            >
              <option value="">Seleccione Permiso</option>
              {permisos.map((p) => (
                <option key={p.idPermiso} value={p.idPermiso}>{p.nombrePermiso}</option>
              ))}
            </select>

            <select
              name="activo"
              value={form.activo === true ? "true" : form.activo === false ? "false" : ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            >
              <option value="">Seleccione Estado</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </FormularioBase>
      </ModalBase>
    </>
  );
};

export default UserPermiso;
