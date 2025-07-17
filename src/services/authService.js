import api from './api';
import config from '../config';
import userMock from '../mocks/userMock';


const login = async (usuario, contrasena) => {
  if (config.MODO_MOCK) {
    // Validación mock
    if (usuario === userMock.usuario && contrasena === userMock.contrasena) {
      return {
        success: true,
        usuario,
        contrasena,
      };
    } else {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos (modo demo)',
      };
    }
  }

  // Modo real (API)
    try {
      const res = await api.post('Auth/login', {
        usuario,
        contrasena,
      });

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
     if (config.MODO_MOCK) {
    return Promise.resolve();
  }
    await api.post(
      'Auth/logout',
      { idSesion },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.warn("Error al cerrar sesión:", error.response?.data?.error || error.message);
  }
};

export default {
  login,
  logout,
};