import React, { useEffect, useState } from 'react';
import contactoService from '../../services/Contacto';
import Swal from 'sweetalert2';
import { FaEdit, FaPlus } from 'react-icons/fa';

const FrmContacto = () => {
  const [contactos, setContactos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    idContacto: 0,
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    activo: true
  });

  const obtenerContactos = async () => {
    try {
      const res = await contactoService.listarContacto();
      setContactos(res);
    } catch (error) {
      console.error('Error al listar contactos:', error);
    }
  };

  useEffect(() => {
    obtenerContactos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const limpiar = () => {
    setForm({
      idContacto: 0,
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      activo: true
    });
    setModoEdicion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await contactoService.actualizarContacto(form);
        Swal.fire('Actualizado', 'Contacto actualizado correctamente', 'success');
      } else {
        await contactoService.insertarContacto(form);
        Swal.fire('Registrado', 'Contacto registrado correctamente', 'success');
      }
      obtenerContactos();
      limpiar();
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al guardar', 'error');
    }
  };

  const editarContacto = (contacto) => {
    setForm(contacto);
    setModoEdicion(true);
  };

  const contactosFiltrados = contactos.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Contactos</h2>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
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
            type="text"
            name="nombre"
            placeholder="Nombre"
            className="p-2 rounded text-black"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className="p-2 rounded text-black"
            value={form.telefono}
            onChange={handleChange}
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            className="p-2 rounded text-black"
            value={form.correo}
            onChange={handleChange}
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            className="p-2 rounded text-black"
            value={form.direccion}
            onChange={handleChange}
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

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {modoEdicion ? 'Actualizar' : 'Registrar'}
        </button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 text-white rounded">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Nombre</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Dirección</th>
              <th className="p-2">Activo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contactosFiltrados.map((c) => (
              <tr key={c.idContacto} className="border-b border-gray-600">
                <td className="p-2">{c.nombre}</td>
                <td className="p-2">{c.telefono}</td>
                <td className="p-2">{c.correo}</td>
                <td className="p-2">{c.direccion}</td>
                <td className="p-2">{c.activo ? 'Sí' : 'No'}</td>
                <td className="p-2">
                  <button
                    onClick={() => editarContacto(c)}
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

export default FrmContacto;
