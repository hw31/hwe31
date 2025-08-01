import React, { useEffect, useState } from 'react';
import direccionService from '../../services/Direccion';
import Swal from 'sweetalert2';
import { FaEdit } from 'react-icons/fa';

const FrmDireccion = () => {
  const [direcciones, setDirecciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    idDireccion: 0,
    idPersona: '',
    idTipoDireccion: '',
    detalleDireccion: '',
    codigoPostal: '',
    municipio: '',
    departamento: '',
    referencia: '',
    idEstado: 1
  });

  const limpiar = () => {
    setForm({
      idDireccion: 0,
      idPersona: '',
      idTipoDireccion: '',
      detalleDireccion: '',
      codigoPostal: '',
      municipio: '',
      departamento: '',
      referencia: '',
      idEstado: 1
    });
    setModoEdicion(false);
  };

  const obtenerDirecciones = async () => {
    try {
      const res = await direccionService.listarDirecciones();
      setDirecciones(res.resultado ?? []);
    } catch (error) {
      console.error('Error al listar direcciones:', error);
    }
  };

  useEffect(() => {
    obtenerDirecciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await direccionService.actualizarDireccion(form);
        Swal.fire('Actualizado', 'Dirección actualizada correctamente', 'success');
      } else {
        await direccionService.insertarDireccion(form);
        Swal.fire('Registrado', 'Dirección registrada correctamente', 'success');
      }
      obtenerDirecciones();
      limpiar();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la dirección', 'error');
    }
  };

  const editarDireccion = (direccion) => {
    setForm(direccion);
    setModoEdicion(true);
  };

  const direccionesFiltradas = direcciones.filter((d) =>
    d.nombrePersona?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Direcciones</h2>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre de persona..."
        className="mb-4 p-2 border rounded w-full"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-white p-4 rounded mb-6 shadow-md space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="idPersona"
            placeholder="ID Persona"
            className="p-2 rounded text-black"
            value={form.idPersona}
            onChange={handleChange}
            required
          />
          <input
            name="idTipoDireccion"
            placeholder="ID Tipo Dirección"
            className="p-2 rounded text-black"
            value={form.idTipoDireccion}
            onChange={handleChange}
            required
          />
          <input
            name="detalleDireccion"
            placeholder="Detalle"
            className="p-2 rounded text-black"
            value={form.detalleDireccion}
            onChange={handleChange}
          />
          <input
            name="codigoPostal"
            placeholder="Código Postal"
            className="p-2 rounded text-black"
            value={form.codigoPostal}
            onChange={handleChange}
          />
          <input
            name="municipio"
            placeholder="Municipio"
            className="p-2 rounded text-black"
            value={form.municipio}
            onChange={handleChange}
          />
          <input
            name="departamento"
            placeholder="Departamento"
            className="p-2 rounded text-black"
            value={form.departamento}
            onChange={handleChange}
          />
          <input
            name="referencia"
            placeholder="Referencia"
            className="p-2 rounded text-black"
            value={form.referencia}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
          >
            {modoEdicion ? 'Actualizar' : 'Registrar'}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={limpiar}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 text-white rounded">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Persona</th>
              <th className="p-2">Detalle</th>
              <th className="p-2">Municipio</th>
              <th className="p-2">Departamento</th>
              <th className="p-2">Referencia</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {direccionesFiltradas.map((d) => (
              <tr key={d.idDireccion} className="border-b border-gray-600">
                <td className="p-2">{d.nombrePersona}</td>
                <td className="p-2">{d.detalleDireccion}</td>
                <td className="p-2">{d.municipio}</td>
                <td className="p-2">{d.departamento}</td>
                <td className="p-2">{d.referencia}</td>
                <td className="p-2">
                  <button
                    onClick={() => editarDireccion(d)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-black"
                  >
                    <FaEdit />
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

export default FrmDireccion;
