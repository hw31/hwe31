import React, { useState, useEffect } from "react";
import grupoService from "../../services/Grupos";
import Swal from "sweetalert2";
import { FaPlus, FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";

const FrmGrupos = () => {
  const modoOscuro = useSelector(state => state.modoOscuro);
  const [grupos, setGrupos] = useState([]);
  const [form, setForm] = useState({ nombreGrupo: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarGrupos = async () => {
    try {
      const res = await grupoService.listarGrupos();
      setGrupos(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({ nombreGrupo: "" });
    setModoEdicion(false);
    setIdEditar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreGrupo.trim()) {
      Swal.fire("Campo requerido", "El nombre del grupo es obligatorio", "warning");
      return;
    }

    try {
      const datos = { nombreGrupo: form.nombreGrupo.trim() };

      const res = modoEdicion
        ? await grupoService.actualizarGrupo({ idGrupo: idEditar, ...datos })
        : await grupoService.insertarGrupos(datos);

      if (res.success) {
        Swal.fire("¡Éxito!", res.message || "Operación realizada correctamente", "success");
        cargarGrupos();
        limpiarFormulario();
      } else {
        Swal.fire("Error", res.message || "Ocurrió un error", "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo completar la operación", "error");
    }
  };

  const editarGrupo = async (grupo) => {
    setForm({ nombreGrupo: grupo.nombreGrupo });
    setModoEdicion(true);
    setIdEditar(grupo.idGrupo);
  };

  const gruposFiltrados = grupos.filter((g) =>
    g.nombreGrupo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Gestión de Grupos</h2>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar grupo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 mb-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            name="nombreGrupo"
            placeholder="Nombre del grupo"
            value={form.nombreGrupo}
            onChange={handleInput}
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          />
          <button
            type="submit"
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${
              modoEdicion ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {modoEdicion ? <FaEdit /> : <FaPlus />}
            {modoEdicion ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-800 text-left">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nombre del Grupo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gruposFiltrados.length > 0 ? (
              gruposFiltrados.map((grupo, index) => (
                <tr
                  key={grupo.idGrupo}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-300 dark:border-gray-600"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{grupo.nombreGrupo}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => editarGrupo(grupo)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No se encontraron grupos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrmGrupos;
