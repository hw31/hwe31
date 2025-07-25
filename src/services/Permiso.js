import api from './api';

/* INSERTAR */
const insertarPermiso = async (datosPermiso) => {
  try {
    const res = await api.post('Permisos/insertar', datosPermiso);

    if (res.data.success) {
      console.log('Permiso insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar permiso:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarPermiso = async (datosPermiso) => {
  try {
    const res = await api.put('Permisos/actualizar', datosPermiso);

    if (res.data.success) {
      console.log('Permiso actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar permiso:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdPermiso = async (idPermiso) => {
  try {
    const res = await api.get('Permisos/filtrar_por_id', {
      params: { idPermiso }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar permiso por ID:', error.message);
    throw error;
  }
};

/* LISTAR PERMISOS */
const listarPermisos = async () => {
  try {
    const res = await api.get('Permisos/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar permisos:', error.message);
    throw error;
  }
};

export default {
  insertarPermiso,
  actualizarPermiso,
  filtrarPorIdPermiso,
  listarPermisos
};
