import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import permisoService from '../../services/Permiso';
import {
  FaPlus, FaEdit, FaUser, FaUserCheck, FaUserTimes,
} from 'react-icons/fa';

const FrmPermisos = () => {
  const modoOscuro = useSelector(state => state.theme.modoOscuro);
  const [permisos, setPermisos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({ idPermiso: null, nombrePermiso: '', activo: true });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = permisos.length;
  const activos = permisos.filter(p => p.activo).length;
  const inactivos = total - activos;

  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {
    setLoading(true);
    try {
      const res = await permisoService.listarPermisos();
      if (res.resultado) {
        setPermisos(res.resultado);
      } else {
        throw new Error('No se pudo obtener la lista de permisos.');
      }
    } catch (err) {
      Swal.fire('Error al cargar', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const abrirAgregar = () => {
    setModoEdicion(false);
    setForm({ idPermiso: null, nombrePermiso: '', activo: true });
    setModalOpen(true);
  };

  const abrirEditar = (permiso) => {
    setModoEdicion(true);
    setForm({
      idPermiso: permiso.idPermiso,
      nombrePermiso: permiso.nombrePermiso,
      activo: permiso.activo,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombrePermiso.trim()) {
      setError('Ingrese un nombre válido.');
      return;
    }

    try {
      let res;
      if (modoEdicion) {
        res = await permisoService.actualizarPermiso({
          idPermiso: form.idPermiso,
          nombrePermiso: form.nombrePermiso.trim(),
          activo: form.activo,
        });
      } else {
        res = await permisoService.insertarPermiso({
          nombrePermiso: form.nombrePermiso.trim(),
          activo: form.activo,
        });
      }

      if (res.success || res.mensaje?.toLowerCase().includes('correctamente')) {
        Swal.fire({
          icon: 'success',
          title: modoEdicion ? 'Permiso actualizado' : 'Permiso registrado',
          text: res.mensaje || 'Operación exitosa',
          timer: 2000,
          showConfirmButton: false,
        });
        setModalOpen(false);
        setForm({ idPermiso: null, nombrePermiso: '', activo: true });
        setModoEdicion(false);
        cargarPermisos();
      } else {
        throw new Error(res.mensaje || 'Error en el servidor.');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const permisosFiltrados = permisos.filter(p => {
    const txt = busqueda.toLowerCase();
    return (
      p.nombrePermiso?.toLowerCase().includes(txt) ||
      p.creador?.toLowerCase().includes(txt) ||
      p.modificador?.toLowerCase().includes(txt) ||
      (txt === 'activo' && p.activo) ||
      (txt === 'inactivo' && !p.activo)
    );
  });

  return (
    <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h2 className="text-3xl font-semibold mb-6">Gestión de Permisos</h2>

      <input
        type="text"
        placeholder="Buscar por nombre, creador, modificador o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className={`w-full max-w-lg p-3 mb-6 rounded border focus:outline-none focus:ring-2 ${
          modoOscuro
            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-400'
            : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-600'
        }`}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex gap-6 flex-wrap justify-center md:justify-start">
          <div className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default bg-gradient-to-br from-green-600 to-green-800 text-white hover:brightness-110 transition">
            <FaUserCheck /> Activos: <span className="ml-1 text-xl">{activos}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default bg-gradient-to-br from-red-600 to-red-800 text-white hover:brightness-110 transition">
            <FaUserTimes /> Inactivos: <span className="ml-1 text-xl">{inactivos}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:brightness-110 transition">
            <FaUser /> Total: <span className="ml-1 text-xl">{total}</span>
          </div>
        </div>

        <button
          onClick={abrirAgregar}
          className="mt-2 md:mt-0 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow">
        <table className="min-w-full text-left text-sm">
          <thead className={`${modoOscuro ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
            <tr>
              {/*<th className="p-3">#</th>*/}
              <th className="p-3">Nombre</th>
              <th className="p-3">Creador</th>
              <th className="p-3">Modificador</th>
              <th className="p-3">Activo</th>
              <th className="p-3">Fecha creación</th>
              <th className="p-3">Fecha modificación</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Cargando...</td>
              </tr>
            ) : permisosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">No se encontraron permisos.</td>
              </tr>
            ) : (
              permisosFiltrados.map((p, i) => (
                <tr key={p.idPermiso} className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  {/*<td className="p-3">{i + 1}</td>*/}
                  <td className="p-3">{p.nombrePermiso}</td>
                  <td className="p-3">{p.creador}</td>
                  <td className="p-3">{p.modificador}</td>
                  <td className="p-3">
                    {p.activo ? (
                      <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Sí</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-3">{new Date(p.fechaCreacion).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(p.fechaModificacion).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${modoOscuro ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            <h3 className="text-xl font-semibold mb-4">{modoEdicion ? 'Editar Permiso' : 'Nuevo Permiso'}</h3>

            <label className="block mb-1 font-semibold">Nombre del Permiso <span className="text-red-500">*</span></label>
            <input
              name="nombrePermiso"
              type="text"
              value={form.nombrePermiso}
              onChange={handleChange}
              className={`w-full p-2 rounded border focus:outline-none focus:ring-2 mb-4 ${
                modoOscuro ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'bg-gray-100 border-gray-300 text-black focus:ring-blue-600'
              }`}
              required
            />

            <label className="inline-flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Activo</span>
            </label>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-300 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded">
                {modoEdicion ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FrmPermisos;
