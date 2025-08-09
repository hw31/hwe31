import api from './api';

const insertarUsuario = async (datos) => {
  try {
    const res = await api.post('Usuarios/INSERTAR', datos);
    const mensaje = res.data.Mensaje ?? res.data.mensaje ?? 'Operación exitosa';

    return {
      success: res.data.numero > 0,
      message: mensaje,
      numero: res.data.numero,
    };
  } catch (error) {
    const errData = error.response?.data;
    const mensajeError =
      errData?.Mensaje ||
      errData?.mensaje ||
      errData?.error ||
      error.message ||
      'Error inesperado al insertar usuario.';

    return {
      success: false,
      message: mensajeError,
    };
  }
};
/* ACTUALIZAR USUARIO */
const actualizarUsuario = async (datos) => {
  try {
    const res = await api.put('Usuarios/actualizar', datos);
    // Asumiendo que el backend responde algo tipo:
    // { success: true, message: 'Usuario actualizado correctamente', data: {...} }
    return {
      success: res.data.success ?? true, // default true si backend no envía success
      message: res.data.message || res.data.Mensaje || 'Usuario actualizado correctamente',
      data: res.data.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al actualizar usuario.',
    };
  }
};

/* FILTRAR USUARIO POR ID */
const filtrarPorIdUsuario = async (idTransaccionUsuario) => {
  try {
    const res = await api.get('Usuarios/Filtrar_Por_ID', {
      params: { idTransaccionUsuario },
    });
    return {
      success: res.data.success ?? true,
      message: res.data.message || '',
      data: res.data.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al filtrar usuario por ID.',
    };
  }
};

const filtrarUsuario = async (usuario) => {
  if (!usuario || !usuario.trim()) {
    return { success: false, message: "El parámetro usuario es obligatorio." };
  }

  try {
    const res = await api.get('Usuarios/Filtrar_Por_Usuario', {
      params: { usuario: usuario.trim() },
    });
    return {
      success: res.data.success ?? true,
      message: res.data.message || '',
      data: res.data.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al filtrar usuario por nombre.',
    };
  }
};

/* LISTAR USUARIOS */
const listarUsuario = async () => {
  try {
    const res = await api.get('Usuarios/Listar');
    return {
      success: true,
      data: res.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al listar usuarios.',
    };
  }
};

/* ACTUALIZAR CONTRASEÑA USUARIO LOGUEADO */

const actualizarContrasenaUsuario = async ({ nuevaContrasena }) => {
  try {
    const response = await api.put("/Usuarios/ActualizarContrasena", {
      nuevaContrasena,
    });
    return response.data; 
  } catch (error) {
   
    throw error.response?.data || error;
  }
};


export default {
  insertarUsuario,
  actualizarUsuario,
  filtrarPorIdUsuario,
  filtrarUsuario,
  listarUsuario,
  actualizarContrasenaUsuario
};
