import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import EstadoService from '../../services/Estado'; 
import Swal from 'sweetalert2';
import {
  FaPlus,
  FaEdit,
  FaUser,
  FaUserCheck,
  FaUserTimes,
} from 'react-icons/fa';

const FrmEstados = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    idEstado: null,
    nombreEstado: '',
    descripcion: '',
    activo: true,
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtrado y conteos
  const total = estados.length;
  const activos = estados.filter(e => e.activo).length;
  const inactivos = total - activos;

  useEffect(() => {
    cargarEstados();
  }, []);

  const cargarEstados = async () => {
    setLoading(true);
    try {
      const res = await EstadoService.listarEstados();
      if (res.success) setEstados(res.data);
      else throw new Error(res.message);
    } catch (err) {
      console.error('Error al cargar estados:', err);
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const abrirAgregar = () => {
    setModoEdicion(false);
    setForm({ idEstado: null, nombreEstado: '', descripcion: '', activo: true });
    setModalOpen(true);
    setError('');
  };

  const abrirEditar = (estado) => {
    setModoEdicion(true);
    setForm({
      idEstado: estado.iD_Estado,
      nombreEstado: estado.nombre_Estado,
      descripcion: estado.descripcion,
      activo: estado.activo,
    });
    setModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreEstado.trim()) {
      setError('Ingrese un nombre válido.');
      return;
    }

    try {
      let res;
      const payload = {
        iD_Estado: form.idEstado,
        nombre_Estado: form.nombreEstado.trim(),
        descripcion: form.descripcion.trim(),
        activo: form.activo,
      };

      if (modoEdicion) {
        res = await EstadoService.actualizarEstado(payload);
      } else {
        // para inserción, no enviamos id
        const { iD_Estado, ...insertPayload } = payload;
        res = await EstadoService.insertarEstado(insertPayload);
      }

      if (res.success || (res.mensaje && res.mensaje.toLowerCase().includes('correctamente'))) {
        Swal.fire({
          icon: 'success',
          title: modoEdicion ? 'Estado actualizado' : 'Estado registrado',
          text: res.mensaje || 'Operación exitosa',
          timer: 2000,
          showConfirmButton: false,
        });

        setModalOpen(false);
        setForm({ idEstado: null, nombreEstado: '', descripcion: '', activo: true });
        setModoEdicion(false);
        cargarEstados();
      } else {
        throw new Error(res.mensaje || 'Ocurrió un error en el servidor.');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Filtrado con búsqueda (nombre, descripción y activo/inactivo)
  const estadosFiltrados = estados.filter((e) => {
    const txt = busqueda.toLowerCase();
    return (
      e.nombre_Estado?.toLowerCase().includes(txt) ||
      e.descripcion?.toLowerCase().includes(txt) ||
      (txt === 'activo' && e.activo) ||
      (txt === 'inactivo' && !e.activo)
    );
  });

  return (
    <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h2 className="text-3xl font-semibold mb-6">Gestión de Estados</h2>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre, descripción o estado (activo/inactivo)..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className={`w-full max-w-lg p-3 mb-6 rounded border focus:outline-none focus:ring-2 ${
          modoOscuro
            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-400'
            : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-600'
        }`}
      />

      {/* Contadores y Botón */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex gap-6 flex-wrap justify-center md:justify-start">
          {/* Activos */}
          <div
            className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default
              bg-gradient-to-br from-green-600 to-green-800 text-white
              hover:brightness-110 transition"
            title="Estados activos"
          >
            <FaUserCheck size={20} />
            Activos:
            <span className="ml-1 text-xl">{activos}</span>
          </div>
          {/* Inactivos */}
          <div
            className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default
              bg-gradient-to-br from-red-600 to-red-800 text-white
              hover:brightness-110 transition"
            title="Estados inactivos"
          >
            <FaUserTimes size={20} />
            Inactivos:
            <span className="ml-1 text-xl">{inactivos}</span>
          </div>
          {/* Total */}
          <div
            className="flex items-center gap-2 rounded-lg px-5 py-3 font-semibold shadow-md cursor-default
              bg-gradient-to-br from-blue-600 to-blue-800 text-white
              hover:brightness-110 transition"
            title="Total de estados"
          >
            <FaUser size={20} />
            Total:
            <span className="ml-1 text-xl">{total}</span>
          </div>
        </div>

        <button
          onClick={abrirAgregar}
          className="mt-2 md:mt-0 bg-blue-700 hover:bg-blue-800 transition text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow"
          aria-label="Agregar nuevo estado"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow">
        <table className="min-w-full text-left text-sm">
          <thead
            className={`${
              modoOscuro
                ? 'bg-gray-800 text-gray-200'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Activo</th>
              <th className="p-3">Fecha creación</th>
              <th className="p-3">Fecha modificación</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : estadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No se encontraron estados.
                </td>
              </tr>
            ) : (
              estadosFiltrados.map((e, i) => (
                <tr
                  key={e.iD_Estado}
                  className={`border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                >
                  <td className="p-3 align-middle">{i + 1}</td>
                  <td className="p-3 align-middle">{e.nombre_Estado}</td>
                  <td className="p-3 align-middle">{e.descripcion || '-'}</td>
                  <td className="p-3 align-middle">
                    {e.activo ? (
                      <span className="inline-block px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-600 text-white rounded-full text-xs font-semibold">
                        No
                      </span>
                    )}
                  </td>
                  <td className="p-3 align-middle">
                    {new Date(e.fecha_Creacion).toLocaleDateString()}
                  </td>
                  <td className="p-3 align-middle">
                    {new Date(e.fecha_Modificacion).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <button
                      onClick={() => abrirEditar(e)}
                      className="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                      aria-label={`Editar estado ${e.nombre_Estado}`}
                    >
                      <FaEdit />
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-xl font-semibold mb-4">
              {modoEdicion ? 'Editar Estado' : 'Nuevo Estado'}
            </h3>

            <label htmlFor="nombreEstado" className="block font-semibold mb-1">
              Nombre del estado <span className="text-red-600">*</span>
            </label>
            <input
              id="nombreEstado"
              name="nombreEstado"
              type="text"
              value={form.nombreEstado}
              onChange={handleChange}
              className={`w-full p-2 rounded border
                ${modoOscuro ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-900'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4`}
              required
              autoFocus
            />

            <label htmlFor="descripcion" className="block font-semibold mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className={`w-full p-2 rounded border resize-none
                ${modoOscuro ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-900'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4`}
              rows={3}
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
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition"
              >
                {modoEdicion ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FrmEstados;
