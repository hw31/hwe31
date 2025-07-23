import api from './api';


const login = async (usuario, contrasena) => {
 

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
