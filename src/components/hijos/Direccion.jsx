import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRef } from "react";

import direccionService from "../../services/Direccion";
import personaService from "../../services/Persona";
import catalogoService from "../../services/Catalogos";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmDirecciones = ({ busqueda, onResultados }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth?.rol);
  const esAdmin = rol?.toLowerCase() === "administrador";
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [direcciones, setDirecciones] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [filtroPersona, setFiltroPersona] = useState("");
  const contenedorRef = useRef(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idDireccion: 0,
    idPersona: "",
    idTipoDireccion: "",
    detalleDireccion: "",
    codigoPostal: "",
    municipio: "",
    departamento: "",
    referencia: "",
    idEstado: "",
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resDirecciones, resPersonas, resCatalogos, resEstados] = await Promise.all([
        direccionService.listarDirecciones(),
        personaService.listarPersonas(),
        catalogoService.filtrarPorTipoCatalogo(9),
        estadoService.listarEstados(),
      ]);
      setDirecciones(resDirecciones.resultado || []);
      setPersonas(resPersonas?.data || []);
      setCatalogos(resCatalogos.resultado || []);
      setEstados(resEstados?.data || []);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      setDirecciones([]);
      setFormError("Error al cargar direcciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
  const handleClickFuera = (e) => {
    if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
      setMostrarDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickFuera);
  return () => document.removeEventListener("mousedown", handleClickFuera);
}, []);

