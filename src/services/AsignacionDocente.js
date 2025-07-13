import api from './api';

/* INSERTAR DOCENTE */
const insertarDocente = async (datosDocente) => {
  try {
    const res = await api.post('AsignacionDocente/insertar', datosDocente);

    if (res.data.success) {
      console.log('Docente asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar docente:', error.message);
    throw error;
  }
};

/* ACTUALIZAR DOCENTE */
const actualizarDocente = async (datosDocente) => {
  try {
    // Cambia a api.put si tu backend espera PUT para actualizar
    const res = await api.put('AsignacionDocente/actualizar', datosDocente);

    if (res.data.success) {
      console.log('Docente actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar docente:', error.message);
    throw error;
  }
};

/* FILTRAR DOCENTE POR ID */
const filtrarPorIdDocente = async (idAsignacion) => {
  try {
    const res = await api.get('AsignacionDocente/filtrar_por_id', {
      params: { idAsignacion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};


/*LISTAR */
const listarAsignaciones = async () => {
  try {
    const res = await api.get('AsignacionDocente/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar asignaciones:', error.message);
    throw error;
  }
};


export default {
  insertarDocente,
  actualizarDocente,
  filtrarPorIdDocente,
  listarAsignaciones
};
