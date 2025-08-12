import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import personaService from "../../services/Persona";
import catalogoService from "../../services/Catalogos";
import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import estadoService from "../../services/Estado";
import { FaCheckCircle } from "react-icons/fa";

const FrmPersonas = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [personas, setPersonas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [estados, setEstados] = useState([]);
  const [filtros, setFiltros] = useState({ texto: "", genero: "", tipoDocumento: "", nacionalidad: "",  estado: "" });

  const [generos, setGeneros] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const [form, setForm] = useState({
    idPersona: 0,
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    idGenero: "",
    idTipoDocumento: "",
    numeroDocumento: "",
    idNacionalidad: "",
    estado: "",
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-NI", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const adaptarDatosPersonas = (datos) =>
    datos.map((p) => ({
      idPersona: p.idPersona,
      primerNombre: p.primerNombre,
      segundoNombre: p.segundoNombre,
      primerApellido: p.primerApellido,
      segundoApellido: p.segundoApellido,
      idGenero: p.generoId || "",
      idTipoDocumento: p.tipoDocumentoId || "",
      idNacionalidad: p.nacionalidadId || "",
      numeroDocumento: p.numeroDocumento || "-",
      nombreGenero: p.nombreGenero || "-",
      nombreTipoDocumento: p.nombreTipoDocumento || "-",
      nombreNacionalidad: p.nombreNacionalidad || "-",
      activo: p.estado === "Activo",
      estado: p.idEstado || "",
      fechaCreacion: formatearFecha(p.fechaCreacion),
      fechaModificacion: formatearFecha(p.fechaModificacion),
      nombreCreador: p.creador || "-",
      nombreModificador: p.modificador || "-",
    }));

  useEffect(() => {
    cargarCatalogos();
    cargarPersonas();
    cargarEstados();
  }, []);

  const cargarEstados = async () => {
    const res = await estadoService.listarEstados();
    if (res.success) {
      setEstados(res.data.filter((e, i, arr) => arr.findIndex(o => o.iD_Estado === e.iD_Estado) === i));
    } else Swal.fire("Error", res.message, "error");
  };

  const cargarCatalogos = async () => {
    try {
      const res = await catalogoService.listarCatalogo();
      if (res.numero === 0 && Array.isArray(res.resultado)) {
        const catalogo = res.resultado;
        setGeneros(catalogo.filter(c => c.idTipoCatalogo === 1));
        setTiposDocumento(catalogo.filter(c => c.idTipoCatalogo === 3));
        setNacionalidades(catalogo.filter(c => c.idTipoCatalogo === 2));
      } else Swal.fire("Error", "No se pudo cargar el catálogo", "error");
    } catch {
      Swal.fire("Error", "Error al cargar el catálogo", "error");
    }
  };

  const cargarPersonas = async () => {
    setLoading(true);
    const res = await personaService.listarPersonas();
    if (res.success && Array.isArray(res.data)) setPersonas(adaptarDatosPersonas(res.data));
    else Swal.fire("Error", res.message || "Error al cargar personas", "error");
    setLoading(false);
  };

  const abrirModalNuevo = () => {
    setForm({ idPersona: 0, primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "", idGenero: "", idTipoDocumento: "", numeroDocumento: "", idNacionalidad: "", estado: "" });
    setFormError(""); setModoEdicion(false); setModalOpen(true);
  };

  const abrirModalEditar = (persona) => {
    setForm({
      idPersona: persona.idPersona,
      primerNombre: persona.primerNombre,
      segundoNombre: persona.segundoNombre,
      primerApellido: persona.primerApellido,
      segundoApellido: persona.segundoApellido,
      idGenero: persona.idGenero,
      idTipoDocumento: persona.idTipoDocumento,
      numeroDocumento: persona.numeroDocumento,
      idNacionalidad: persona.idNacionalidad,
      estado: persona.estado,
    });
    setFormError(""); setModoEdicion(true); setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setFormError(""); setFormLoading(false); };

  const handleInputChange = (e) => { const { name, value } = e.target; const newValue = name === "estado" ? Number(value) : value; setForm({ ...form, [name]: newValue }); };

  const handleGuardar = async () => {
    if (!form.primerNombre.trim() || !form.primerApellido.trim()) {
      setFormError("El primer nombre y primer apellido son obligatorios."); return;
    }
    if (!form.idGenero || !form.idTipoDocumento || !form.idNacionalidad ) {
      setFormError("Debe seleccionar Género, Tipo Documento y Nacionalidad."); return;
    }
    if (!form.numeroDocumento.trim()) {
      setFormError("El número de documento es obligatorio."); return;
    }

    setFormLoading(true);
    const datosEnviar = {
      idPersona: modoEdicion ? form.idPersona : 0,
      primerNombre: form.primerNombre.trim(),
      segundoNombre: form.segundoNombre.trim() || null,
      primerApellido: form.primerApellido.trim(),
      segundoApellido: form.segundoApellido.trim() || null,
      generoId: Number(form.idGenero) || null,
      tipoDocumentoId: Number(form.idTipoDocumento) || null,
      numeroDocumento: form.numeroDocumento.trim() || null,
      nacionalidadId: Number(form.idNacionalidad) || null,
      idEstado: Number(form.estado),
    };

    const res = modoEdicion
      ? await personaService.actualizarPersona(datosEnviar)
      : await personaService.insertarPersona(datosEnviar);

    setFormLoading(false);
    if (res.success) {
      cerrarModal();
      Swal.fire(modoEdicion ? "Actualizado" : "Agregado", res.message, "success");
      cargarPersonas();
    } else Swal.fire("Error", res.message, "error");
  };

  const textoBusqueda = (busqueda || "").trim().toLowerCase();
  const datosFiltrados = personas.filter((p) => {
    const coincideTexto = `${p.primerNombre} ${p.segundoNombre} ${p.primerApellido} ${p.segundoApellido} ${p.numeroDocumento}`.toLowerCase().includes(textoBusqueda);
    const coincideTipoDoc = !filtros.tipoDocumento || p.nombreTipoDocumento === filtros.tipoDocumento;
    const coincideGenero = !filtros.genero || p.nombreGenero === filtros.genero;
    const coincideNacionalidad = !filtros.nacionalidad || p.nombreNacionalidad === filtros.nacionalidad;
    const coincideEstado = !filtros.estado || (filtros.estado === "Activo" ? p.activo : !p.activo);
    return coincideTexto && coincideTipoDoc && coincideGenero && coincideNacionalidad && coincideEstado;
  });

  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const datosPaginados = datosFiltrados.slice(inicio, fin);

  const columnas = [
    { key: "primerNombre", label: "Primer Nombre" },
    { key: "segundoNombre", label: "Segundo Nombre" },
    { key: "primerApellido", label: "Primer Apellido" },
    { key: "segundoApellido", label: "Segundo Apellido" },
    { key: "nombreGenero", label: "Género" },
    { key: "nombreTipoDocumento", label: "Tipo Documento" },
    { key: "numeroDocumento", label: "Número Documento" },
    { key: "nombreNacionalidad", label: "Nacionalidad" },
    { key: "nombreCreador", label: "Creador" },
    { key: "nombreModificador", label: "Modificador" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    { key: "activo", label: "Estado", render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">
            <FaCheckCircle size={20} />
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            <FaCheckCircle size={20} className="rotate-45" />
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
            Persona
          </h2>
        </div>
 
      
        <div id="personasContent" className="mt-4">
          {/* FILTROS */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            
            <select
              value={filtros.tipoDocumento}
              onChange={(e) => setFiltros({ ...filtros, tipoDocumento: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Tipo Doc.</option>
              {tiposDocumento.map((td) => (
                <option key={td.idCatalogo} value={td.descripcionCatalogo}>
                  {td.descripcionCatalogo}
                </option>
              ))}
            </select>
            <select
              value={filtros.genero}
              onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Género</option>
              {generos.map((g) => (
                <option key={g.idCatalogo} value={g.descripcionCatalogo}>
                  {g.descripcionCatalogo}
                </option>
              ))}
            </select>
            <select
              value={filtros.nacionalidad}
              onChange={(e) => setFiltros({ ...filtros, nacionalidad: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Nacionalidad</option>
              {nacionalidades.map((n) => (
                <option key={n.idCatalogo} value={n.descripcionCatalogo}>
                  {n.descripcionCatalogo}
                </option>
              ))}
            </select>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
           <div className="mb-4">
          <label className={`mr-2 ${texto}`}>Mostrar:</label>
          <select
            value={itemsPorPagina}
            onChange={(e) => {
              setItemsPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
            className="px-2 py-1 border rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>


          {/* CONTADORES */}
          <ContadoresBase
            activos={personas.filter((p) => p.activo).length}
            inactivos={personas.filter((p) => !p.activo).length}
            total={personas.length}
            onNuevo={abrirModalNuevo}
            modoOscuro={modoOscuro}
          />

          {/*cantida *//* TABLA */}
          <TablaBase
        
            datos={datosPaginados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            onEditar={abrirModalEditar}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
          />
                  {/* Paginación */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span className={texto}>
            Página {paginaActual} de {Math.ceil(datosFiltrados.length / itemsPorPagina)}
          </span>
          <button
            onClick={() =>
              setPaginaActual((prev) =>
                prev < Math.ceil(datosFiltrados.length / itemsPorPagina) ? prev + 1 : prev
              )
            }
            className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
            disabled={paginaActual >= Math.ceil(datosFiltrados.length / itemsPorPagina)}
          >
            Siguiente
          </button>
        </div>

        </div>
    

      {/* MODAL */}
      <ModalBase
        isOpen={modalOpen}
        onClose={cerrarModal}
        titulo={modoEdicion ? "Editar Persona" : "Nueva Persona"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          modoEdicion={modoEdicion}
          titulo="Persona"
        >
         

            <div className="space-y-4">
              <input type="text" name="primerNombre" placeholder="Primer Nombre" value={form.primerNombre} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" autoFocus />
              <input type="text" name="segundoNombre" placeholder="Segundo Nombre" value={form.segundoNombre} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              <input type="text" name="primerApellido" placeholder="Primer Apellido" value={form.primerApellido} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              <input type="text" name="segundoApellido" placeholder="Segundo Apellido" value={form.segundoApellido} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
             <select
  name="idGenero"
  value={form.idGenero}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
>
  <option value="">Seleccione Género</option>
  {generos.map((g) => (
    <option key={g.idCatalogo} value={g.idCatalogo}>
      {g.descripcionCatalogo}
    </option>
  ))}
</select>

<select
  name="idTipoDocumento"
  value={form.idTipoDocumento}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
>
  <option value="">Seleccione Tipo Documento</option>
  {tiposDocumento.map((t) => (
    <option key={t.idCatalogo} value={t.idCatalogo}>
      {t.descripcionCatalogo}
    </option>
  ))}
</select>

<input
  type="text"
  name="numeroDocumento"
  placeholder="Número de Documento"
  value={form.numeroDocumento?.toString() ?? ""}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
/>

<select
  name="idNacionalidad"
  value={form.idNacionalidad}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
>
  <option value="">Seleccione Nacionalidad</option>
  {nacionalidades.map((n) => (
    <option key={n.idCatalogo} value={n.idCatalogo}>
      {n.descripcionCatalogo}
    </option>
  ))}
</select>
<select
  name="estado"
  value={form.estado}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
>
  <option value="">Seleccione estado</option>
  {estados
   .filter(e => e.iD_Estado === 1 || e.iD_Estado === 2).map((e) => (
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

export default FrmPersonas;