const personasFiltradas = personas.filter((p) =>
  `${p.primerNombre} ${p.segundoNombre || ""} ${p.primerApellido} ${p.segundoApellido || ""}`
    .toLowerCase()
    .includes(filtroPersona.toLowerCase())
);

  const abrirModalNuevo = () => {
    setForm({
      idDireccion: 0,
      idPersona: "",
      idTipoDireccion: "",
      detalleDireccion: "",
      codigoPostal: "",
      municipio: "",
      departamento: "",
      referencia: "",
      idEstado: "",
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (direccion) => {
    setForm({
      idDireccion: direccion.idDireccion,
      idPersona: direccion.idPersona,
      idTipoDireccion: direccion.idTipoDireccion,
      detalleDireccion: direccion.detalleDireccion || "",
      codigoPostal: direccion.codigoPostal || "",
      municipio: direccion.municipio || "",
      departamento: direccion.departamento || "",
      referencia: direccion.referencia || "",
      idEstado: direccion.idEstado,
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
      [name]: ["idPersona", "idTipoDireccion", "idEstado"].includes(name) ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    const camposRequeridos = ["idPersona", "idTipoDireccion", "detalleDireccion", "codigoPostal", "municipio", "departamento", "idEstado"];
    for (const campo of camposRequeridos) {
      if (!form[campo] || form[campo].toString().trim() === "") {
        setFormError("Todos los campos marcados con * son obligatorios.");
        return;
      }
    }

    setFormLoading(true);
    const datosEnviar = { ...form };
    if (!modoEdicion) delete datosEnviar.idDireccion;

   try {
  const res = modoEdicion
    ? await direccionService.actualizarDireccion(datosEnviar)
    : await direccionService.insertarDireccion(datosEnviar);

  if (res.numero >= 0) {
    Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
    cerrarModal();
    cargarDatos();
  } else {
    const mensaje = res.mensaje || "Error en la operación";
    Swal.fire("Error", mensaje, "error"); 
  }
} catch (error) {
  cerrarModal();
  const mensajeError =
    error.response?.data?.mensaje ||
    error.response?.data?.error ||
    error.message ||
    "Error inesperado";
  Swal.fire("Error", mensajeError, "error"); 
} finally {
  setFormLoading(false);
}
  };

  const textoBusqueda = (busqueda || "").toLowerCase().trim();
  const direccionesFiltradas = direcciones.filter((d) => {
    const persona = d.nombrePersona?.toLowerCase() || "";
    const tipo = d.tipoDireccion?.toLowerCase() || "";
    const detalle = d.detalleDireccion?.toLowerCase() || "";
    return (
      persona.includes(textoBusqueda) ||
      tipo.includes(textoBusqueda) ||
      detalle.includes(textoBusqueda)
    );
  });

  // Informar al padre si hay resultados filtrados
useEffect(() => {
  if (typeof onResultados === "function") {
    onResultados(direccionesFiltradas.length > 0);
  }
}, [direccionesFiltradas, onResultados]);
if (direccionesFiltradas.length === 0) {
  return null; // o podrías retornar un mensaje
}

  const totalPaginas = Math.ceil(direccionesFiltradas.length / filasPorPagina);
  const inicio = (paginaActual - 1) * filasPorPagina;
  const direccionesPaginadas = direccionesFiltradas.slice(inicio, inicio + filasPorPagina);

  const activos = direccionesFiltradas.filter((d) => d.idEstado === 1).length;
  const inactivos = direccionesFiltradas.length - activos;

 const columnasBase = [
  { key: "nombrePersona", label: "Persona" },
  { key: "tipoDireccion", label: "Tipo Dirección" },
  { key: "detalleDireccion", label: "Detalle" },
  { key: "codigoPostal", label: "Código Postal" },
  { key: "municipio", label: "Municipio" },
  { key: "departamento", label: "Departamento" },
  { key: "referencia", label: "Referencia" },
  { key: "estado", label: "Estado", className: "text-center w-20", render: (item) =>
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

const columnas = esAdmin
  ? [
      ...columnasBase.slice(0, 7),
      { key: "fechaCreacion", label: "Fecha Creación", render: (item) => item.fechaCreacion?.slice(0, 10) },
      { key: "fechaModificacion", label: "Fecha Modificación", render: (item) => item.fechaModificacion?.slice(0, 10) },
      columnasBase[7], // estado
    ]
  : columnasBase;

  
  return (
    <div className="p-4">
      <div className={`shadow-lg rounded-xl p-6 ${fondo}`}>
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide mb-4 ${texto}`}>
          Direcciones
        </h2>

        <ContadoresBase
          activos={activos}
          inactivos={inactivos}
          total={direccionesFiltradas.length}
          modoOscuro={modoOscuro}
          onNuevo={abrirModalNuevo}
        />

        {/* SELECT FILAS */}
        <div className="mb-2 flex justify-start items-center gap-2 text-sm">
          <label htmlFor="filasPorPagina" className="font-semibold select-none">
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
            {[1, 10, 30, 45, 60, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <TablaBase
          datos={direccionesPaginadas}
          columnas={columnas}
          modoOscuro={modoOscuro}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
          onEditar={abrirModalEditar}
        />

        {/* BOTONES SIGUIENTES */}
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
            titulo={modoEdicion ? "Editar Dirección" : "Nueva Dirección"}
          >
            <div className="space-y-4">
              <div className="relative" ref={contenedorRef}>
                <input
                  type="text"
                  placeholder="Buscar Persona *"
                  className={`w-full px-3 py-2 border rounded transition-colors
                    ${modoOscuro
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-300"
                      : "bg-white text-black border-gray-300 placeholder-gray-500"}`}
                  value={
                    form.idPersona
                      ? `${personas.find((p) => p.idPersona === form.idPersona)?.primerNombre || ""} ${
                          personas.find((p) => p.idPersona === form.idPersona)?.segundoNombre || ""
                        } ${personas.find((p) => p.idPersona === form.idPersona)?.primerApellido || ""} ${
                          personas.find((p) => p.idPersona === form.idPersona)?.segundoApellido || ""
                        }`
                      : filtroPersona
                  }
                  onChange={(e) => {
                    setFiltroPersona(e.target.value);
                    setMostrarDropdown(true);
                    setForm((prev) => ({ ...prev, idPersona: "" }));
                  }}
                  onFocus={() => setMostrarDropdown(true)}
                  required
                />
                {mostrarDropdown && personasFiltradas.length > 0 && (
                  <ul
                    className={`absolute z-10 w-full border max-h-60 overflow-auto rounded shadow-lg mt-1 transition-colors
                      ${modoOscuro
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-black"}`}
                  >
                    {personasFiltradas.map((p) => (
                      <li
                        key={p.idPersona}
                        className={`px-3 py-2 cursor-pointer transition-colors
                          ${modoOscuro ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, idPersona: p.idPersona }));
                          setFiltroPersona("");
                          setMostrarDropdown(false);
                        }}
                      >
                        {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido} {p.segundoApellido || ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <select name="idTipoDireccion" value={form.idTipoDireccion} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
                <option value="">Seleccione Tipo de Dirección *</option>
                {catalogos.map((c) => (
                  <option key={c.idCatalogo} value={c.idCatalogo}>
                    {c.descripcionCatalogo}
                  </option>
                ))}
              </select>

              <input type="text" name="detalleDireccion" value={form.detalleDireccion} onChange={handleInputChange} placeholder="Detalle *" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
              <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleInputChange} placeholder="Código Postal *" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
              <input type="text" name="municipio" value={form.municipio} onChange={handleInputChange} placeholder="Municipio *" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
              <input type="text" name="departamento" value={form.departamento} onChange={handleInputChange} placeholder="Departamento *" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
              <input type="text" name="referencia" value={form.referencia} onChange={handleInputChange} placeholder="Referencia" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />

              <select name="idEstado" value={form.idEstado} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
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
      </div>
    </div>
  );
};

export default FrmDirecciones;
