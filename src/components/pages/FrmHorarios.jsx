import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GraduationCap, PlusCircle, Edit3 } from "lucide-react";

import carreraService from "../../services/Carreras";
import estudianteCarreraService from "../../services/EstudiantesCarreras";
import materiasService from "../../services/Materias"; // <- Servicio de materias

const FrmCarreras = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const idUsuario = useSelector((state) => state.auth.idUsuario);
  const rolLower = rol ? rol.toLowerCase() : "";
  const navigate = useNavigate();

  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    idCarrera: null,
    nombreCarrera: "",
    codigoCarrera: "",
    activo: true,
  });

  // Estados para materias y carrera seleccionada
  const [materias, setMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  useEffect(() => {
    cargarCarreras();
  }, []);

  const cargarCarreras = async () => {
    setLoading(true);
    try {
      let data = [];

      if (rolLower === "administrador") {
        const res = await carreraService.listarCarreras();
        data = Array.isArray(res)
          ? res.map((c) => ({
              idCarrera: c.iD_Carrera,
              nombreCarrera: c.nombreCarrera,
              codigoCarrera: c.codigoCarrera,
              activo: c.activo,
            }))
          : [];
      } else {
        const res = await estudianteCarreraService.listarPorUsuario(idUsuario);
        data = Array.isArray(res)
          ? res.map((ec) => ({
              idCarrera: ec.iD_Carrera,
              nombreCarrera: ec.nombreCarrera,
              codigoCarrera: ec.codigoCarrera,
              activo: ec.activo,
            }))
          : [];
      }

      setCarreras(data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las carreras", "error");
    } finally {
      setLoading(false);
    }
  };

  // Carga materias según carrera seleccionada
  const cargarMaterias = async (idCarrera) => {
  setLoadingMaterias(true);
  try {
    const res = await materiasService.filtrarPorCarrera(idCarrera);

    if (res.numero === -1 && res.mensaje) {
      setMaterias([]);
      Swal.fire("Información", res.mensaje, "info");
    } else if (Array.isArray(res.resultado)) {
      setMaterias(res.resultado);
    } else {
      setMaterias([]);
    }

    setCarreraSeleccionada(carreras.find((c) => c.idCarrera === idCarrera) || null);
  } catch (error) {
    Swal.fire("Error", "No se pudieron cargar las materias", "error");
    setMaterias([]);
  } finally {
    setLoadingMaterias(false);
  }
};

  // Al seleccionar una carrera, cargar sus materias
  const handleSeleccionarCarrera = (idCarrera) => {
    cargarMaterias(idCarrera);
  };

  // Volver a la lista de carreras
  const volverACarreras = () => {
    setCarreraSeleccionada(null);
    setMaterias([]);
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

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-white" : "text-gray-900";

  return (
    <div className={`p-6 min-h-screen ${fondo} ${texto}`}>
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
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Volver a Carreras
          </button>

{loadingMaterias ? (
  <p className="text-center font-medium text-lg">Cargando materias...</p>
) : materias.length === 0 ? (
  <p className="text-center font-medium text-lg">No hay materias para esta carrera.</p>
) : (
  <div className="flex flex-col items-center mt-6 space-y-4">
    {/* Título arriba de la tabla */}
    <h2 className={`text-xl font-semibold ${modoOscuro ? "text-white" : "text-gray-800"}`}>
      Plan de estudio de {carreraSeleccionada?.nombreCarrera}
    </h2>

    <div className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg border ${modoOscuro ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}`}>
      <table className={`w-full border-separate border-spacing-y-2 ${modoOscuro ? "text-white" : "text-gray-900"}`}>
        <thead>
          <tr className="bg-blue-600 text-white text-sm font-bold uppercase tracking-wider">
            <th className="px-4 py-3 text-left rounded-l-xl w-28  border-r border-gray-300 dark:border-gray-600">Código</th>
            <th className="px-4 py-3 text-left rounded-r-xl w-64">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {materias.map((materia) => (
            <tr
              key={materia.idMateria}
              className={`transition duration-200 ease-in-out shadow-sm ${
                modoOscuro
                  ? "bg-gray-700 hover:bg-blue-600"
                  : "bg-blue-100 hover:bg-blue-200"
              }`}
            >
              <td className="px-4 py-4 rounded-l-xl font-medium w-28 border-r border-gray-300 dark:border-gray-600">
                {materia.codigoMateria}
              </td>
              <td className="px-4 py-4 rounded-r-xl truncate w-64">
                {materia.nombreMateria}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        </>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
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
              <button onClick={cerrarModal} className="px-4 py-2 bg-gray-300 rounded-lg">
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
