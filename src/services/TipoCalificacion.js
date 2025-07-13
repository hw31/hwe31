import api from './api';

/* INSERTAR */
const insertarTipoCalificacion = async (datosTipoCalificacion) => {
  try {
    const res = await api.post('TipoCalificacion/insertar', datosTipoCalificacion);

    if (res.data.success) {
      console.log('Tipo de calificación insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar tipo de calificación:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarTipoCalificacion = async (datosTipoCalificacion) => {
  try {
    const res = await api.put('TipoCalificacion/actualizar', datosTipoCalificacion);

    if (res.data.success) {
      console.log('Tipo de calificación actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar tipo de calificación:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdTipoCalificacion = async (idTipoCalificacion) => {
  try {
    const res = await api.get('TipoCalificacion/filtrar_por_id', {
      params: { idTipoCalificacion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar tipo de calificación por ID:', error.message);
    throw error;
  }
};


/* LISTAR TIPOS DE CALIFICACIÓN */
const listarTiposCalificacion = async () => {
  try {
    const res = await api.get('TipoCalificacion/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar tipos de calificación:', error.message);
    throw error;
  }
};

export default {
  insertarTipoCalificacion,
  actualizarTipoCalificacion,
  filtrarPorIdTipoCalificacion,
  listarTiposCalificacion
};
