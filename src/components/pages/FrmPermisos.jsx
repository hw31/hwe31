import React, { useState, useEffect } from "react";
import permisoService from "../../services/Permiso"; // Ajusta ruta según tu estructura
import Swal from "sweetalert2";

const FrmPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [form, setForm] = useState({ idPermiso: "", nombre: "", descripcion: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {
    try {
      setLoading(true);
      const data = await permisoService.listarPermisos();
      setPermisos(data);
    } catch (error) {
      console.error("Error cargando permisos", error);
      Swal.fire("Error", "No se pudo cargar los permisos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      return Swal.fire("Atención", "El nombre es obligatorio", "warning");
    }

    try {
      if (modoEdicion) {
        const res = await permisoService.actualizarPermiso(form);
        if (res.success) {
          Swal.fire("Actualizado", "Permiso actualizado correctamente", "success");
          setModoEdicion(false);
          setForm({ idPermiso: "", nombre: "", descripcion: "" });
          cargarPermisos();
        }
      } else {
        const res = await permisoService.insertarPermiso(form);
        if (res.success) {
          Swal.fire("Agregado", "Permiso insertado correctamente", "success");
          setForm({ idPermiso: "", nombre: "", descripcion: "" });
          cargarPermisos();
        }
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar", "error");
    }
  };

  const editar = async (id) => {
    try {
      const permiso = await permisoService.filtrarPorIdPermiso(id);
      setForm(permiso);
      setModoEdicion(true);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar el permiso para editar", "error");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {modoEdicion ? "Editar Permiso" : "Nuevo Permiso"}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
        ></textarea>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {modoEdicion ? "Actualizar" : "Agregar"}
        </button>
        {modoEdicion && (
          <button
            type="button"
            onClick={() => {
              setModoEdicion(false);
              setForm({ idPermiso: "", nombre: "", descripcion: "" });
            }}
            className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
      </form>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Lista de Permisos
      </h3>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Cargando...</p>
      ) : permisos.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No hay permisos registrados.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                ID
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                Nombre
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                Descripción
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permisos.map((permiso) => (
              <tr key={permiso.idPermiso} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  {permiso.idPermiso}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  {permiso.nombre}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  {permiso.descripcion}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                  <button
                    onClick={() => editar(permiso.idPermiso)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    title="Editar"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FrmPermisos;
