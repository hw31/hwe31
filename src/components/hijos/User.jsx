import React, { useState, useEffect, useRef } from "react";
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

  const [busquedaPersona, setBusquedaPersona] = useState("");
  const [personasFiltradas, setPersonasFiltradas] = useState([]);
  const [mostrarDropdownPersona, setMostrarDropdownPersona] = useState(false);
  const inputRefPersona = useRef(null);
  const dropdownRefPersona = useRef(null);

  const [filtros, setFiltros] = useState({ texto: "", estado: "" });

  const [form, setForm] = useState({
    idUsuario: 0,
    idPersona: "",
    nombreUsuario: "",
    contrasena: "",
    idEstado: "",
  });

  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRefPersona.current &&
        !inputRefPersona.current.contains(event.target) &&
        dropdownRefPersona.current &&
        !dropdownRefPersona.current.contains(event.target)
      ) {
        setMostrarDropdownPersona(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!busquedaPersona) {
      setPersonasFiltradas(personas);
      return;
    }
    const filtro = personas.filter((p) => {
      const nombreCompleto = `${p.primerNombre} ${p.segundoNombre || ""} ${p.primerApellido} ${p.segundoApellido || ""}`.toLowerCase();
      return nombreCompleto.includes(busquedaPersona.toLowerCase());
    });
    setPersonasFiltradas(filtro);
  }, [busquedaPersona, personas]);

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
        nombreCompleto: persona
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
      const [resUsuarios, resPersonas, resContactos, resCatalogos, resTiposCatalogo, resEstados] = await Promise.all([
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
      idPersona: "",
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
      idPersona: usuario.idPersona,
      nombreUsuario: usuario.nombreUsuario,
      contrasena: "",
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
    setFormError("");

    if (!form.nombreUsuario?.trim()) return setFormError("El nombre de usuario es obligatorio.");
    if (!modoEdicion) {
      if (!form.idPersona) return setFormError("Debe seleccionar una persona.");
      if (!form.contrasena?.trim()) return setFormError("La contraseña es obligatoria para un nuevo usuario.");
    }

    if (modoEdicion && form.contrasena && !form.contrasena.trim()) {
      return setFormError("Si ingresa contraseña, no puede estar vacía.");
    }

    if (!form.idEstado) return setFormError("Debe seleccionar un estado.");

    setFormLoading(true);
    const datosEnviar = modoEdicion
      ? {
          IdUsuario: form.idUsuario,
          Usuario: form.nombreUsuario.trim(),
          ...(form.contrasena?.trim() && { Contrasena: form.contrasena.trim() }),
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

  const totalPaginas = Math.ceil(usuariosFiltrados.length / filasPorPagina);
  const datosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const activos = usuariosFiltrados.filter((u) => u.estado === 1).length;
  const inactivos = usuariosFiltrados.length - activos;

  const columnas = [
    { key: "nombreUsuario", label: "Usuario" },
    { key: "nombreCompleto", label: "Nombre Completo" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
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
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide ${modoOscuro ? "text-white" : "text-gray-800"}`}>
          Usuario
        </h2>
      </div>

      <ContadoresBase
        activos={activos}
        inactivos={inactivos}
        total={usuariosFiltrados.length}
        modoOscuro={modoOscuro}
        onNuevo={abrirModalNuevo}
      />

      {/* Selector de filas por página */}
      <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
        <label htmlFor="filasPorPagina" className="font-semibold">
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
        loading={loading}
        texto={texto}
        encabezadoClase={encabezado}
        onEditar={abrirModalEditar}
      />

      {/* Botones de paginación */}
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
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo={modoEdicion ? "Editar Usuario" : "Usuario"}
          >
            <div className="space-y-4">
              {!modoEdicion && (
                 <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar persona..."
                    value={busquedaPersona}
                    onChange={(e) => setBusquedaPersona(e.target.value)}
                    onFocus={() => setMostrarDropdownPersona(true)}
                    ref={inputRefPersona}
                    className="w-full px-3 py-2 border rounded bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  {mostrarDropdownPersona && personasFiltradas.length > 0 && (
                    <ul 
                    ref={dropdownRefPersona}
                    className="absolute z-10 w-full max-h-48 overflow-y-auto border rounded bg-white text-gray-800 shadow dark:bg-gray-800 dark:text-white dark:border-gray-600">
                      {personasFiltradas.map((p) => (
                        <li
                          key={p.idPersona}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, idPersona: p.idPersona }));
                            setBusquedaPersona(
                              `${p.primerNombre} ${p.segundoNombre || ""} ${p.primerApellido} ${p.segundoApellido || ""}`.trim()
                            );
                            setMostrarDropdownPersona(false);
                          }}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido} {p.segundoApellido || ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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

export default FrmUsuarios;
