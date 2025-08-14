import React, { useState, useEffect, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import ContadoresBase from "../Shared/Contadores";
import TablaBase from "../Shared/TablaBase";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import BuscadorBase from "../Shared/BuscadorBase";

import inscripcionMateriaService from "../../services/InscricipcionesxMateria";
import inscripcionService from "../../services/Inscripcion";
import materiaService from "../../services/Materias";
import grupoService from "../../services/Grupos";
import estadoService from "../../services/Estado";

const InscripcionesMaterias = () => {
  const { modoOscuro } = useSelector(state => state.theme);
  const rol = useSelector((state) => state.auth.rol);
  const [inscripcionesMaterias, setInscripcionesMaterias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [estados, setEstados] = useState([]);

  // --- FILTRO TABLA (usa BuscadorBase) ---
  const [filtroTablaEstudiante, setFiltroTablaEstudiante] = useState("");

  // --- AUTOCOMPLETE FORMULARIO ---
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaMateria, setBusquedaMateria] = useState("");
  const [busquedaGrupo, setBusquedaGrupo] = useState("");

  // Mostrar dropdowns de autocomplete formulario
  const [mostrarDropdownEstudiante, setMostrarDropdownEstudiante] = useState(false);
  const [mostrarDropdownMateria, setMostrarDropdownMateria] = useState(false);
  const [mostrarDropdownGrupo, setMostrarDropdownGrupo] = useState(false);

  const [form, setForm] = useState({
    idInscripcionMateria: 0,
    idInscripcion: 0,
    idMateria: 0,
    idGrupo: 0,
    idEstado: 1, // activo por defecto
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const rolLower = rol?.toLowerCase() || "";

  // Referencias para cerrar dropdowns al hacer click fuera
  const estudianteRef = useRef(null);
  const materiaRef = useRef(null);
  const grupoRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Cerrar dropdowns al click fuera
    const handleClickOutside = (e) => {
      if (estudianteRef.current && !estudianteRef.current.contains(e.target)) {
        setMostrarDropdownEstudiante(false);
      }
      if (materiaRef.current && !materiaRef.current.contains(e.target)) {
        setMostrarDropdownMateria(false);
      }
      if (grupoRef.current && !grupoRef.current.contains(e.target)) {
        setMostrarDropdownGrupo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        insMatRes,
        insRes,
        matRes,
        grpRes,
        estRes,
      ] = await Promise.all([
        inscripcionMateriaService.listarInscripcionesMaterias(),
        inscripcionService.listarInscripciones(),
        materiaService.listarMaterias(),
        grupoService.listarGrupos(),
        estadoService.listarEstados(),
      ]);
      setInscripcionesMaterias(insMatRes);
      setInscripciones(insRes);
      setMaterias(matRes);
      setGrupos(grpRes);
      // Solo estados Activo (1) e Inactivo (2)
      setEstados(estRes.data.filter(e => e.iD_Estado === 1 || e.iD_Estado === 2));
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos.", "error");
    } finally {
      setLoading(false);
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

  // Filtros para autocompletados formulario (no filtran tabla)
  const estudiantesFiltrados = inscripciones.filter((i) =>
    i.nombreEstudiante.toLowerCase().includes(busquedaEstudiante.toLowerCase())
  );
  const materiasFiltradas = materias.filter((m) =>
    m.nombreMateria.toLowerCase().includes(busquedaMateria.toLowerCase())
  );
  const gruposFiltrados = grupos.filter((g) =>
    g.codigoGrupo.toLowerCase().includes(busquedaGrupo.toLowerCase())
  );

  // Selección en autocompletados formulario
  const seleccionarEstudiante = (idInscripcion, nombre) => {
    setForm((f) => ({ ...f, idInscripcion }));
    setBusquedaEstudiante(nombre);
    setMostrarDropdownEstudiante(false);
  };
  const seleccionarMateria = (idMateria, nombre) => {
    setForm((f) => ({ ...f, idMateria }));
    setBusquedaMateria(nombre);
    setMostrarDropdownMateria(false);
  };
  const seleccionarGrupo = (idGrupo, codigo) => {
    setForm((f) => ({ ...f, idGrupo }));
    setBusquedaGrupo(codigo);
    setMostrarDropdownGrupo(false);
  };

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    setForm({
      idInscripcionMateria: 0,
      idInscripcion: 0,
      idMateria: 0,
      idGrupo: 0,
      idEstado: 1,
    });
    setBusquedaEstudiante("");
    setBusquedaMateria("");
    setBusquedaGrupo("");
    setModoEdicion(false);
    setFormError("");
    setModalOpen(true);
  };

  // Editar fila
  const handleEditar = (item) => {
    const inscripcion = inscripciones.find(i => i.iD_Inscripcion === item.idInscripcion);
    const materia = materias.find(m => m.idMateria === item.idMateria);
    const grupo = grupos.find(g => g.idGrupo === item.iD_Grupo);

    setForm({
      idInscripcionMateria: item.idInscripcionMateria,
      idInscripcion: item.idInscripcion,
      idMateria: item.idMateria,
      idGrupo: item.iD_Grupo,
      idEstado: item.idEstado,
    });
    setBusquedaEstudiante(inscripcion?.nombreEstudiante || "");
    setBusquedaMateria(materia?.nombreMateria || "");
    setBusquedaGrupo(grupo?.codigoGrupo || "");
    setModoEdicion(true);
    setFormError("");
    setModalOpen(true);
  };

  // Guardar formulario
  const handleGuardar = async () => {
    if (!form.idInscripcion) return setFormError("Debe seleccionar un estudiante");
    if (!form.idMateria) return setFormError("Debe seleccionar una materia");
    if (!form.idGrupo) return setFormError("Debe seleccionar un grupo");
    if (![1, 2].includes(form.idEstado)) return setFormError("Debe seleccionar un estado válido");

    setFormLoading(true);
    setFormError("");
    try {
      let res;
      if (modoEdicion) {
        res = await inscripcionMateriaService.actualizarInscripcionMateria(form);
      } else {
        res = await inscripcionMateriaService.insertarInscripcionMateria(form);
      }

      if (res.success) {
        Swal.fire("¡Éxito!", "Registro guardado correctamente.", "success");
        cargarDatos();
        setModalOpen(false);
      } else {
        Swal.fire("Error", res.mensaje || "Error al guardar", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Error inesperado", "error");
    } finally {
      setFormLoading(false);
    }
  };

  /// Columnas que todos ven
const columnasBase = [
  {
    key: "idInscripcion",
    label: "Estudiante",
    render: (item) => {
      const inscripcion = inscripciones.find(i => i.iD_Inscripcion === item.idInscripcion);
      return inscripcion ? inscripcion.nombreEstudiante : "-";
    }
  },
  {
    key: "idMateria",
    label: "Materia",
    render: (item) => {
      const materia = materias.find(m => m.idMateria === item.idMateria);
      return materia ? materia.nombreMateria : "-";
    }
  },
  {
    key: "iD_Grupo",
    label: "Grupo",
    render: (item) => {
      const grupo = grupos.find(g => g.idGrupo === item.iD_Grupo);
      return grupo ? grupo.codigoGrupo : "-";
    }
  },
  {
    key: "idEstado",
    label: "Estado",
    render: (item) => {
      const estado = estados.find(e => e.iD_Estado === item.idEstado);
      if (!estado) return "-";
      return (
        <span className="flex items-center">
          {item.idEstado === 1 ? (
            <FaCheckCircle className="text-green-600" />
          ) : (
            <FaTimesCircle className="text-red-600" />
          )}
        </span>
      );
    }
  }
];

// Columnas extra solo para admin
const columnasExtraAdmin = [
  {
    key: "creador",
    label: "Creador",
    render: (item) => item.creador || "-"
  },
  {
    key: "modificador",
    label: "Modificador",
    render: (item) => item.modificador || "-"
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
  }
];

// Unir según rol
const columnas = rolLower === "administrador"
  ? [...columnasBase, ...columnasExtraAdmin]
  : columnasBase;

  // Filtrar datos tabla con filtroTablaEstudiante (no usar busquedaEstudiante)
  const datosFiltrados = inscripcionesMaterias.filter((im) => {
    const inscripcion = inscripciones.find(i => i.iD_Inscripcion === im.idInscripcion);
    if (!inscripcion) return false;
    return inscripcion.nombreEstudiante.toLowerCase().includes(filtroTablaEstudiante.toLowerCase());
  });

  // Paginación tabla
  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimeraFila, indexUltimaFila);
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);

  const cambiarPagina = (numPagina) => {
    if (numPagina < 1 || numPagina > totalPaginas) return;
    setPaginaActual(numPagina);
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [filasPorPagina, filtroTablaEstudiante]);

  // Contadores
  const activosCount = inscripcionesMaterias.filter(i => i.idEstado === 1).length;
  const inactivosCount = inscripcionesMaterias.filter(i => i.idEstado === 2).length;
  const totalCount = inscripcionesMaterias.length;

  // Clases input
  const inputClass =
  "w-full px-3 py-2 border rounded focus:outline-none transition " +
  (modoOscuro
    ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-indigo-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-600");

  return (
    <>
      {/* Filtro tabla con BuscadorBase */}
      <BuscadorBase
        titulo="Inscripciones Materias"
        valor={filtroTablaEstudiante}
        onChange={(e) => setFiltroTablaEstudiante(e.target.value)}
        placeholder="Buscar estudiante..."
      />

       <ContadoresBase
        activos={activosCount}
        inactivos={inactivosCount}
        total={totalCount}
        onNuevo={abrirModalNuevo}
        texto="inscripciones materias"
      />

     {/* Select filas por página */}
        <div className="mb-4 flex items-center gap-2 max-w-[200px] ml-0">
          <label htmlFor="filasPorPagina" className="font-semibold">
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            className={inputClass + " max-w-[5rem]"}
            value={filasPorPagina}
            onChange={(e) => setFilasPorPagina(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

      {/* Tabla */}
      <div className="overflow-x-auto w-full">
        <TablaBase
          datos={datosPaginados}
          columnas={columnas}
          loading={loading}
          puedeEditar={() => true}
          onEditar={handleEditar}
          modoOscuro={modoOscuro} 
        />
      </div>

              {/* Paginación */}
          <div className="flex justify-between items-center mt-4 gap-4 w-full px-4">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`px-4 py-2 rounded transition ${
                paginaActual === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Anterior
            </button>

            <div className="font-semibold">
              Página {paginaActual} de {totalPaginas || 1}
            </div>

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              className={`px-4 py-2 rounded transition ${
                paginaActual === totalPaginas || totalPaginas === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Siguiente
            </button>
          </div>

      {/* Modal formulario */}
      <ModalBase
        isOpen={modalOpen} onClose={() => setModalOpen(false)} modoOscuro={modoOscuro}
      >
        <FormularioBase
          modoEdicion={modoEdicion}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleGuardar}
          modoOscuro={modoOscuro}
          loading={formLoading}
          titulo={modoEdicion ? "Inscripcion Por materia" : "Inscripcion Por materia"}
        >
          <div className="space-y-4">
            {/* Estudiante con autocomplete */}
            <div className="relative" ref={estudianteRef}>
              <label className="font-semibold block mb-1">Estudiante</label>
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={busquedaEstudiante}
                onChange={(e) => {
                  setBusquedaEstudiante(e.target.value);
                  setMostrarDropdownEstudiante(true);
                  setForm((f) => ({ ...f, idInscripcion: 0 }));
                }}
                className={inputClass}
                autoComplete="off"
              />
                {mostrarDropdownEstudiante && estudiantesFiltrados.length > 0 && (
                 <ul
                   className={`absolute z-10 w-full max-h-52 overflow-auto border rounded shadow-lg
                        ${modoOscuro
                          ? "bg-gray-800 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                    >
                  {estudiantesFiltrados.map((e) => (
                    <li
                      key={e.iD_Inscripcion}
                      onClick={() => seleccionarEstudiante(e.iD_Inscripcion, e.nombreEstudiante)}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                    >
                      {e.nombreEstudiante}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Materia con autocomplete */}
            <div className="relative" ref={materiaRef}>
              <label className="font-semibold block mb-1">Materia</label>
              <input
                type="text"
                placeholder="Buscar materia..."
                value={busquedaMateria}
                onChange={(e) => {
                  setBusquedaMateria(e.target.value);
                  setMostrarDropdownMateria(true);
                  setForm((f) => ({ ...f, idMateria: 0 }));
                }}
                className={inputClass}
                autoComplete="off"
              />
              {mostrarDropdownMateria && materiasFiltradas.length > 0 && (
                <ul
                    className={`absolute z-10 w-full max-h-52 overflow-auto border rounded shadow-lg
                      ${modoOscuro
                        ? "bg-gray-800 border-gray-600 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                      }`}
                  >
                  {materiasFiltradas.map((m) => (
                    <li
                      key={m.idMateria}
                      onClick={() => seleccionarMateria(m.idMateria, m.nombreMateria)}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                    >
                      {m.nombreMateria}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Grupo con autocomplete */}
            <div className="relative" ref={grupoRef}>
              <label className="font-semibold block mb-1">Grupo</label>
              <input
                type="text"
                placeholder="Buscar grupo..."
                value={busquedaGrupo}
                onChange={(e) => {
                  setBusquedaGrupo(e.target.value);
                  setMostrarDropdownGrupo(true);
                  setForm((f) => ({ ...f, idGrupo: 0 }));
                }}
                className={inputClass}
                autoComplete="off"
              />
              {mostrarDropdownGrupo && gruposFiltrados.length > 0 && (
                <ul
                    className={`absolute z-10 w-full max-h-52 overflow-auto border rounded shadow-lg
                      ${modoOscuro
                        ? "bg-gray-800 border-gray-600 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                      }`}
                  >
                  {gruposFiltrados.map((g) => (
                    <li
                      key={g.idGrupo}
                      onClick={() => seleccionarGrupo(g.idGrupo, g.codigoGrupo)}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                    >
                      {g.codigoGrupo}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="font-semibold block mb-1">Estado</label>
              <select
                className={inputClass}
                value={form.idEstado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, idEstado: Number(e.target.value) }))
                }
              >
                {estados.map((e) => (
                  <option key={e.iD_Estado} value={e.iD_Estado}>
                    {e.nombre_Estado}
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <p className="text-red-600 font-semibold text-center">{formError}</p>
            )}
          </div>
        </FormularioBase>
      </ModalBase>
    </>
  );
};

export default InscripcionesMaterias;
