import React, { useEffect, useState } from "react";
import inscripcionService from "../../services/Inscripcion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FaPlus, FaEdit } from "react-icons/fa";

const MySwal = withReactContent(Swal);

const FrmInscripcion = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ idInscripcion: "", nombre: "", activo: true });

  const listarInscripciones = async () => {
    try {
      const data = await inscripcionService.listarInscripciones();
      setInscripciones(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    listarInscripciones();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const limpiarFormulario = () => {
    setForm({ idInscripcion: "", nombre: "", activo: true });
    setModoEdicion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      return MySwal.fire("Campo vacío", "El nombre es obligatorio", "warning");
    }

    try {
      if (modoEdicion) {
        await inscripcionService.actualizarInscripcion(form);
        MySwal.fire("Actualizado", "Inscripción actualizada con éxito", "success");
      } else {
        await inscripcionService.insertarInscripcion(form);
        MySwal.fire("Registrado", "Inscripción registrada con éxito", "success");
      }
      limpiarFormulario();
      listarInscripciones();
    } catch (error) {
      MySwal.fire("Error", error.message, "error");
    }
  };

  const editar = (dato) => {
    setForm(dato);
    setModoEdicion(true);
  };

  const filtradas = inscripciones.filter((i) =>
    i.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Inscripciones</h2>

      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full p-2 rounded bg-gray-800 text-white"
      />

      <form onSubmit={handleSubmit} className="bg-gray-900 p-4 rounded shadow mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="p-2 rounded bg-gray-800 text-white"
          />

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />
            Activo
          </label>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {modoEdicion ? <><FaEdit /> Actualizar</> : <><FaPlus /> Registrar</>}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white bg-gray-800 rounded">
          <thead className="text-xs uppercase bg-gray-700">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Creación</th>
              <th className="px-4 py-2">Modificación</th>
              <th className="px-4 py-2">Creador</th>
              <th className="px-4 py-2">Modificador</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((i) => (
              <tr key={i.idInscripcion} className="border-t border-gray-700">
                <td className="px-4 py-2">{i.nombre}</td>
                <td className="px-4 py-2">{i.activo ? "Sí" : "No"}</td>
                <td className="px-4 py-2">{i.fechaCreacion}</td>
                <td className="px-4 py-2">{i.fechaModificacion}</td>
                <td className="px-4 py-2">{i.creadoPor}</td>
                <td className="px-4 py-2">{i.modificadoPor}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => editar(i)}
                    className="text-yellow-400 hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrmInscripcion;