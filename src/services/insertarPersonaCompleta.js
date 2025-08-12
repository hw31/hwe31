import api from './api'; // instancia axios con baseUrl configurada

const insertarPersonaCompleta = async (personaCompletaData) => {
  try {
    const response = await api.post('/PersonaCompleta/insertar', personaCompletaData);
    return response.data; // { Numero, Mensaje, IdPersona }
  } catch (error) {
    if (error.response) {
      // Error desde backend con status y mensaje
      throw new Error(error.response.data?.Mensaje || 'Error en el servidor');
    } else {
      // Error de red u otro
      throw new Error(error.message);
    }
  }
};

export default {
  insertarPersonaCompleta,
};