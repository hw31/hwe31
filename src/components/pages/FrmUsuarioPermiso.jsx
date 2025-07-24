import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import usuariosPermisoService from '../../services/UsuariosPermiso';
import { FaPlus, FaEdit } from 'react-icons/fa';

const FrmUsuariosPermiso = () => {
  const [permisos, setPermisos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    idUsuarioPermiso: 0,
    idUsuario: '',
    idPermiso: '',
    estado: 'Activo'
  });

  const obtenerDatos = async () => {
    const res = await usuariosPermisoService.listarUsuariosPermiso();
    if (res.success) setPermisos(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setForm({ idUsuarioPermiso: 0, idUsuario: '', idPermiso: '', estado: 'Activo' });
    setModoEdicion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      idUsuario: Number(form.idUsuario),
      idPermiso: Number(form.idPermiso),
      estado: form.estado
    };

    try {
      let res;
      if (modoEdicion) {
        datos.idUsuarioPermiso = form.idUsuarioPermiso;
        res = await usuariosPermisoService.actualizarUsuarioPermiso(datos);
      } else {
        res = await usuariosPermisoService.insertarUsuarioPermiso(datos);
      }

      if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        obtenerDatos();
        limpiarFormulario();
      } else {
        Swal.fire('Error', res.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error en la operación', 'error');
    }
  };

  const seleccionar = async (permiso) => {
    setForm({ ...permiso });
    setModoEdicion(true);
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Permisos por Usuario</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="number"
          name="idUsuario"
          placeholder="ID Usuario"
          value={form.idUsuario}
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-900 text-white"
        />
        <input
          type="number"
          name="idPermiso"
          placeholder="ID Permiso"
          value={form.idPermiso}
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-900 text-white"
        />
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="p-2 rounded bg-gray-900 text-white"
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button
          type="submit"
          className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center gap-2"
        >
          {modoEdicion ? <FaEdit /> : <FaPlus />}
          {modoEdicion ? 'Actualizar' : 'Registrar'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-gray-950 text-white rounded shadow">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Permiso</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permisos.map((p) => (
              <tr key={p.idUsuarioPermiso} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-2 text-center">{p.idUsuarioPermiso}</td>
                <td className="p-2 text-center">{p.idUsuario}</td>
                <td className="p-2 text-center">{p.idPermiso}</td>
                <td className="p-2 text-center">{p.estado}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => seleccionar(p)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
            {permisos.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay permisos asignados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrmUsuariosPermiso;
