import api from './api';
import config from '../config';
import userMock from '../mocks/userMock';

const login = async (usuario, contrasena) => {
  if (config.MODO_MOCK) {
    if (usuario === userMock.usuario && contrasena === userMock.contrasena) {
      return {
        success: true,
        usuario,
        contrasena,
        modoOscuro: true, // ← booleano
      };
    } else {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos (modo demo)',
      };
    }
  }

  try {
    const res = await api.post('Auth/login', { usuario, contrasena });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Error inesperado al iniciar sesión.",
    };
  }
};

const logout = async (idSesion) => {
  try {
    const response = await api.post("Auth/logout", { idSesion });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Error inesperado al cerrar sesión.",
    };
  }
};

const actualizarModoOscuro = async (modoOscuro) => {
  if (config.MODO_MOCK) {
    return { success: true };
  }

  try {
    const res = await api.put('Usuarios/modo-oscuro', {
      modoOscuro, // Esto se convierte en { "modoOscuro": true }
    });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al actualizar modo oscuro",
    };
  }
};

const obtenerModoOscuro = async () => {
  if (config.MODO_MOCK) {
    return config.MODO_OSCURO_MOCK;
  }
  try {
    const res = await api.get('Usuarios/modo-oscuro');
    return res.data.modoOscuro;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al obtener modo oscuro",
    };
  }
};

export default {
  login,
  logout,
  actualizarModoOscuro,
  obtenerModoOscuro,
};
