import React, { useEffect, useState } from "react";
import catalogoService from "../../services/Catalogos";
import Swal from "sweetalert2";
import { FaEdit, FaPlus } from "react-icons/fa";

const FrmCatalogos = () => {
  const [catalogos, setCatalogos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    idCatalogo: 0,
    descripcionCatalogo: "",
    idTipoCatalogo: 0,
    activo: true,
    creador: "",
    modificador: "",
    fechaCreacion: "",
    fechaModificacion: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerCatalogos();
  }, []);

  const obtenerCatalogos = async () => {
    try {
      const res = await catalogoService.listarCatalogo();
      setCatalogos(res.resultado || []);
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener el listado de catálogos', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const abrirAgregar = () => {
    setForm({
      idCatalogo: 0,
      descripcionCatalogo: "",
      idTipoCatalogo: 0,
      activo: true,
      creador: "",
      modificador: "",
      fechaCreacion: "",
      fechaModificacion: "",
    });
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setForm(item);
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { descripcionCatalogo, idTipoCatalogo } = form;

    if (!descripcionCatalogo || !idTipoCatalogo) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      let res;
      if (modoEdicion) {
        res = await catalogoService.actualizarCatalogo(form);
      } else {
        res = await catalogoService.insertarCatalogo(form);
      }

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: modoEdicion ? 'Actualizado' : 'Registrado',
          text: res.message || 'Operación exitosa',
          timer: 2000,
          showConfirmButton: false,
        });
        setModalOpen(false);
        obtenerCatalogos();
      } else {
        throw new Error(res.message || 'Error al guardar');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const catalogosFiltrados = catalogos.filter((c) =>
    c.descripcionCatalogo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 transition-all">
      <h2 className="text-2xl font-bold mb-4">Gestión de Catálogos</h2>

      <input
        type="text"
        placeholder="Buscar por descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 px-4 py-2 border dark:border-gray-700 dark:bg-[#2a2a2a] rounded w-full max-w-md"
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={abrirAgregar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white dark:bg-[#222] rounded-lg shadow">
          <thead className="bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Activo</th>
              <th className="px-4 py-2 text-left">Creador</th>
              <th className="px-4 py-2 text-left">F. Creación</th>
              <th className="px-4 py-2 text-left">Modificador</th>
              <th className="px-4 py-2 text-left">F. Modificación</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catalogosFiltrados.map((item) => (
              <tr key={item.idCatalogo} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{item.descripcionCatalogo}</td>
                <td className="px-4 py-2">{item.idTipoCatalogo}</td>
                <td className="px-4 py-2">{item.activo ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2">{item.creador || '-'}</td>
                <td className="px-4 py-2">{item.fechaCreacion?.split('T')[0] || '-'}</td>
                <td className="px-4 py-2">{item.modificador || '-'}</td>
                <td className="px-4 py-2">{item.fechaModificacion?.split('T')[0] || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => abrirEditar(item)}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <FaEdit /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="mt-6 p-4 border dark:border-gray-700 rounded bg-gray-50 dark:bg-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Descripción */}
            <input
              type="text"
              name="descripcionCatalogo"
              value={form.descripcionCatalogo}
              onChange={handleChange}
              placeholder="Descripción del catálogo"
              className="border p-2 rounded dark:bg-[#1e1e1e] dark:border-gray-600"
            />

            {/* Tipo */}
            <input
              type="number"
              name="idTipoCatalogo"
              value={form.idTipoCatalogo}
              onChange={handleChange}
              placeholder="ID Tipo Catálogo"
              className="border p-2 rounded dark:bg-[#1e1e1e] dark:border-gray-600"
            />

            {/* Activo */}
            <div className="flex items-center gap-2">
              <label htmlFor="activo">Activo:</label>
              <input
                type="checkbox"
                name="activo"
                id="activo"
                checked={form.activo}
                onChange={handleChange}
              />
            </div>

            {/* Error */}
            {error && <div className="text-red-500">{error}</div>}

            {/* Botones */}
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                {modoEdicion ? 'Actualizar' : 'Registrar'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FrmCatalogos;
