import api from './api';

const listarPersonas = async () => {
  try {
    const res = await api.get('Personas/listar');
    if (res.data.Numero === -1) {
      return { success: false, message: res.data.Mensaje || 'Error al listar personas' };
    }
    return {
      success: true,
      data: res.data.Resultado || [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.Mensaje || 'Error inesperado al listar personas.',
    };
  }
};

const insertarPersona = async (datosPersona) => {
  try {
    const res = await api.post('Personas/insertar', datosPersona);
    if (res.data.Numero === -1) {
      return { success: false, message: res.data.Mensaje || 'Error al insertar persona' };
    }
    return { success: true, message: res.data.Mensaje || 'Persona insertada correctamente' };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.mensaje || 'Error inesperado al insertar persona.',
    };
  }
};

const actualizarPersona = async (datosPersona) => {
  try {
    const res = await api.put('Personas/actualizar', datosPersona);
    if (res.data.Numero === -1) {
      return { success: false, message: res.data.Mensaje || 'Error al actualizar persona' };
    }
    return { success: true, message: res.data.Mensaje || 'Persona actualizada correctamente' };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.mensaje || 'Error inesperado al actualizar persona.',
    };
  }
};

const filtrarPorIdPersona = async (idPersona) => {
  try {
    const res = await api.get('Personas/filtrar_por_id', {
      params: { idPersona },
    });
    if (res.data.Numero === -1) {
      return { success: false, message: res.data.Mensaje || 'Persona no encontrada' };
    }
    return {
      success: true,
      data: res.data.Resultado || [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.mensaje || 'Error inesperado al filtrar persona.',
    };
  }
};

export default {
  listarPersonas,
  insertarPersona,
  actualizarPersona,
  filtrarPorIdPersona,
};

