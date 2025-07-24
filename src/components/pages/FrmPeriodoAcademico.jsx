import React, { useState, useEffect } from "react";
import periodoService from "../../services/PeriodoAcademico"; 
import Swal from "sweetalert2";

const FrmPeriodosAcademicos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [form, setForm] = useState({ idPeriodo: "", nombre: "", fechaInicio: "", fechaFin: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      setLoading(true);
      const data = await periodoService.listarPeriodosAcademicos();
      setPeriodos(data);
    } catch (error) {
      console.error("Error cargando periodos", error);
      Swal.fire("Error", "No se pudieron cargar los periodos académicos", "error");
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
      return Swal.fire("Atención", "El nombre del periodo es obligatorio", "warning");
    }
    if (!form.fechaInicio) {
      return Swal.fire("Atención", "La fecha de inicio es obligatoria", "warning");
    }
    if (!form.fechaFin) {
      return Swal.fire("Atención", "La fecha de fin es obligatoria", "warning");
    }
    try {
      if (modoEdicion) {
        const res = await periodoService.actualizarPeriodoAcademico(form);
        if (res.success) {
          Swal.fire("Actualizado", "Periodo académico actualizado correctamente", "success");
          setModoEdicion(false);
          setForm({ idPeriodo: "", nombre: "", fechaInicio: "", fechaFin: "" });
          cargarPeriodos();
        }
      } else {
        const res = await periodoService.insertarPeriodoAcademico(form);
        if (res.success) {
          Swal.fire("Agregado", "Periodo académico insertado correctamente", "success");
          setForm({ idPeriodo: "", nombre: "", fechaInicio: "", fechaFin: "" });
          cargarPeriodos();
        }
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar el periodo académico", "error");
    }
  };

  const editar = async (id) => {
    try {
      const periodo = await periodoService.filtrarPorIdPeriodo(id);
      setForm(periodo);
      setModoEdicion(true);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar el periodo para editar", "error");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {modoEdicion ? "Editar Periodo Académico" : "Nuevo Periodo Académico"}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del periodo"
          value={form.nombre}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <div className="flex gap-4">
          <input
            type="date"
            name="fechaInicio"
            placeholder="Fecha de inicio"
            value={form.fechaInicio}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            name="fechaFin"
            placeholder="Fecha de fin"
            value={form.fechaFin}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {modoEdicion ? "Actualizar" : "Agregar"}
        </button>
        {modoEdicion && (
          <button
            type="button"
            onClick={() => {
              setModoEdicion(false);
              setForm({ idPeriodo: "", nombre: "", fechaInicio: "", fechaFin: "" });
            }}
            className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
      </form>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Lista de Periodos Académicos
      </h3>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Cargando...</p>
      ) : periodos.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No hay periodos académicos registrados.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Nombre</th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Fecha Inicio</th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Fecha Fin</th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.idPeriodo} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{p.idPeriodo}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{p.nombre}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{p.fechaInicio}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{p.fechaFin}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                  <button
                    onClick={() => editar(p.idPeriodo)}
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

export default FrmPeriodosAcademicos;
