import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import materiaService from "../../services/Materias";
import estadoService from "../../services/Estado";
import periodoService from "../../services/PeriodoAcademico";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmMaterias = () => {
  const { modoOscuro } = useSelector((state) => state.theme);

  const [materias, setMaterias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    idMateria: 0,
    codigoMateria: "",
    nombreMateria: "",
    descripcion: "",
    idPeriodoAcademico: 0,
    idEstado: 1,
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Formatear fechas para tabla
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

  // Cargar materias y mapear campos relevantes
  const obtenerMaterias = async () => {
    try {
      const response = await materiaService.listarMaterias();
      const data = response.resultado ?? response;
      const materiasMapeadas = data.map((m) => ({
        idMateria: m.idMateria ?? 0,
        codigoMateria: m.codigoMateria ?? "",
        nombreMateria: m.nombreMateria ?? m.nombre ?? "",
        descripcion: m.descripcion ?? "",
        idPeriodoAcademico: m.idPeriodoAcademico ?? 0,
        periodoAcademico: m.periodoAcademico ?? "",
        idEstado: m.idEstado ?? 1,
        fechaCreacion: m.fechaCreacion ?? m.fecha_Creacion ?? "",
        fechaModificacion: m.fechaModificacion ?? m.fecha_Modificacion ?? "",
        creadoPor: m.creador ?? m.creadoPor ?? "-",
        modificadoPor: m.modificador ?? m.modificadoPor ?? "-",
      }));
      setMaterias(materiasMapeadas);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
    }
  };

  // Cargar estados (activos/inactivos)
  const obtenerEstados = async () => {
    try {
      const response = await estadoService.listarEstados();
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

  // Cargar periodos académicos activos
  const obtenerPeriodos = async () => {
    try {
      const response = await periodoService.listarPeriodosAcademicos();
      const periodosRaw = response.resultado ?? [];

      const periodosActivos = periodosRaw
        .filter((p) => p.activo === true)
        .map((p) => ({
          idPeriodoAcademico: p.idPeriodoAcademico,
          nombrePeriodo: p.nombrePeriodo,
        }));
      setPeriodos(periodosActivos);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los periodos académicos", "error");
    }
  };

  useEffect(() => {
    obtenerMaterias();
    obtenerEstados();
    obtenerPeriodos();
  }, []);

  // Filtrado por búsqueda
  const materiasFiltradas = materias.filter((m) =>
    m.nombreMateria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Contadores
  const total = materiasFiltradas.length;
  const activos = materiasFiltradas.filter((m) => m.idEstado === 1).length;
  const inactivos = materiasFiltradas.filter((m) => m.idEstado === 2).length;

  // Paginación
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
      codigoMateria: "",
      nombreMateria: "",
      descripcion: "",
      idPeriodoAcademico: 0,
      idEstado: 1,
    });
    setModoEdicion(false);
    setModalOpen(true);
  };

  // Abrir modal editar
  const abrirModalEditar = (m) => {
    setFormData({
      idMateria: m.idMateria,
      codigoMateria: m.codigoMateria,
      nombreMateria: m.nombreMateria,
      descripcion: m.descripcion,
      idPeriodoAcademico: Number(m.idPeriodoAcademico), // asegurar number
      idEstado: Number(m.idEstado),
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  // Manejar cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "idPeriodoAcademico" || name === "idEstado"
          ? Number(value)
          : value,
    });
  };

  // Guardar nuevo o actualizar
  const handleGuardar = async () => {
    if (!formData.codigoMateria.trim()) {
      Swal.fire("Error", "El código de la materia es obligatorio", "error");
      return;
    }
    if (!formData.nombreMateria.trim()) {
      Swal.fire("Error", "El nombre de la materia es obligatorio", "error");
      return;
    }
    if (formData.idPeriodoAcademico === 0) {
      Swal.fire("Error", "Debe seleccionar un periodo académico válido", "error");
      return;
    }
    if (formData.idEstado === 0) {
      Swal.fire("Error", "Debe seleccionar un estado válido", "error");
      return;
    }

    setFormLoading(true);

    try {
      let payload = { ...formData };
      let res = modoEdicion
        ? await materiaService.actualizarMateria(payload)
        : await materiaService.insertarMateria(payload);

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

  // Renderizar iconos de estado
  const renderEstadoIcono = (idEstado) => {
    if (idEstado === 1)
      return <FaCheckCircle className="text-green-500 text-xl mx-auto" />;
    if (idEstado === 2)
      return <FaTimesCircle className="text-red-500 text-xl mx-auto" />;
    return null;
  };

  const inputClass =
    "w-full px-3 py-2 border rounded focus:outline-none " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600");

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((p) => p - 1);
  };
  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual((p) => p + 1);
  };

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
            { key: "codigoMateria", label: "Código" },
            { key: "nombreMateria", label: "Nombre" },
            { key: "descripcion", label: "Descripción" },
            { key: "periodoAcademico", label: "Periodo Académico" },
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
              render: (item) => renderEstadoIcono(item.idEstado),
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
          <label className="block mb-2 font-semibold" htmlFor="codigoMateria">
            Código:
            <input
              id="codigoMateria"
              name="codigoMateria"
              type="text"
              value={formData.codigoMateria}
              onChange={handleChange}
              className={`${inputClass} mt-1 mb-4`}
              required
              aria-label="Código de la materia"
            />
          </label>

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

          <label className="block mb-4 font-semibold" htmlFor="idPeriodoAcademico">
            Periodo Académico:
            <select
              id="idPeriodoAcademico"
              name="idPeriodoAcademico"
              value={formData.idPeriodoAcademico}
              onChange={handleChange}
              className={`${inputClass} mt-1`}
              required
              aria-label="Periodo Académico"
            >
              <option value={0}>Seleccione un periodo</option>
              {periodos.length === 0 ? (
                <option disabled>Cargando periodos...</option>
              ) : (
                periodos.map((p) => (
                  <option key={p.idPeriodoAcademico} value={p.idPeriodoAcademico}>
                    {p.nombrePeriodo}
                  </option>
                ))
              )}
            </select>
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
