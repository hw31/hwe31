import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import usuariosRolesService from "../../services/UsuariosRoles";
import usuarioService from "../../services/Usuario";
import rolService from "../../services/Roles";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const UserRol = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  // Función para formatear fechas
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

  // Estados
  const [usuariosRoles, setUsuariosRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [filtros, setFiltros] = useState({
    texto: "",
    estado: "",
  });

  const [form, setForm] = useState({
    idUsuarioRol: 0,
    idUsuario: "",
    idRol: "",
    idEstado: "",
  });

  // Función para cargar datos
  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [resUsuariosRoles, resUsuarios, resRoles, resEstados] = await Promise.all([
        usuariosRolesService.listarUsuariosRoles(),
        usuarioService.listarUsuario(),
        rolService.listarRoles(),
        estadoService.listarEstados(),
      ]);

      const listaUsuariosRoles = resUsuariosRoles || [];
      const listaUsuarios = resUsuarios?.data || [];
      const listaRoles = resRoles?.resultado || [];
      const listaEstados = resEstados?.data || [];

      setUsuariosRoles(listaUsuariosRoles);
      setUsuarios(listaUsuarios);
      setRoles(listaRoles);
      setEstados(listaEstados);

      setFormError("");
    } catch (error) {
      console.error("Error cargando datos UsuariosRoles:", error);
      setUsuariosRoles([]);
      setFormError("Error al cargar las relaciones usuario-rol.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  // Modal nuevo
  const abrirModalNuevo = () => {
    setForm({
      idUsuarioRol: 0,
      idUsuario: "",
      idRol: "",
      idEstado: "",
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  // Modal editar
  const abrirModalEditar = (item) => {
    setForm({
  idUsuarioRol: item.iD_Usuario_Roles,
  idUsuario: item.iD_Usuario,
  idRol: item.iD_Rol,
  idEstado: item.id_Estado,
});

    setFormError("");
    setModoEdicion(true);
    setModalOpen(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "idUsuario" || name === "idRol" || name === "idEstado" ? Number(value) : value,
    }));
  };

 const handleGuardar = async () => {
  setFormError("");

  if (!form.idUsuario) {
    setFormError("Debe seleccionar un usuario.");
    return;
  }
  if (!form.idRol) {
    setFormError("Debe seleccionar un rol.");
    return;
  }
  if (!form.idEstado) {
    setFormError("Debe seleccionar un estado.");
    return;
  }

  setFormLoading(true);

  const datosEnviar = modoEdicion
    ? {
        IdUsuarioRoles: form.idUsuarioRol, // O si tu API espera Id_Usuario_Roles, usa ese nombre exactamente
        IdUsuario: form.idUsuario,
        IdRol: form.idRol,
        IdEstado: form.idEstado,
      }
    : {
        IdUsuario: form.idUsuario,
        IdRol: form.idRol,
        IdEstado: form.idEstado,
      };

  try {
    const res = modoEdicion
      ? await usuariosRolesService.actualizarUsuarioRol(datosEnviar)
      : await usuariosRolesService.insertarUsuarioRol(datosEnviar);

    // Validamos según la estructura que devuelve tu API
   if (res.success || res.numero > 0)
 {
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


  // Filtrado y búsqueda, corregido el uso de los campos de roles y estados
  const textoBusqueda = (busqueda || filtros.texto || "").toLowerCase().trim();
  const usuariosRolesFiltrados = usuariosRoles.filter((item) => {
    const usuarioNombre = usuarios.find((u) => u.id_Usuario === item.iD_Usuario)?.usuario?.toLowerCase() || "";
    const rolNombre = roles.find((r) => r.iD_Rol === item.iD_Rol)?.nombre_Rol?.toLowerCase() || "";
    const estadoNombre = estados.find((e) => e.iD_Estado === item.id_Estado)?.nombre_Estado || "";

    const coincideTexto = usuarioNombre.includes(textoBusqueda) || rolNombre.includes(textoBusqueda);
    const coincideEstado = !filtros.estado || estadoNombre === filtros.estado;

    return coincideTexto && coincideEstado;
  });

  const activos = usuariosRolesFiltrados.filter((u) => u.id_Estado === 1).length;
  const inactivos = usuariosRolesFiltrados.length - activos;

  // Columnas con las nuevas propiedades incluidas y fechas formateadas
  const columnas = [
    {
      key: "nombreUsuario",
      label: "Usuario",
      render: (item) => usuarios.find((u) => u.id_Usuario === item.iD_Usuario)?.usuario || "-",
    },
    {
      key: "nombreRol",
      label: "Rol",
      render: (item) => roles.find((r) => r.iD_Rol === item.iD_Rol)?.nombre_Rol || "-",
    },
    
    {
      key: "nombreCreador",
      label: "Creador",
      render: (item) => item.nombre_Creador || "-",
    },
    {
      key: "nombreModificador",
      label: "Modificador",
      render: (item) => item.nombre_Modificador || "-",
    },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (item) => formatearFecha(item.fecha_Creacion),
    },
    {
      key: "fechaModificacion",
      label: "Fecha Modificación",
      render: (item) => formatearFecha(item.fecha_Modificacion),
    },
    {
      key: "nombreEstado",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.id_Estado === 1 ? (
          <span className="text-green-500 font-semibold flex justify-center">
            <FaCheckCircle size={20} />
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex justify-center">
            <FaTimesCircle size={20} />
          </span>
        ),
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
            Usuarios-Roles
          </h2>
        </div>

       
          <div id="usuariosRolesContent" className="mt-4">
            <ContadoresBase
              activos={activos}
              inactivos={inactivos}
              total={usuariosRolesFiltrados.length}
              modoOscuro={modoOscuro}
              onNuevo={abrirModalNuevo}
            />

            <TablaBase
              datos={usuariosRolesFiltrados}
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
            titulo={modoEdicion ? "Editar Relación Usuario-Rol" : "Nueva Relación Usuario-Rol"}
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
                name="idRol"
                value={form.idRol || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Rol</option>
                {roles.map((r) => (
                  <option key={r.iD_Rol} value={r.iD_Rol}>
                    {r.nombre_Rol}
                  </option>
                ))}
              </select>

              <select
                name="idEstado"
                value={form.idEstado || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
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

export default UserRol;
