import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import usuariosRolesService from '../../services/UsuariosRoles';
import { FaPlus, FaEdit } from 'react-icons/fa';

const FrmUsuariosRoles = () => {
  const [usuariosRoles, setUsuariosRoles] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    idUsuarioRol: 0,
    idUsuario: '',
    idRol: '',
    estado: 'Activo'
  });

  const obtenerDatos = async () => {
    const res = await usuariosRolesService.listarUsuariosRoles();
    if (res && Array.isArray(res)) {
      setUsuariosRoles(res);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setForm({ idUsuarioRol: 0, idUsuario: '', idRol: '', estado: 'Activo' });
    setModoEdicion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      idUsuario: Number(form.idUsuario),
      idRol: Number(form.idRol),
      estado: form.estado
    };

    try {
      let res;
      if (modoEdicion) {
        datos.idUsuarioRol = form.idUsuarioRol;
        res = await usuariosRolesService.actualizarUsuarioRol(datos);
      } else {
        res = await usuariosRolesService.insertarUsuarioRol(datos);
      }

      if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        obtenerDatos();
        limpiarFormulario();
      } else {
        Swal.fire('Error', res.message || 'No se pudo completar la operación.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error en la operación', 'error');
    }
  };

  const seleccionar = (relacion) => {
    setForm({ ...relacion });
    setModoEdicion(true);
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Roles por Usuario</h2>

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
          name="idRol"
          placeholder="ID Rol"
          value={form.idRol}
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
              <th className="p-2">Rol</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosRoles.map((rel) => (
              <tr key={rel.idUsuarioRol} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-2 text-center">{rel.idUsuarioRol}</td>
                <td className="p-2 text-center">{rel.idUsuario}</td>
                <td className="p-2 text-center">{rel.idRol}</td>
                <td className="p-2 text-center">{rel.estado}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => seleccionar(rel)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
            {usuariosRoles.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrmUsuariosRoles;
