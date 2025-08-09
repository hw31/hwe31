import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GraduationCap, PlusCircle, Edit3 } from "lucide-react";

import carreraService from "../../services/Carreras";
import estudianteCarreraService from "../../services/EstudiantesCarreras";
import materiasCarrerasService from "../../services/MateriasCarrera";
import materiasService from "../../services/Materias";
import estadoService from "../../services/Estado";

import Switch from "../Shared/Switch";

const FrmCarreras = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const idUsuario = useSelector((state) => state.auth.idUsuario);
  const rolLower = rol ? rol.toLowerCase() : "";
  const navigate = useNavigate();

  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [todasMaterias, setTodasMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [materiaBusqueda, setMateriaBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [modal, setModal] = useState(false);
  const inputRef = useRef(null);

  const [formData, setFormData] = useState({
    idCarrera: null,
    nombreCarrera: "",
    codigoCarrera: "",
    activo: true,
  });

  useEffect(() => {
    cargarCarreras();
    materiasService.listarMaterias().then(setTodasMaterias);
    estadoService.listarEstados().then(setEstados);
  }, []);

  const cargarCarreras = async () => {
    setLoading(true);
    try {
      let data = [];
      if (rolLower === "administrador") {
        const res = await carreraService.listarCarreras();
        data = res.map((c) => ({
          idCarrera: c.iD_Carrera,
          nombreCarrera: c.nombreCarrera,
          codigoCarrera: c.codigoCarrera,
          activo: c.activo,
        }));
      } else {
        const res = await estudianteCarreraService.listarPorUsuario(idUsuario);
        data = res
          .filter((ec) => ec.iD_Estado === 1) // sool carreras activas
          .map((ec) => ({
            idCarrera: ec.iD_Carrera,
            nombreCarrera: ec.nombreCarrera,
            codigoCarrera: ec.codigoCarrera,
            activo: ec.iD_Estado === 1,
          }));
      }
      setCarreras(data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las carreras", "error");
    } finally {
      setLoading(false);
    }
  };

  const cargarMaterias = async (idCarrera) => {
    setLoadingMaterias(true);
    try {
      const res = await materiasCarrerasService.listarPorCarrera(idCarrera);
      const materiasData = res.map((mc) => ({
        idRelacion: mc.iD_MateriaCarrera,
        idMateria: mc.iD_Materia,
        nombreMateria: mc.nombreMateria,
        codigoMateria: mc.codigoMateria,
        idEstado: mc.iD_Estado,
        activo: mc.iD_Estado === 1,
        creador: mc.creador,
        modificador: mc.modificador,
        fechaCreacion: mc.fecha_Creacion,
        fechaModificacion: mc.fecha_Modificacion,
      }));
      setMaterias(materiasData);
      setCarreraSeleccionada(carreras.find((c) => c.idCarrera === idCarrera));
    } catch {
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
      setMaterias([]);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const handleSeleccionarCarrera = (idCarrera) => {
    cargarMaterias(idCarrera);
  };

  const volverACarreras = () => {
    setCarreraSeleccionada(null);
    setMaterias([]);
    setMateriaBusqueda("");
    setSugerencias([]);
  };

  const abrirModal = (carrera = null) => {
    if (carrera) {
      setFormData({ ...carrera });
    } else {
      setFormData({
        idCarrera: null,
        nombreCarrera: "",
        codigoCarrera: "",
        activo: true,
      });
    }
    setModal(true);
  };

  const cerrarModal = () => setModal(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const guardarCarrera = async () => {
    try {
      if (!formData.nombreCarrera || !formData.codigoCarrera) {
        return Swal.fire("Campos incompletos", "Completa todos los campos", "warning");
      }

      if (formData.idCarrera) {
        await carreraService.actualizarCarrera(formData);
        Swal.fire("Actualizado", "Carrera actualizada correctamente", "success");
      } else {
        await carreraService.insertarCarrera(formData);
        Swal.fire("Creado", "Carrera registrada correctamente", "success");
      }

      cerrarModal();
      cargarCarreras();
    } catch (error) {
      Swal.fire("Error", "Ocurrió un error al guardar la carrera", "error");
    }
  };

  const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-NI", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};


  const handleBusquedaChange = (e) => {
    const valor = e.target.value;
    setMateriaBusqueda(valor);
    if (valor.trim() === "") {
      setSugerencias([]);
      return;
    }
    const sugerenciasFiltradas = todasMaterias.filter((m) =>
      m.nombreMateria.toLowerCase().includes(valor.toLowerCase())
    );
    setSugerencias(sugerenciasFiltradas);
    setMostrarSugerencias(true);
  };


  const handleSeleccionarMateria = async (materia) => {
    const confirm = await Swal.fire({
      title: "Confirmar inserción",
      text: `¿Seguro que quieres ingresar: "${materia.nombreMateria}" a "${carreraSeleccionada.nombreCarrera}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, insertar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await materiasCarrerasService.insertarMateriaCarrera({
        iD_Carrera: carreraSeleccionada.idCarrera,
        iD_Materia: materia.idMateria,
        iD_Estado: 1,
      });
      Swal.fire("Éxito", "Materia agregada correctamente", "success");
      cargarMaterias(carreraSeleccionada.idCarrera);
      setMateriaBusqueda("");
      setSugerencias([]);
    } catch (error) {
      // Intentamos obtener el mensaje específico de error de la API
      const msgError =
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo agregar la materia";
      Swal.fire("Error", msgError, "error");
    }
  };

  const handleOutsideClick = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setMostrarSugerencias(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleMateriaCarrera = async (relacion) => {
    const nuevoEstado = relacion.idEstado === 1 ? 2 : 1;
    // Guardamos el estado previo para revertir en caso de error
    const estadoPrevio = materias.find((m) => m.idRelacion === relacion.idRelacion);

    // Actualizamos UI inmediatamente
    setMaterias((prev) =>
      prev.map((m) =>
        m.idRelacion === relacion.idRelacion
          ? { ...m, idEstado: nuevoEstado, activo: nuevoEstado === 1 }
          : m
      )
    );

    try {
      await materiasCarrerasService.actualizarMateriaCarrera({
        iD_MateriaCarrera: relacion.idRelacion,
        iD_Estado: nuevoEstado,
      });
    } catch (error) {
      const msgError =
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudo cambiar el estado";
      Swal.fire("Error", msgError, "error");
      // Revertimos el cambio local
      setMaterias((prev) =>
        prev.map((m) =>
          m.idRelacion === relacion.idRelacion
            ? { ...m, idEstado: estadoPrevio.idEstado, activo: estadoPrevio.idEstado === 1 }
            : m
        )
      );
    }
  };

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-white" : "text-gray-900";

  return (
   <div className={`p-6 pt-20 sm:pt-6 min-h-screen ${fondo} ${texto}`}>
      {!carreraSeleccionada ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Carreras</h2>
            {rolLower === "administrador" && (
              <button
                onClick={() => abrirModal()}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
              >
                <PlusCircle size={20} />
                Nueva Carrera
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-center font-medium text-lg">Cargando carreras...</p>
          ) : carreras.length === 0 ? (
            <p className="text-center font-medium text-lg">No hay carreras disponibles.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {carreras.map((carrera) => (
                <div
                  key={carrera.idCarrera}
                  className={`rounded-xl p-6 shadow-md border transition-transform transform hover:scale-105 ${
                    modoOscuro
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gradient-to-br from-blue-100 to-white border-blue-200"
                  }`}
                >
                  <div
                    className="cursor-pointer flex items-center gap-3"
                    onClick={() => handleSeleccionarCarrera(carrera.idCarrera)}
                  >
                    <GraduationCap size={26} className="text-blue-500" />
                    <h3 className="text-xl font-semibold">{carrera.nombreCarrera}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Código: {carrera.codigoCarrera}</p>
                  <p className={`text-sm mt-1 ${carrera.activo ? "text-green-600" : "text-red-500"}`}>
                    {carrera.activo ? "Activo" : "Inactivo"}
                  </p>
                  {rolLower === "administrador" && (
                    <button
                      onClick={() => abrirModal(carrera)}
                      className="mt-4 text-sm flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Edit3 size={18} /> Editar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={volverACarreras}
            className="mb-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Volver a Carreras
          </button>

          <h2 className="text-3xl font-extrabold mb-6 text-center font-sans tracking-wide text-blue-600">
            Plan de estudio de {carreraSeleccionada?.nombreCarrera}
          </h2>

          {rolLower === "administrador" && (
            <div className="mb-6 w-full max-w-md mx-auto relative" ref={inputRef}>
              <input
                value={materiaBusqueda}
                onChange={handleBusquedaChange}
                placeholder="Buscar materia para agregar..."
                className="w-full max-w-md rounded-full border border-gray-300 px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-md"
              />
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-300 bg-white shadow-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {sugerencias.map((m) => (
                    <li
                      key={m.iD_Materia}
                      onClick={() => handleSeleccionarMateria(m)}
                      className="cursor-pointer px-5 py-3 text-gray-800 hover:bg-blue-500 hover:text-white transition rounded-lg"
                    >
                      {m.nombreMateria}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {loadingMaterias ? (
            <p className="text-center font-medium text-lg">Cargando materias...</p>
          ) : materias.length === 0 ? (
            <p className="text-center font-medium text-lg">No hay materias para esta carrera.</p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className={`mx-auto w-full max-w-5xl border-collapse text-left ${
                  modoOscuro ? "bg-gray-800 text-white" : "bg-white text-black"
                }`}
              >
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-6 py-4 font-semibold">Código</th>
                    <th className="px-6 py-4 font-semibold">Materia</th>
                   
                   {rolLower === "administrador" && (
                    <>
                      <th className="px-6 py-4 font-semibold">Activo</th>
                      <th className="px-6 py-4 font-semibold">Creador</th>
                      <th className="px-6 py-4 font-semibold">Modificador</th>
                      <th className="px-6 py-4 font-semibold">Fecha Creación</th>
                      <th className="px-6 py-4 font-semibold">Fecha Modificación</th>
                    </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m) => (
                    <tr
                      key={m.idRelacion}
                      className={`border-b border-gray-300 transition hover:bg-blue-100 ${
                        modoOscuro ? "hover:bg-blue-700" : ""
                      }`}
                    >
                      <td className="px-6 py-4">{m.codigoMateria}</td>
                      <td className="px-6 py-4">{m.nombreMateria}</td>
                      
                      {rolLower === "administrador" && (
                        <>
                          <td className="px-6 py-4">
                            <Switch
                              checked={m.idEstado === 1}
                              onChange={() => toggleMateriaCarrera(m)}
                            />
                          </td>
                          <td className="px-6 py-4">{m.creador}</td>
                          <td className="px-6 py-4">{m.modificador}</td>
                          <td className="px-6 py-4">{formatearFecha(m.fechaCreacion)}</td>
                          <td className="px-6 py-4">{formatearFecha(m.fechaModificacion)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL DE CARRERA */}
      {modal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(5px)" }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {formData.idCarrera ? "Editar Carrera" : "Nueva Carrera"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nombreCarrera"
                value={formData.nombreCarrera}
                onChange={handleChange}
                placeholder="Nombre de la carrera"
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                name="codigoCarrera"
                value={formData.codigoCarrera}
                onChange={handleChange}
                placeholder="Código de la carrera"
                className="w-full border rounded-lg p-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCarrera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmCarreras;
