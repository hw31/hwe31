import api from './api';

/* INSERTAR */
const insertarUsuarioRol = async (datos) => {
  try {
    const res = await api.post('UsuariosRoles/INSERTAR', datos);

    if (res.data.success) {
      console.log('Rol asignado al usuario correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar rol de usuario:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarUsuarioRol = async (datos) => {
  try {
    const res = await api.put('UsuariosRoles/actualizar', datos);

    if (res.data.success) {
      console.log('Rol del usuario actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar rol del usuario:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID DE RELACIÓN */
const filtrarPorIdUsuarioRol = async (idUsuarioRol) => {
  try {
    const res = await api.get('UsuariosRoles/Filtrar_Por_ID', {
      params: { idUsuarioRol }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar relación usuario-rol por ID:', error.message);
    throw error;
  }
};


/* LISTAR RELACIONES USUARIO - ROL */
const listarUsuariosRoles = async () => {
  try {
    const res = await api.get('UsuariosRoles/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar usuarios con rol:', error.message);
    throw error;
  }
};

export default {
  insertarUsuarioRol,
  actualizarUsuarioRol,
  filtrarPorIdUsuarioRol,
  listarUsuariosRoles
};
