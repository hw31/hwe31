import React, { useEffect, useState } from "react";
import materiaService from "../../services/Materias";
import Swal from "sweetalert2";
import { FaEdit, FaPlus } from "react-icons/fa";

const FrmMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({ nombre: "", activo: true });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idMateriaEditando, setIdMateriaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const obtenerMaterias = async () => {
    try {
      const data = await materiaService.listarMaterias();
      setMaterias(data);
    } catch (error) {
      console.error("Error al obtener materias", error);
    }
  };

  useEffect(() => {
    obtenerMaterias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const limpiarFormulario = () => {
    setForm({ nombre: "", activo: true });
    setModoEdicion(false);
    setIdMateriaEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      Swal.fire("Nombre requerido", "Por favor, escribe un nombre", "warning");
      return;
    }

    try {
      if (modoEdicion) {
        await materiaService.actualizarMateria({
          idMateria: idMateriaEditando,
          ...form,
        });
        Swal.fire("Actualizado", "Materia actualizada correctamente", "success");
      } else {
        await materiaService.insertarMateria(form);
        Swal.fire("Registrado", "Materia registrada correctamente", "success");
      }
      obtenerMaterias();
      limpiarFormulario();
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar la materia", "error");
    }
  };

  const cargarMateria = (materia) => {
    setForm({ nombre: materia.nombre, activo: materia.activo });
    setIdMateriaEditando(materia.idMateria);
    setModoEdicion(true);
  };

  const materiasFiltradas = materias.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Gestión de Materias</h2>

      <input
        type="text"
        placeholder="Buscar materia..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 px-3 py-2 w-full rounded-md border border-gray-300 dark:bg-gray-800 dark:text-white"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-md shadow-md p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nombre"
            placeholder="Nombre de la materia"
            value={form.nombre}
            onChange={handleChange}
            className="px-3 py-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:text-white"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />
            Activo
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            {modoEdicion ? "Actualizar" : "Registrar"}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-md shadow-md">
        <table className="w-full text-sm text-left table-auto border dark:text-white">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Creado</th>
              <th className="px-4 py-2">Modificado</th>
              <th className="px-4 py-2">Creador</th>
              <th className="px-4 py-2">Modificador</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiasFiltradas.map((m) => (
              <tr
                key={m.idMateria}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{m.nombre}</td>
                <td className="px-4 py-2">{m.activo ? "Sí" : "No"}</td>
                <td className="px-4 py-2">{m.fechaCreacion?.split("T")[0]}</td>
                <td className="px-4 py-2">{m.fechaModificacion?.split("T")[0]}</td>
                <td className="px-4 py-2">{m.creadoPor || "-"}</td>
                <td className="px-4 py-2">{m.modificadoPor || "-"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => cargarMateria(m)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}

            {materiasFiltradas.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                  No se encontraron materias.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrmMaterias;
