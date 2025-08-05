import api from './api';

/* INSERTAR */
const insertarInscripcionMateria = async (datosInscripcion) => {
  try {
    const res = await api.post('InscripcionesMaterias/insertar', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripción registrada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar inscripción:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarInscripcionMateria = async (datosInscripcion) => {
  try {
    const res = await api.put('InscripcionesMaterias/actualizar', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripción actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar inscripción:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID InscripcionesMateria*/
const filtrarPorIdInscripcion = async (idInscripcion) => {
  try {
    const res = await api.get('InscripcionesMaterias/filtrarPorId', {
      params: { idInscripcion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar inscripción por ID:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID Inscripcion */
const filtrarPorIdEstudiante = async (idEstudiante) => {
  try {
    const res = await api.get('InscripcionesMaterias/filtrarPorInscripcion', {
      params: { idEstudiante }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por estudiante:', error.message);
    throw error;
  }
};




/* LISTAR INSCRIPCIONES */
const listarInscripcionesMaterias = async () => {
  try {
    const res = await api.get('InscripcionesMaterias/listar');
    return res.data.data; // <-- ✅ Esta es la clave
  } catch (error) {
    console.error('Error al listar inscripciones:', error.message);
    throw error;
  }
};



export default {
  insertarInscripcionMateria,
  actualizarInscripcionMateria,
  filtrarPorIdInscripcion,
  filtrarPorIdEstudiante,
  listarInscripcionesMaterias
};
