import React, { useEffect, useState } from "react";
import horariosService from "../../services/Horarios";
import Swal from "sweetalert2";
import { FaEdit, FaPlus } from "react-icons/fa";

const FrmHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({ horaInicio: "", horaFin: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const obtenerHorarios = async () => {
    try {
      const data = await horariosService.listarHorarios();
      setHorarios(data);
    } catch (error) {
      console.error("Error al obtener horarios:", error.message);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const limpiar = () => {
    setForm({ horaInicio: "", horaFin: "" });
    setModoEdicion(false);
    setIdEditar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await horariosService.actualizarHoraios({ idHorario: idEditar, ...form });
        Swal.fire("Actualizado", "Horario actualizado correctamente", "success");
      } else {
        await horariosService.insertarHorarios(form);
        Swal.fire("Registrado", "Horario registrado correctamente", "success");
      }
      limpiar();
      obtenerHorarios();
      setAbrirModal(false);
    } catch (error) {
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
    }
  };

  const abrirEditar = async (id) => {
    try {
      const res = await horariosService.filtrarPorIdHorario(id);
      if (res.success || res.data) {
        const datos = res.resultado || res.data || res;
        setForm({
          horaInicio: datos.horaInicio || "",
          horaFin: datos.horaFin || "",
        });
        setIdEditar(id);
        setModoEdicion(true);
        setAbrirModal(true);
      }
    } catch (error) {
      console.error("Error al filtrar horario:", error.message);
    }
  };

  useEffect(() => {
    obtenerHorarios();
  }, []);

  return (
    <div className="p-4">
      {/* Encabezado y botón agregar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Gestión de Horarios</h2>
        <button
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded"
          onClick={() => setAbrirModal(true)}
        >
          <FaPlus /> Agregar
        </button>
      </div>

      {/* Tabla de horarios */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full text-sm text-white bg-[#0a192f]">
          <thead>
            <tr className="bg-[#112240] text-left">
              <th className="p-3">#</th>
              <th className="p-3">Hora Inicio</th>
              <th className="p-3">Hora Fin</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, i) => (
              <tr key={h.idHorario} className="hover:bg-[#233554]">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{h.horaInicio}</td>
                <td className="p-3">{h.horaFin}</td>
                <td className="p-3">
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    onClick={() => abrirEditar(h.idHorario)}
                  >
                    <FaEdit /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal personalizado */}
      {abrirModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#0f172a] rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              {modoEdicion ? "Editar Horario" : "Registrar Horario"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Hora Inicio</label>
                <input
                  type="time"
                  name="horaInicio"
                  value={form.horaInicio}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded bg-[#112240] text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Hora Fin</label>
                <input
                  type="time"
                  name="horaFin"
                  value={form.horaFin}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded bg-[#112240] text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirModal(false);
                    limpiar();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {modoEdicion ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmHorarios;
