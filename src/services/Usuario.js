import api from './api';

/* INSERTAR */
const insertarUsuario = async (datos) => {
  try {
    const res = await api.post('Usuarios/INSERTAR', datos);

    if (res.data.success) {
      console.log('Uusario asignada al usuario correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar usuario:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarUsuario = async (datos) => {
  try {
    const res = await api.put('Usuarios/actualizar', datos);

    if (res.data.success) {
      console.log('Usuario actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdUsuario = async (idTransaccionUsuario) => {
  try {
    const res = await api.get('Usuarios/Filtrar_Por_ID', {
      params: { idTransaccionUsuario }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por ID de usuario:', error.message);
    throw error;
  }
};

const filtrarUsuario = async (nombreUsuario) => {
  try {
    const res = await api.get('Usuarios/Filtrar_Por_Usuario', {
      params: { nombreUsuario }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar  usuario:', error.message);
    throw error;
  }
};


/* LISTAR TODAS LAS TRANSACCIONES POR USUARIO */
const listarUsuario = async () => {
  try {
    const res = await api.get('Usuarios/Listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar usuario:', error.message);
    throw error;
  }
};

export default {
  insertarUsuario,
  actualizarUsuario,
  filtrarPorIdUsuario,
  filtrarUsuario,
  listarUsuario
};
