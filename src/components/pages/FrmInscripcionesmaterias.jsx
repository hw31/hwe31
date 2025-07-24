import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import inscripcionService from "../../services/InscripcionesMaterias";


import { FaPlus, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";

const FrmInscripcionesMaterias = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    IdInscripcion: "",
    IdMateria: "",
    // añade más campos según tu modelo de inscripcion
  });

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Cargar inscripciones
  const cargarInscripciones = async () => {
    try {
      setLoading(true);
      const data = await inscripcionService.listarInscripciones();
      console.log("Inscripciones cargadas:", data);
      setInscripciones(data);
      setError("");
    } catch (err) {
      setError(err.message || "Error al cargar inscripciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInscripciones();
  }, []);

  // Abrir modal para nuevo registro
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setInscripcionSeleccionada(null);
    setFormData({
      IdInscripcion: "",
      IdMateria: "",
      // limpia campos
    });
    setFormError("");
    setModalOpen(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (inscripcion) => {
    setModoEdicion(true);
    setInscripcionSeleccionada(inscripcion);
    setFormData({
      IdInscripcion: inscripcion.idInscripcion || "",
      IdMateria: inscripcion.idMateria || "",
      // asigna campos existentes para edición
    });
    setFormError("");
    setModalOpen(true);
  };

  // Manejar cambio en formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validación simple
  const validarFormulario = () => {
    if (!formData.IdInscripcion || !formData.IdMateria) {
      setFormError("Por favor, complete todos los campos.");
      return false;
    }
    setFormError("");
    return true;
  };

  // Guardar inscripcion (insertar o actualizar)
  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setFormLoading(true);

    try {
      let respuesta;
      if (modoEdicion && inscripcionSeleccionada) {
        respuesta = await inscripcionService.actualizarInscripcion({
          ...formData,
          // puede que debas normalizar campos como IdInscripcionMateria
        });
      } else {
        respuesta = await inscripcionService.insertarInscripcion(formData);
      }

      if (respuesta?.error || respuesta?.success === false) {
        throw new Error(respuesta.message || "Error desconocido al guardar.");
      }

      await cargarInscripciones();
      setModalOpen(false);

      await Swal.fire({
        icon: "success",
        title: modoEdicion ? "Actualizado" : "Guardado",
        text: modoEdicion
          ? "La inscripción se actualizó correctamente."
          : "La inscripción se guardó correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al guardar:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al guardar la inscripción",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Filtro simple por texto
  const inscripcionesFiltradas = inscripciones.filter((ins) => {
    const texto = busqueda.toLowerCase();
    // Ajusta según campos que quieres buscar
    return (
      ins.nombreDocente?.toLowerCase().includes(texto) ||
      ins.nombreMateria?.toLowerCase().includes(texto)
    );
  });

  // Clases tema
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  return (
    <div className={`p-4 ${fondo} ${texto}`}>
      <h2 className="text-2xl font-semibold mb-4">Inscripciones Materias</h2>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-2 flex-grow rounded"
        />
        <button
          onClick={abrirModalNuevo}
          className="ml-2 bg-blue-600 text-white px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Nueva Inscripción
        </button>
      </div>

      {loading ? (
        <p>Cargando inscripciones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className={encabezado}>
            <tr>
              <th className="border border-gray-300 p-2 text-left">Docente</th>
              <th className="border border-gray-300 p-2 text-left">Materia</th>
              {/* agrega más columnas según tus datos */}
              <th className="border border-gray-300 p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripcionesFiltradas.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-4">
                  No hay resultados.
                </td>
              </tr>
            )}
            {inscripcionesFiltradas.map((ins) => (
              <tr key={ins.idInscripcionMateria}>
                <td className="border border-gray-300 p-2">{ins.nombreDocente}</td>
                <td className="border border-gray-300 p-2">{ins.nombreMateria}</td>
                {/* más campos aquí */}
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => abrirModalEditar(ins)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal - usa tu modal preferido, aquí un ejemplo simple */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className={`bg-white p-6 rounded shadow-lg w-full max-w-md`}>
            <h3 className="text-xl font-semibold mb-4">
              {modoEdicion ? "Editar Inscripción" : "Nueva Inscripción"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              <label className="block mb-2">
                Id Inscripción:
                <input
                  type="text"
                  name="IdInscripcion"
                  value={formData.IdInscripcion}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={modoEdicion} // usualmente no se cambia en edición
                />
              </label>

              <label className="block mb-2">
                Id Materia:
                <input
                  type="text"
                  name="IdMateria"
                  value={formData.IdMateria}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </label>

              {/* Agrega más campos según el modelo */}

              {formError && <p className="text-red-500 mb-2">{formError}</p>}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {formLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmInscripcionesMaterias;
