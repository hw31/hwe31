import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import contactoService from "../../services/Contacto";
import personaService from "../../services/Persona";
import catalogoService from "../../services/Catalogos";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmContacto = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [contactos, setContactos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filtroPersona, setFiltroPersona] = useState("");
  const [mostrarDropdownPersona, setMostrarDropdownPersona] = useState(false);
  const inputPersonaRef = useRef(null);

  const [form, setForm] = useState({
    idContacto: 0,
    idPersona: "",
    idTipoContacto: "",
    valorContacto: "",
    idEstado: "",
  });

  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resContactos, resPersonas, resCatalogos, resEstados] = await Promise.all([
        contactoService.listarContacto(),
        personaService.listarPersonas(),
        catalogoService.listarCatalogo(),
        estadoService.listarEstados(),
      ]);

      setContactos(resContactos.resultado || []);
      setPersonas(resPersonas?.data || []);
      setCatalogos(resCatalogos.resultado || []);
      setEstados(resEstados?.data || []);
      setFormError("");
    } catch (error) {
      console.error("Error al cargar datos de contacto:", error);
      setContactos([]);
      setFormError("Error al cargar contactos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (inputPersonaRef.current && !inputPersonaRef.current.contains(e.target)) {
        setMostrarDropdownPersona(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const abrirModalNuevo = () => {
    setForm({
      idContacto: 0,
      idPersona: "",
      idTipoContacto: "",
      valorContacto: "",
      idEstado: "",
    });
    setFiltroPersona("");
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (contacto) => {
    const persona = personas.find((p) => p.idPersona === contacto.idPersona);
    setForm({
      idContacto: contacto.idContacto,
      idPersona: contacto.idPersona,
      idTipoContacto: contacto.idTipoContacto,
      valorContacto: contacto.valorContacto || "",
      idEstado: contacto.idEstado || "",
    });
    setFiltroPersona(
      persona ? `${persona.primerNombre} ${persona.primerApellido}` : ""
    );
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
      [name]: name === "idPersona" || name === "idTipoContacto" || name === "idEstado" ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.idPersona) {
      setFormError("Debe seleccionar una persona.");
      return;
    }

    if (!form.idTipoContacto) {
      setFormError("Debe seleccionar un tipo de contacto.");
      return;
    }

    if (!form.valorContacto || form.valorContacto.trim() === "") {
      setFormError("El valor del contacto es obligatorio.");
      return;
    }

    if (!form.idEstado) {
      setFormError("Debe seleccionar un estado.");
      return;
    }

    setFormLoading(true);

    const datosEnviar = modoEdicion
      ? {
          IdContacto: form.idContacto,
          IdPersona: form.idPersona,
          IdTipoContacto: form.idTipoContacto,
          ValorContacto: form.valorContacto.trim(),
          IdEstado: form.idEstado,
        }
      : {
          IdPersona: form.idPersona,
          IdTipoContacto: form.idTipoContacto,
          ValorContacto: form.valorContacto.trim(),
          IdEstado: form.idEstado,
        };

    try {
      const res = modoEdicion
        ? await contactoService.actualizarContacto(datosEnviar)
        : await contactoService.insertarContacto(datosEnviar);

      if (res.numero >= 0) {
        Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
        cerrarModal();
        cargarDatos();
      } else {
        setFormError(res.mensaje || "Error en la operación");
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "Error inesperado";
      setFormError(mensajeError);
    } finally {
      setFormLoading(false);
    }
  };

  const textoBusqueda = (busqueda || "").toLowerCase().trim();
  const contactosFiltrados = contactos.filter((c) => {
    const persona = personas.find((p) => p.idPersona === c.idPersona);
    const nombrePersona = persona
      ? `${persona.primerNombre} ${persona.segundoNombre || ""} ${persona.primerApellido} ${persona.segundoApellido || ""}`.toLowerCase()
      : "";

    const tipoContacto = catalogos.find((cat) => cat.idCatalogo === c.idTipoContacto)?.descripcionCatalogo.toLowerCase() || "";

    return (
      tipoContacto.includes(textoBusqueda) ||
      (c.valorContacto && c.valorContacto.toLowerCase().includes(textoBusqueda)) ||
      nombrePersona.includes(textoBusqueda)
    );
  });

  const activos = contactosFiltrados.filter((c) => c.idEstado === 1).length;
  const inactivos = contactosFiltrados.length - activos;

  const totalPaginas = Math.ceil(contactosFiltrados.length / filasPorPagina);
  const inicio = (paginaActual - 1) * filasPorPagina;
  const paginados = contactosFiltrados.slice(inicio, inicio + filasPorPagina);

  const columnas = [
    {
      key: "nombrePersona",
      label: "Persona",
      render: (item) => {
        const persona = personas.find((p) => p.idPersona === item.idPersona);
        if (!persona) return "-";
        return `${persona.primerNombre} ${persona.segundoNombre || ""} ${persona.primerApellido} ${persona.segundoApellido || ""}`.trim();
      },
    },
    {
      key: "tipoContacto",
      label: "Tipo Contacto",
      render: (item) => {
        const tipo = catalogos.find(
          (cat) => cat.idCatalogo === item.idTipoContacto && cat.idTipoCatalogo === 7
        );
        return tipo ? tipo.descripcionCatalogo : "-";
      },
    },
    { key: "valorContacto", label: "Valor" },
    {
      key: "estado",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.idEstado === 1 ? (
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
    <div className="p-4">
      <div className={`shadow-lg rounded-xl p-6 ${fondo}`}>
        <h2
          className={`text-2xl md:text-3xl font-extrabold tracking-wide cursor-pointer select-none ${texto}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          aria-controls="contactosContent"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? "►" : "▼"} Gestión de Contactos
        </h2>

        {!isCollapsed && (
          <div id="contactosContent" className="mt-4">
            <ContadoresBase
              activos={activos}
              inactivos={inactivos}
              total={contactosFiltrados.length}
              modoOscuro={modoOscuro}
              onNuevo={abrirModalNuevo}
            />

          <TablaBase
            datos={paginados}
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
        )}

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo={modoEdicion ? "Editar Contacto" : "Nuevo Contacto"}
          >
            <div className="space-y-4">
              <div className="relative" ref={inputPersonaRef}>
                <input
                  type="text"
                  value={filtroPersona}
                  onChange={(e) => {
                    setFiltroPersona(e.target.value);
                    setMostrarDropdownPersona(true);
                  }}
                  onFocus={() => setMostrarDropdownPersona(true)}
                  placeholder="Buscar persona..."
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {mostrarDropdownPersona && (
                  <ul className="absolute z-10 w-full max-h-40 overflow-auto border rounded mt-1 dark:bg-gray-800 bg-white text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    {personas.filter((p) => {
                      const nombre = `${p.primerNombre} ${p.segundoNombre || ""} ${p.primerApellido} ${p.segundoApellido || ""}`.toLowerCase();
                      return nombre.includes(filtroPersona.toLowerCase());
                    }).map((p) => (
                      <li
                        key={p.idPersona}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, idPersona: p.idPersona }));
                          setFiltroPersona(`${p.primerNombre} ${p.primerApellido}`);
                          setMostrarDropdownPersona(false);
                        }}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-500 hover:text-white"
                      >
                        {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido} {p.segundoApellido || ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <select
                name="idTipoContacto"
                value={form.idTipoContacto || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Tipo de Contacto *</option>
                {catalogos
                  .filter((c) => c.idTipoCatalogo === 7)
                  .map((c) => (
                    <option key={c.idCatalogo} value={c.idCatalogo}>
                      {c.descripcionCatalogo}
                    </option>
                  ))}
              </select>

              <input
                type="text"
                name="valorContacto"
                placeholder="Valor del Contacto *"
                value={form.valorContacto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />

              <select
                name="idEstado"
                value={form.idEstado || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Estado *</option>
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

export default FrmContacto;
