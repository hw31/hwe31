import api from './api';

/* INSERTAR */
const insertarInscripcionMateria = async (datosInscripcion) => {
  try {
    const res = await api.post('InscripcionesMaterias/insertar', datosInscripcion);
    // Devuelve todo el objeto para saber success y mensaje
    return res.data;
  } catch (error) {
    console.error('Error al insertar InscripcionMateria:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarInscripcionMateria = async (datosInscripcion) => {
  try {
    const res = await api.put('InscripcionesMaterias/actualizar', datosInscripcion);
    return res.data;
  } catch (error) {
    console.error('Error al actualizar InscripcionMateria:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID (idInscripcionMateria) */
const filtrarPorIdInscripcionMateria = async (idInscripcionMateria) => {
  try {
    const res = await api.get('InscripcionesMaterias/filtrarPorId', {
      params: { idInscripcionMateria }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por IdInscripcionMateria:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID_INSCRIPCION (idInscripcion) */
const filtrarPorIdInscripcion = async (idInscripcion) => {
  try {
    const res = await api.get('InscripcionesMaterias/filtrarPorInscripcion', {
      params: { idInscripcion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por IdInscripcion:', error.message);
    throw error;
  }
};

/* LISTAR TODOS */
const listarInscripcionesMaterias = async () => {
  try {
    const res = await api.get('InscripcionesMaterias/listar');
    if(res.data.success) {
      return res.data.data; // array de inscripciones
    } else {
      // Opcional: lanzar error con mensaje backend
      throw new Error(res.data.mensaje || 'Error al listar inscripciones');
    }
  } catch (error) {
    console.error('Error al listar InscripcionesMaterias:', error.message);
    throw error;
  }
};

export default {
  insertarInscripcionMateria,
  actualizarInscripcionMateria,
  filtrarPorIdInscripcionMateria,
  filtrarPorIdInscripcion,
  listarInscripcionesMaterias
};
