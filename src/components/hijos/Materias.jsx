import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import materiaService from "../../services/Materias";
import carrerasService from "../../services/Carreras";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmMaterias = () => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const { idUsuario } = useSelector((state) => state.auth.usuario);

  // Estados locales
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Para autocompletado carrera
  const [inputCarrera, setInputCarrera] = useState("");
  const [mostrarDropdownCarrera, setMostrarDropdownCarrera] = useState(false);
  const wrapperRef = useRef(null);
  const bloquearAbrirDropdown = useRef(false);


const handleFocus = () => {
  if (!bloquearAbrirDropdown.current) {
    setMostrarDropdownCarrera(true);
  }
};

  const [formData, setFormData] = useState({
    idMateria: 0,
    nombreMateria: "",
    descripcion: "",
    idPeriodoAcademico: 0,
    carrera: 0,
    idEstado: 1,
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Formatear fecha
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

  // Obtener materias
  const obtenerMaterias = async () => {
    try {
      const data = await materiaService.listarMaterias();
      const materiasMapeadas = data.map((m) => ({
        idMateria: m.idMateria ?? 0,
        nombreMateria: m.nombreMateria ?? m.nombre ?? "",
        descripcion: m.descripcion ?? "",
        idPeriodoAcademico: m.idPeriodoAcademico ?? 0,
        carrera: m.idCarrera ?? 0,
        idEstado: m.idEstado ?? 1,
        fechaCreacion: m.fechaCreacion ?? m.fecha_Creacion ?? "",
        fechaModificacion: m.fechaModificacion ?? m.fecha_Modificacion ?? "",
        creadoPor: m.creadoPor ?? m.creador ?? "-",
        modificadoPor: m.modificadoPor ?? m.modificador ?? "-",
      }));
      setMaterias(materiasMapeadas);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
    }
  };

  // Obtener carreras
  const obtenerCarreras = async () => {
    try {
      const data = await carrerasService.listarCarreras(); // ya es un arreglo

      const carrerasMap = data.map((c) => ({
        idCarrera: c.iD_Carrera ?? 0,
        nombre: c.nombreCarrera ?? "N/D",
      }));

      setCarreras(carrerasMap);

      if (carrerasMap.length > 0 && formData.carrera === 0) {
        setFormData((f) => ({ ...f, carrera: carrerasMap[0].idCarrera }));
        setInputCarrera(carrerasMap[0].nombre);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar las carreras", "error");
    }
  };

  // Obtener estados activos e inactivos
  const obtenerEstados = async () => {
    try {
      const response = await estadoService.listarEstados();
      console.log("Respuesta listarEstados:", response);

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Respuesta inválida del servicio de estados");
      }

      const filtrados = response.data
        .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
        .map((e) => ({
          idEstado: e.iD_Estado,
          nombreEstado: e.nombre_Estado,
        }));

      setEstados(filtrados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los estados", "error");
    }
  };

  // Al montar
  useEffect(() => {
    obtenerMaterias();
    obtenerCarreras();
    obtenerEstados();
  }, []);

  // Filtrado por búsqueda (por nombreMateria)
  const materiasFiltradas = materias.filter((m) =>
    m.nombreMateria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación cálculos
  const total = materiasFiltradas.length;
  const activos = materiasFiltradas.filter((m) => m.idEstado === 1).length;
  const inactivos = materiasFiltradas.filter((m) => m.idEstado === 2).length;

  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados = materiasFiltradas.slice(indexPrimeraFila, indexUltimaFila);
  const totalPaginas = Math.ceil(total / filasPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    setFormData({
      idMateria: 0,
      nombreMateria: "",
      descripcion: "",
      idPeriodoAcademico: 0,
      carrera: carreras.length > 0 ? carreras[0].idCarrera : 0,
      idEstado: 1,
    });
    setInputCarrera(carreras.length > 0 ? carreras[0].nombre : "");
    setModoEdicion(false);
    setModalOpen(true);
  };

  // Abrir modal editar
  const abrirModalEditar = (m) => {
    const carreraObj = carreras.find((c) => c.idCarrera === m.carrera);
    setFormData({
      idMateria: m.idMateria,
      nombreMateria: m.nombreMateria,
      descripcion: m.descripcion,
      idPeriodoAcademico: m.idPeriodoAcademico,
      carrera: m.carrera,
      idEstado: m.idEstado,
    });
    setInputCarrera(carreraObj ? carreraObj.nombre : "");
    setModoEdicion(true);
    setModalOpen(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalOpen(false);
    setMostrarDropdownCarrera(false);
  };

  // Manejo formulario inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "carreraInput") {
      setInputCarrera(value);
      setMostrarDropdownCarrera(true);
      return;
    }

    setFormData({
      ...formData,
      [name]:
        name === "idPeriodoAcademico" ||
        name === "carrera" ||
        name === "idEstado"
          ? Number(value)
          : value,
    });
  };

  // Cuando el usuario selecciona una carrera del dropdown
 
const seleccionarCarrera = (carrera) => {
  setFormData((f) => ({ ...f, carrera: carrera.idCarrera }));
  setInputCarrera(carrera.nombre);
  setMostrarDropdownCarrera(false);

  bloquearAbrirDropdown.current = true;
  setTimeout(() => {
    bloquearAbrirDropdown.current = false;
  }, 200);
};;

  // Guardar (insertar o actualizar)
  const handleGuardar = async () => {
    if (!formData.nombreMateria.trim()) {
      Swal.fire("Error", "El nombre de la materia es obligatorio", "error");
      return;
    }
    if (formData.carrera === 0) {
      Swal.fire("Error", "Debe seleccionar una carrera", "error");
      return;
    }
    if (formData.idEstado === 0) {
      Swal.fire("Error", "Debe seleccionar un estado válido", "error");
      return;
    }

    setFormLoading(true);

    try {
      let payload = { ...formData };

      let res;
      if (modoEdicion) {
        res = await materiaService.actualizarMateria(payload);
      } else {
        res = await materiaService.insertarMateria(payload);
      }

      if (res?.numero === -1 || res?.success === false) {
        Swal.fire("Error", res.mensaje || "Error desconocido", "error");
        setFormLoading(false);
        return;
      }

      Swal.fire(
        "Éxito",
        modoEdicion
          ? "Materia actualizada correctamente"
          : "Materia registrada correctamente",
        "success"
      );

      cerrarModal();
      obtenerMaterias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la materia", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Íconos estado
  const renderEstadoIcono = (idEstado) => {
    if (idEstado === 1)
      return (
        <FaCheckCircle
          title="Activo"
          aria-label="Activo"
          className="text-green-500 text-xl mx-auto"
        />
      );
    if (idEstado === 2)
      return (
        <FaTimesCircle
          title="Inactivo"
          aria-label="Inactivo"
          className="text-red-500 text-xl mx-auto"
        />
      );
    return null;
  };

  // Estilos input
  const inputClass =
    "w-full px-3 py-2 border rounded focus:outline-none " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600");

  // Paginación botones
  const handlePaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((p) => p - 1);
  };
  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual((p) => p + 1);
  };

  // Cerrar dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarDropdownCarrera(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Filtrar carreras para dropdown
  const carrerasFiltradas = carreras.filter((c) =>
    c.nombre.toLowerCase().includes(inputCarrera.toLowerCase())
  );

  return (
  <>
    <div className="flex justify-between items-center mb-4">
      <h2
        className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
          modoOscuro ? "text-white" : "text-gray-800"
        }`}
      >
        Materias
      </h2>
    </div>

    <BuscadorBase
      placeholder="Buscar materia por nombre..."
      valor={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      modoOscuro={modoOscuro}
    />

    <ContadoresBase
      activos={activos}
      inactivos={inactivos}
      total={total}
      onNuevo={abrirModalNuevo}
      modoOscuro={modoOscuro}
    />

    <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
      <label htmlFor="filasPorPagina" className="font-semibold">
        Filas por página:
      </label>
      <select
        id="filasPorPagina"
        value={filasPorPagina}
        onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
        className={inputClass + " text-sm py-1 px-2"}
        style={{ maxWidth: "5rem" }}
      >
        {[1, 10, 30, 45, 60, 100].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>

    {datosPaginados.length === 0 ? (
      <p
        className={`text-center italic ${
          modoOscuro ? "text-blue-300" : "text-gray-500"
        }`}
      >
        No hay materias para mostrar.
      </p>
    ) : (
      <TablaBase
        datos={datosPaginados}
        columnas={[
          { key: "nombreMateria", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
          {
            key: "carrera",
            label: "Carrera",
            render: (item) => {
              const c = carreras.find((c) => c.idCarrera === item.carrera);
              return c ? c.nombre : "N/D";
            },
          },
          { key: "creadoPor", label: "Creador" },
          { key: "modificadoPor", label: "Modificador" },
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
            key: "idEstado",
            label: "Estado",
            render: (item) => (
              <div className="flex items-center justify-center gap-1">
                {renderEstadoIcono(item.idEstado)}
              </div>
            ),
          },
          {
            key: "acciones",
            label: "Acciones",
            render: (item) => (
              <button
                onClick={() => abrirModalEditar(item)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white transition-colors"
                aria-label={`Editar materia ${item.nombreMateria}`}
                type="button"
              >
                <FaEdit />
              </button>
            ),
          },
        ]}
        modoOscuro={modoOscuro}
      />
    )}

    {/* Botones Paginación */}
    {totalPaginas > 1 && (
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <button
          onClick={handlePaginaAnterior}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded-md border ${
            paginaActual === 1
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : modoOscuro
              ? "border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
              : "border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white"
          }`}
          aria-label="Página anterior"
          type="button"
        >
          Anterior
        </button>
        <span className="flex items-center font-semibold">
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={handlePaginaSiguiente}
          disabled={paginaActual === totalPaginas}
          className={`px-4 py-2 rounded-md border ${
            paginaActual === totalPaginas
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : modoOscuro
              ? "border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
              : "border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white"
          }`}
          aria-label="Página siguiente"
          type="button"
        >
          Siguiente
        </button>
      </div>
    )}

    <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
      <FormularioBase
        modoEdicion={modoEdicion}
        onCancel={cerrarModal}
        onSubmit={handleGuardar}
        modoOscuro={modoOscuro}
        loading={formLoading}
      >
        <label className="block mb-2 font-semibold" htmlFor="nombreMateria">
          Nombre:
          <input
            id="nombreMateria"
            name="nombreMateria"
            type="text"
            value={formData.nombreMateria}
            onChange={handleChange}
            className={`${inputClass} mt-1 mb-4`}
            required
            autoFocus
            aria-label="Nombre de la materia"
          />
        </label>

        <label className="block mb-2 font-semibold" htmlFor="descripcion">
          Descripción:
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`${inputClass} mt-1 mb-4`}
            rows={3}
            aria-label="Descripción de la materia"
          />
        </label>

        <label
              className="block mb-2 font-semibold relative"
              ref={wrapperRef}
              htmlFor="carreraInput"
            >
              Carrera:
              <input
                type="text"
                id="carreraInput"
                name="carreraInput"
                value={inputCarrera}
                onChange={handleChange}
                onFocus={handleFocus}
                className={`${inputClass} mt-1 mb-4`}
                autoComplete="off"
                aria-label="Carrera"
                placeholder="Escribe para buscar carrera..."
                role="combobox"
                aria-expanded={mostrarDropdownCarrera}
                aria-controls="dropdown-carreras"
                aria-autocomplete="list"
              />
              {mostrarDropdownCarrera && carrerasFiltradas.length > 0 && (
                <ul
                  id="dropdown-carreras"
                  role="listbox"
                  className={`absolute z-50 max-h-48 overflow-auto w-full border border-gray-300 rounded shadow-md ${
                    modoOscuro ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white"
                  }`}
                  tabIndex={-1}
                  style={{ top: "100%", marginTop: "2px" }}
                >
                  {carrerasFiltradas.map((c) => (
                    <li
                      key={c.idCarrera}
                      role="option"
                      aria-selected={formData.carrera === c.idCarrera}
                      onClick={() => seleccionarCarrera(c)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          seleccionarCarrera(c);
                        }
                      }}
                      tabIndex={0}
                      className={`cursor-pointer px-3 py-2 hover:bg-blue-500 hover:text-white ${
                        formData.carrera === c.idCarrera ? "bg-blue-600 text-white font-semibold" : ""
                      }`}
                    >
                      {c.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </label>

        <label className="block mb-4 font-semibold" htmlFor="idEstado">
          Estado:
          <select
            id="idEstado"
            name="idEstado"
            value={formData.idEstado}
            onChange={handleChange}
            className={`${inputClass} mt-1`}
            required
            aria-label="Estado"
          >
            {estados.length === 0 ? (
              <option value="">Cargando estados...</option>
            ) : (
              estados.map((e) => (
                <option key={e.idEstado} value={e.idEstado}>
                  {e.nombreEstado}
                </option>
              ))
            )}
          </select>
        </label>
      </FormularioBase>
    </ModalBase>
  </>
);
};

export default FrmMaterias;