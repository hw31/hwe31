import api from './api';

/* INSERTAR */
const insertarInscripcion= async (datosInscripcion) => {
  try {
    const res = await api.post('Inscripcion/INSERTAR', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripcion asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Inscripcion:', error.message);
    throw error;
  }
};

/* ACTUALIZAR*/
const actualizarInscripcion = async (datosInscripcion) => {
  try {
    const res = await api.put('Inscripcion/actualizar', datosInscripcion);

    if (res.data.success) {
      console.log('Inscripcion actualizado correctamente');
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
     const res = await api.get('FILTRAR_POR_ID_INSCRIPCION', {
      params: { idCatalogo}
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

const listarInscripcion = async () => {
  try {
    const res = await api.get('Inscripcion/LISTAR');
    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar Inscripcion:', error.message);
    throw error;
  }
};


export default {
  insertarInscripcion,
  actualizarInscripcion,
  filtrarPorIdInscripcion,
  listarInscripcion
};