import api from './api';

const login = async (usuario, contrasena) => {
  try {
    const res = await api.post('Auth/login', {
      Usuario: usuario,
      contrasena: contrasena
    });

    if (res.data.success && res.data.token) {
      localStorage.setItem('accessToken', res.data.token);
    }

    return res.data;
  } catch (error) {
    // Manejo de errores explícito
    if (error.response && error.response.data && error.response.data.message) {
      return { success: false, message: error.response.data.message };
    }

    return { success: false, message: "Error inesperado al iniciar sesión." };
  }
};

const refreshToken = async () => {
  try {
    const res = await api.post('Auth/refresh');

    if (res.data.success && res.data.token) {
      localStorage.setItem('accessToken', res.data.token);
      return res.data.token;
    }

    throw new Error('No se pudo refrescar el token');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error inesperado al refrescar el token'
    );
  }
};

const logout = async () => {
  try {
    await api.post('Auth/logout');
  } catch (error) {
    console.warn("Error al cerrar sesión:", error.response?.data?.message || error.message);
  } finally {
    localStorage.removeItem('accessToken');
  }
};

export default {
  login,
  refreshToken,
  logout
};