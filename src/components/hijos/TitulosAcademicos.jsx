import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import tituloAcademicoService from "../../services/TitulosAcademicos";
import personaService from "../../services/Persona";
import catalogoService from "../../services/Catalogos";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmTitulosAcademicos = ({ busqueda, onResultados }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [titulos, setTitulos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState([]);
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
    idTituloAcademico: 0,
    idPersona: "",
    idNivelAcademico: "",
    especialidad: "",
    idEstado: "",
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resTitulos, resPersonas, resNiveles, resEstados] = await Promise.all([
        tituloAcademicoService.listarTitulos(),          // Array
        personaService.listarPersonas(),                  // { success, data }
        catalogoService.filtrarPorTipoCatalogo(6),       // { resultado, numero, mensaje }
        estadoService.listarEstados(),                    // { success, data }
      ]);
      if (!Array.isArray(resTitulos)) throw new Error('Respuesta de títulos no es un array');
      if (!resPersonas.success) throw new Error(resPersonas.message || 'Error al cargar personas');
      if (resNiveles.numero !== 0) throw new Error(resNiveles.mensaje || 'Error al cargar niveles académicos');
      if (!resEstados.success) throw new Error(resEstados.message || 'Error al cargar estados');

      setTitulos(resTitulos || []);
      setPersonas(resPersonas.data || []);
      setNivelesAcademicos(resNiveles.resultado || []);
      setEstados(resEstados.data || []);
    } catch (error) {
      console.error("Error al cargar títulos académicos:", error);
      setFormError(error.message || "Error al cargar datos.");
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
    setForm({ idTituloAcademico: 0, idPersona: "", idNivelAcademico: "", especialidad: "", idEstado: "" });
    setFormError("");
    setModoEdicion(false);
    setFiltroPersona("");
    setMostrarDropdown(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (titulo) => {
    setForm({
      idTituloAcademico: titulo.idTituloAcademico || 0,
      idPersona: titulo.idPersona || "",
      idNivelAcademico: titulo.idNivelAcademico || "",
      especialidad: titulo.especialidad || "",
      idEstado: titulo.idEstado || "",
    });
    setFormError("");
    setModoEdicion(true);
    setFiltroPersona("");
    setMostrarDropdown(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
    setFiltroPersona("");
    setMostrarDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["idPersona", "idNivelAcademico", "idEstado"].includes(name) ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    const camposRequeridos = ["idPersona", "idNivelAcademico", "especialidad", "idEstado"];
    for (const campo of camposRequeridos) {
      if (!form[campo] || form[campo].toString().trim() === "") {
        setFormError("Todos los campos marcados con * son obligatorios.");
        return;
      }
    }

    setFormLoading(true);

    // Mapeo para backend (pascalCase esperado)
    const datosEnviar = {
      iD_TituloAcademico: form.idTituloAcademico || 0,
      iD_Persona: Number(form.idPersona),
      iD_NivelAcademico: Number(form.idNivelAcademico),
      especialidad: form.especialidad.trim(),
      iD_Estado: Number(form.idEstado),
    };

    // Si es nuevo, no enviar el ID
    if (!modoEdicion) delete datosEnviar.iD_TituloAcademico;

    try {
      const res = modoEdicion
        ? await tituloAcademicoService.actualizarTitulo(datosEnviar)
        : await tituloAcademicoService.insertarTitulo(datosEnviar);

      if (res.numero >= 0) {
        Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
        cerrarModal();
        cargarDatos();
      } else {
        Swal.fire("Error", res.mensaje || "Error en la operación", "error");
      }
    } catch (error) {
      cerrarModal();
      const msg =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "Error inesperado";
      Swal.fire("Error", msg, "error");
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const textoBusqueda = (busqueda || "").toLowerCase().trim();
  const titulosFiltrados = titulos.filter((t) => {
    const persona = t.nombrePersona?.toLowerCase() || "";
    const nivel = t.nivelAcademico?.toLowerCase() || "";
    const especialidad = t.especialidad?.toLowerCase() || "";
    return (
      persona.includes(textoBusqueda) ||
      nivel.includes(textoBusqueda) ||
      especialidad.includes(textoBusqueda)
    );
  });

  const totalPaginas = Math.ceil(titulosFiltrados.length / filasPorPagina);
  const inicio = (paginaActual - 1) * filasPorPagina;
  const titulosPaginados = titulosFiltrados.slice(inicio, inicio + filasPorPagina);

  const activos = titulosFiltrados.filter((t) => t.idEstado === 1).length;
  const inactivos = titulosFiltrados.length - activos;
useEffect(() => {
  if (typeof onResultados === "function") {
    onResultados(titulosFiltrados.length > 0);
  }
}, [titulosFiltrados, onResultados]);

  // Si no hay resultados y no está cargando, no mostrar nada
  if (!loading && titulosFiltrados.length === 0) {
    return null;
  }
  const columnas = [
    { key: "nombrePersona", label: "Persona" },
    { key: "nivelAcademico", label: "Nivel Académico" },
    { key: "especialidad", label: "Especialidad" },
    { key: "creador", label: "Creador" },
    {
      key: "fechaCreacion",
      label: "Fecha creación",
      render: (item) => formatearFecha(item.fechaCreacion),
    },
    { key: "modificador", label: "Modificador" },
    {
      key: "fechaModificacion",
      label: "Fecha modificación",
      render: (item) => formatearFecha(item.fechaModificacion),
    },
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
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide mb-4 ${texto}`}>
          Títulos Académicos
        </h2>

        <ContadoresBase
          activos={activos}
          inactivos={inactivos}
          total={titulosFiltrados.length}
          modoOscuro={modoOscuro}
          onNuevo={abrirModalNuevo}
        />

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
          datos={titulosPaginados}
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

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo={modoEdicion ? "Editar Título Académico" : "Nuevo Título Académico"}
          >
            <div className="space-y-4">
              {/* Input autocompletado Persona */}
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
                  autoComplete="off"
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

              {/* Nivel Académico */}
              <select
                name="idNivelAcademico"
                value={form.idNivelAcademico}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                }`}
                required
              >
                <option value="">Seleccione Nivel Académico *</option>
                {nivelesAcademicos.map((n) => (
                  <option key={n.idCatalogo} value={n.idCatalogo}>
                    {n.descripcionCatalogo}
                  </option>
                ))}
              </select>

              {/* Especialidad */}
              <input
                type="text"
                name="especialidad"
                value={form.especialidad}
                onChange={handleInputChange}
                placeholder="Especialidad *"
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                }`}
                required
              />

              {/* Estado */}
              <select
                name="idEstado"
                value={form.idEstado}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                }`}
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
      </div>
    </div>
  );
};

export default FrmTitulosAcademicos;
