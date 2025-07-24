import api from './api';

/* INSERTAR */
const insertarInscripcion = async (datosInscripcion) => {
  try {
    const res = await api.post('Inscripcion/INSERTAR', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripcion asignada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Inscripcion:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarInscripcion = async (datosInscripcion) => {
  try {
    const res = await api.put('Inscripcion/actualizar', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripcion actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Inscripcion:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdInscripcion = async (idInscripcion) => {
  try {
    const res = await api.get('Inscripcion/FILTRAR_POR_ID', {
      params: { idInscripcion }  // corregido
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar Inscripcion por id:', error.message);
    throw error;
  }
};

/* LISTAR */
const listarInscripciones = async () => {
  try {
    const res = await api.get('Inscripcion/LISTAR');
    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar Inscripciones:', error.message);
    throw error;
  }
};

export default {
  insertarInscripcion,
  actualizarInscripcion,
  filtrarPorIdInscripcion,
  listarInscripciones, 
};
