import api from './api';


const login = async (usuario, contrasena) => {
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