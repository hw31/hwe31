import api from './api';

/* INSERTAR*/
const insertarEvaluacion = async (datosEvaluacion) => {
  try {
    const res = await api.post('RescateEvaluacion/insertar', datosEvaluacion);

    if (res.data.success) {
      console.log('Evaluación insertada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar evaluación:', error.message);
    throw error;
  }
};

/* ACTUALIZAR EVALUACIÓN */
const actualizarEvaluacion = async (datosEvaluacion) => {
  try {
    const res = await api.put('RescateEvaluacion/actualizar', datosEvaluacion);

    if (res.data.success) {
      console.log('Evaluación actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar evaluación:', error.message);
    throw error;
  }
};

/* RESCATAR POR ID EVALUACIÓN */
const rescatarPorIdEvaluacion = async (idEvaluacion) => {
  try {
    const res = await api.get('/RescateEvaluacion/filtrar_por_id', {
      params: { idEvaluacion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al rescatar evaluación por ID:', error.message);
    throw error;
  }
};


/* LISTAR TODAS LAS EVALUACIONES PARA RESCATE */
const listarEvaluacionesRescatables = async () => {
  try {
    const res = await api.get('RescateEvaluacion/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar evaluaciones rescatables:', error.message);
    throw error;
  }
};

export default {
  insertarEvaluacion,
  actualizarEvaluacion,
  rescatarPorIdEvaluacion,
  listarEvaluacionesRescatables
};
