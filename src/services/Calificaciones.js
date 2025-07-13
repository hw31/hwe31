import api from './api';

/* INSERTAR Calificaciones */
const insertarCalificaciones = async (datosCalificaciones) => {
  try {
    const res = await api.post('Calificaciones/insertar', datosCalificaciones);

    if (res.data.success) {
      console.log('Calificaciones asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Calificaciones:', error.message);
    throw error;
  }
};

/* ACTUALIZAR Calificaciones */
const actualizarCalificaciones = async (datosCalificaciones) => {
  try {
    // Cambia a api.put si tu backend espera PUT para actualizar
    const res = await api.put('Calificaciones/actualizar', datosCalificaciones);

    if (res.data.success) {
      console.log('Calificaciones actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Calificaciones:', error.message);
    throw error;
  }
};
/* FILTRAR CALIFICACIONES POR ID */
const filtrarPorIdCalificaciones = async (idCalificaciones) => {
  try {
     const res = await api.get('Calificaciones/filtrar_por_id', {
      params: { idCalificaciones }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/*LISTAR */
const listarCalificacion = async () => {
  try {
    const res = await api.get('Calificaciones/listar_todas');
    return res.data;
  } catch (error) {
    console.error('Error al listar Calificacion:', error.message);
    throw error;
  }
};

export default {
  insertarCalificaciones,
  actualizarCalificaciones,
  filtrarPorIdCalificaciones,
  listarCalificacion
};