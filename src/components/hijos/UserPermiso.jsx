import React, { useState, useEffect } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [filtros, setFiltros] = useState({
    texto: "",
  });

  const [form, setForm] = useState({
    idUsuarioPermiso: 0,
    idUsuario: "",
    idPermiso: "",
    activo: null, // boolean o null
  });

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
    setForm({
      idUsuarioPermiso: 0,
      idUsuario: "",
      idPermiso: "",
      activo: null,
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setForm({
      idUsuarioPermiso: item.idUsuarioPermiso,
      idUsuario: item.idUsuario,
      idPermiso: item.idPermiso,
      activo: item.activo,
    });
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

    // Para el select activo convertir string "true"/"false" a booleano
    if (name === "activo") {
      if (value === "true") val = true;
      else if (value === "false") val = false;
      else val = null;
    } else if (name === "idUsuario" || name === "idPermiso") {
      val = Number(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.idUsuario) {
      setFormError("Debe seleccionar un usuario.");
      return;
    }
    if (!form.idPermiso) {
      setFormError("Debe seleccionar un permiso.");
      return;
    }
    if (form.activo === null) {
      setFormError("Debe seleccionar un estado.");
      return;
    }

    setFormLoading(true);

    const datosEnviar = modoEdicion
      ? {
          IdUsuarioPermiso: form.idUsuarioPermiso,
          IdUsuario: form.idUsuario,
          IdPermiso: form.idPermiso,
          Activo: form.activo, // boolean directo
        }
      : {
          IdUsuario: form.idUsuario,
          IdPermiso: form.idPermiso,
          Activo: form.activo, // boolean directo
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

  // Filtrado y búsqueda
  const textoBusqueda = (busqueda || filtros.texto || "").toLowerCase().trim();
  const usuariosPermisoFiltrados = usuariosPermiso.filter((item) => {
    const usuarioNombre = usuarios.find((u) => u.id_Usuario === item.idUsuario)?.usuario?.toLowerCase() || "";
    const permisoNombre = permisos.find((p) => p.idPermiso === item.idPermiso)?.nombrePermiso?.toLowerCase() || "";

    const coincideTexto = usuarioNombre.includes(textoBusqueda) || permisoNombre.includes(textoBusqueda);

    return coincideTexto;
  });

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
      key: "activo",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">
            {/* icono activo */}
            Activo
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            {/* icono inactivo */}
            Inactivo
          </span>
        ),
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
  ];

  return (
 <>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
          Usuarios Permisos
          </h2>
        </div>

          <div id="usuariosPermisoContent" className="mt-4">
            <ContadoresBase
              activos={activos}
              inactivos={inactivos}
              total={usuariosPermisoFiltrados.length}
              modoOscuro={modoOscuro}
              onNuevo={abrirModalNuevo}
            />

            <TablaBase
              datos={usuariosPermisoFiltrados}
              columnas={columnas}
              modoOscuro={modoOscuro}
              loading={loading}
              texto={texto}
              encabezadoClase={encabezado}
              onEditar={abrirModalEditar}
            />
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
              <select
                name="idUsuario"
                value={form.idUsuario || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                disabled={modoEdicion}
              >
                <option value="">Seleccione Usuario</option>
                {usuarios.map((u) => (
                  <option key={u.id_Usuario} value={u.id_Usuario}>
                    {u.usuario}
                  </option>
                ))}
              </select>

              <select
                name="idPermiso"
                value={form.idPermiso || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Permiso</option>
                {permisos.map((p) => (
                  <option key={p.idPermiso} value={p.idPermiso}>
                    {p.nombrePermiso}
                  </option>
                ))}
              </select>

              <select
                name="activo"
                value={
                  form.activo === true
                    ? "true"
                    : form.activo === false
                    ? "false"
                    : ""
                }
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
