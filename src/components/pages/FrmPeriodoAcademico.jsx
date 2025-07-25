import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";

const FrmPeriodoAcademico = () => {
  const [periodos, setPeriodos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    // Aquí puedes cargar datos mock o reales
    setPeriodos([
      { id: 1, nombre: "2024-I", fechaInicio: "2024-01-15", fechaFin: "2024-06-30" },
      { id: 2, nombre: "2024-II", fechaInicio: "2024-07-01", fechaFin: "2024-12-15" },
    ]);
  }, []);

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => {
    setModalAbierto(false);
    setFormData({ nombre: "", fechaInicio: "", fechaFin: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevoPeriodo = { id: Date.now(), ...formData };
    setPeriodos((prev) => [...prev, nuevoPeriodo]);
    cerrarModal();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Periodos Académicos</h2>

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={abrirModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Agregar Periodo
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Nombre</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Fecha Inicio</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Fecha Fin</th>
              <th className="px-4 py-2 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {periodos.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-sm">{p.nombre}</td>
                <td className="px-4 py-2 text-sm">{p.fechaInicio}</td>
                <td className="px-4 py-2 text-sm">{p.fechaFin}</td>
                <td className="px-4 py-2 text-center text-sm">
                  <button
                    className="text-yellow-500 hover:text-yellow-700"
                    onClick={() => {
                      setFormData(p);
                      setModalAbierto(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
            {periodos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  No hay periodos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Periodo Académico</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre del periodo"
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmPeriodoAcademico;
