import api from './api';

/* INSERTAR */
const insertarMateria = async (datosMateria) => {
  try {
    const res = await api.post('Materias/insertar', datosMateria);

    if (res.data.success) {
      console.log('Materia insertada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar materia:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarMateria = async (datosMateria) => {
  try {
    const res = await api.put('Materias/actualizar', datosMateria);

    if (res.data.success) {
      console.log('Materia actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar materia:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdMateria = async (idMateria) => {
  try {
    const res = await api.get('Materias/FILTRAR_POR_ID', {
      params: { idMateria }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por ID de materia:', error.message);
    throw error;
  }
};


const listarMaterias = async () => {
  try {
    const res = await api.get('Materias/listar'); 

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar materias:', error.message);
    throw error;
  }
};

export default {
  insertarMateria,
  actualizarMateria,
  filtrarPorIdMateria,
  listarMaterias,

};
