import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import usuarioService from "../../services/Usuario";
import personaService from "../../services/Persona";
import contactoService from "../../services/Contacto";
import tipoCatalogoService from "../../services/TipoCatalogo";
import catalogoService from "../../services/Catalogos";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmUsuarios = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [tiposCatalogo, setTiposCatalogo] = useState([]);
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
    idUsuario: 0,
    idPersona: "",          // <-- agregado
    nombreUsuario: "",
    contrasena: "",
    idEstado: "",
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

  const adaptarDatosUsuarios = (usuariosRaw, personasRaw, contactosRaw, catalogosRaw) => {
    const mapaPersonas = new Map(personasRaw.map((p) => [p.idPersona, p]));
    const mapaCatalogos = new Map(catalogosRaw.map((c) => [c.idCatalogo, c.descripcionCatalogo]));

    return usuariosRaw.map((u) => {
      const persona = mapaPersonas.get(u.id_Persona);
      const contactosPersona = contactosRaw.filter((c) => c.idPersona === u.id_Persona);
      const contactoSeleccionado =
        contactosPersona.find((c) => {
          const tipo = mapaCatalogos.get(c.idTipoContacto)?.toLowerCase() || "";
          return tipo.includes("celular");
        }) || contactosPersona[0] || null;

      return {
        idUsuario: u.id_Usuario,
        idPersona: u.id_Persona,  
        nombreUsuario: u.usuario || "-",
        nombreCompleto:
          persona
            ? `${persona.primerNombre} ${persona.segundoNombre || ""} ${persona.primerApellido} ${persona.segundoApellido || ""}`.trim()
            : "-",
        correoElectronico: u.correoElectronico || "-",
        tipoContacto: contactoSeleccionado ? mapaCatalogos.get(contactoSeleccionado.idTipoContacto) || "-" : "-",
        numeroContacto: contactoSeleccionado?.valorContacto || "-",
        estado: u.id_Estado,
        nombreEstado:
          catalogosRaw.find((c) => c.idCatalogo === u.id_Estado && c.idTipoCatalogo === 5)?.descripcionCatalogo ||
          "-",
        fechaCreacion: formatearFecha(u.fecha_Creacion),
        fechaModificacion: formatearFecha(u.fecha_Modificacion),
      };
    });
  };

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [
        resUsuarios,
        resPersonas,
        resContactos,
        resCatalogos,
        resTiposCatalogo,
        resEstados,
      ] = await Promise.all([
        usuarioService.listarUsuario(),
        personaService.listarPersonas(),
        contactoService.listarContacto(),
        catalogoService.listarCatalogo(),
        tipoCatalogoService.listarTiposCatalogo(),
        estadoService.listarEstados(),
      ]);

      const usuariosRaw = resUsuarios?.data || [];
      const personasRaw = resPersonas?.data || [];
      const contactosRaw = resContactos?.resultado || [];
      const catalogosRaw = resCatalogos?.resultado || [];
      const tiposCatalogoRaw = resTiposCatalogo?.data || [];
      const estadosRaw = resEstados?.data || [];

      setPersonas(personasRaw);
      setContactos(contactosRaw);
      setCatalogos(catalogosRaw);
      setTiposCatalogo(tiposCatalogoRaw);
      setEstados(estadosRaw);

      const datosAdaptados = adaptarDatosUsuarios(usuariosRaw, personasRaw, contactosRaw, catalogosRaw);
      setUsuarios(datosAdaptados);
      setFormError("");
    } catch (error) {
      console.error("Error cargando datos:", error);
      setUsuarios([]);
      setFormError("Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const abrirModalNuevo = () => {
    setForm({
      idUsuario: 0,
      idPersona: "",           // <-- inicializar vacío
      nombreUsuario: "",
      contrasena: "",
      idEstado: "",
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (usuario) => {
    setForm({
      idUsuario: usuario.idUsuario,
      idPersona: usuario.idPersona,    // <-- cargar idPersona
      nombreUsuario: usuario.nombreUsuario,
      contrasena: "", // vacía para que no muestre contraseña actual
      idEstado: usuario.estado,
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
    setForm((prev) => ({
      ...prev,
      [name]: name === "idEstado" || name === "idPersona" ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    setFormError(""); // Limpiar errores previos

    if (!form.nombreUsuario || form.nombreUsuario.trim() === "") {
      setFormError("El nombre de usuario es obligatorio.");
      return;
    }

    if (!modoEdicion) {
      if (!form.idPersona || form.idPersona === "") {
        setFormError("Debe seleccionar una persona para el nuevo usuario.");
        return;
      }
      // Nuevo usuario: contraseña obligatoria
      if (!form.contrasena || form.contrasena.trim() === "") {
        setFormError("La contraseña es obligatoria para un nuevo usuario.");
        return;
      }
    } else {
      // Edición: si contraseña se pone, debe no estar vacía
      if (form.contrasena && form.contrasena.trim() === "") {
        setFormError("Si ingresa contraseña, no puede estar vacía.");
        return;
      }
    }

    if (!form.idEstado) {
      setFormError("Debe seleccionar un estado.");
      return;
    }

    setFormLoading(true);

    // Preparar datos a enviar:
    const datosEnviar = modoEdicion
      ? {
          IdUsuario: form.idUsuario,
          Usuario: form.nombreUsuario.trim(),
          ...(form.contrasena && form.contrasena.trim() !== "" && {
            Contrasena: form.contrasena.trim(),
          }),
          Id_Estado: form.idEstado,
        }
      : {
          Id_Persona: form.idPersona,
          Usuario: form.nombreUsuario.trim(),
          Contrasena: form.contrasena.trim(),
          Id_Estado: form.idEstado,
        };

    try {
      const res = modoEdicion
        ? await usuarioService.actualizarUsuario(datosEnviar)
        : await usuarioService.insertarUsuario(datosEnviar);

      if (res.success) {
        cerrarModal();
        Swal.fire("Éxito", res.message || "Operación exitosa", "success");
        cargarTodo();
      } else {
        setFormError(res.message || "Error en la operación");
      }
    } catch (error) {
      setFormError(error.response?.data?.error || error.message || "Error inesperado");
    } finally {
      setFormLoading(false);
    }
  };

  const textoBusqueda = (busqueda || filtros.texto || "").toLowerCase().trim();
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideTexto =
      u.nombreUsuario.toLowerCase().includes(textoBusqueda) ||
      u.nombreCompleto.toLowerCase().includes(textoBusqueda) ||
      u.correoElectronico.toLowerCase().includes(textoBusqueda);

    const coincideEstado = !filtros.estado || u.nombreEstado === filtros.estado;

    return coincideTexto && coincideEstado;
  });

  const activos = usuariosFiltrados.filter((u) => u.estado === 1).length;
  const inactivos = usuariosFiltrados.length - activos;

  const columnas = [
 
    { key: "nombreUsuario", label: "Usuario" },
    { key: "nombreCompleto", label: "Nombre Completo" },
    { key: "tipoContacto", label: "Tipo Contacto" },
    { key: "numeroContacto", label: "Número" },
    {
      key: "nombreEstado",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.estado === 1 ? (
          <span className="text-green-500 font-semibold flex justify-center">
            <FaCheckCircle size={20} />
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex justify-center">
            <FaTimesCircle size={20} />
          </span>
        ),
    },

    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
  ];
return (
  <div className="p-4">
    <div className={`shadow-lg rounded-xl p-6 ${fondo}`}>
      <h2
        className={`text-2xl md:text-3xl font-extrabold tracking-wide cursor-pointer select-none ${texto}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-controls="usuariosContent"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsCollapsed(!isCollapsed);
        }}
      >
        {isCollapsed ? "►" : "▼"} Gestión de Usuarios
      </h2>

      {!isCollapsed && (
        <div id="usuariosContent" className="mt-4">
          <ContadoresBase
            activos={activos}
            inactivos={inactivos}
            total={usuariosFiltrados.length}
            modoOscuro={modoOscuro}
            onNuevo={abrirModalNuevo}
          />

          <TablaBase
            datos={usuariosFiltrados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
            onEditar={abrirModalEditar}
          />
        </div>
      )}

      <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
  <FormularioBase
    onSubmit={handleGuardar}
    onCancel={cerrarModal}
    modoOscuro={modoOscuro}
    formError={formError}
    formLoading={formLoading}
    modoEdicion={modoEdicion}
    titulo={modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}
  >
   

          <div className="space-y-4">
            {!modoEdicion && (
  <select
    name="idPersona"
    value={form.idPersona || ""}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
    required
  >
    <option value="">Seleccione Persona</option>
    {personas.map((p) => (
      <option key={p.idPersona} value={p.idPersona}>
        {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido} {p.segundoApellido || ""}
      </option>
    ))}
  </select>
)}


            <input
              type="text"
              name="nombreUsuario"
              placeholder="Nombre de Usuario *"
              value={form.nombreUsuario}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />

            {!modoEdicion && (
              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña *"
                value={form.contrasena}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            )}

            {modoEdicion && (
              <input
                type="password"
                name="contrasena"
                placeholder="Nueva Contraseña (opcional)"
                value={form.contrasena}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            )}

            <select
              name="idEstado"
              value={form.idEstado || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            >
              <option value="">Seleccione Estado </option>
              {estados .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
                  .map((e) => (
                <option key={e.iD_Estado} value={e.iD_Estado}>
                  {e.nombre_Estado}
                </option>
              ))}
            </select>
          </div>
        </FormularioBase>
      </ModalBase>
    </div>
  </div>
);

};

export default FrmUsuarios;
