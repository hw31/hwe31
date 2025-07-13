import api from './api';

/* INSERTAR */
const insertarUsuarioPermiso = async (datos) => {
  try {
    const res = await api.post('UsuariosPermiso/INSERTAR', datos);

    if (res.data.success) {
      console.log('Permiso asignado al usuario correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar permiso de usuario:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarUsuarioPermiso = async (datos) => {
  try {
    const res = await api.put('UsuariosPermiso/actualizar', datos);

    if (res.data.success) {
      console.log('Permiso de usuario actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar permiso de usuario:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdUsuarioPermiso = async (idUsuarioPermiso) => {
  try {
    const res = await api.get('UsuariosPermiso/Filtrar_Por_ID', {
      params: { idUsuarioPermiso }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar permiso de usuario por ID:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID_USUARIO */
const filtrarPorIdUsuario = async (idUsuario) => {
  try {
    const res = await api.get('UsuariosPermiso/Filtrar_Por_UsuarioID', {
      params: { idUsuario }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar permisos por usuario:', error.message);
    throw error;
  }
};


/* LISTAR PERMISOS POR USUARIO */
const listarUsuariosPermiso = async () => {
  try {
    const res = await api.get('UsuariosPermiso/Listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar permisos por usuario:', error.message);
    throw error;
  }
};

export default {
  insertarUsuarioPermiso,
  actualizarUsuarioPermiso,
  filtrarPorIdUsuarioPermiso,
  filtrarPorIdUsuario,
  listarUsuariosPermiso
};
