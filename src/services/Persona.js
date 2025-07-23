import api from './api';  // misma instancia axios o configuración

const listarPersonas = async () => {
  try {
    const res = await api.get('Personas/Listar'); // Ajusta la ruta real en tu backend
    return {
      success: true,
      data: res.data.resultado,  
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al listar personas.',
    };
  }
};

export default {
  listarPersonas,
};

