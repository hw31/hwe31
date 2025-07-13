import api from './api';

/* INSERTAR AULAS */
const insertarAula= async (datosAula) => {
  try {
    const res = await api.post('Aulas/insertar', datosAula);

    if (res.data.success) {
      console.log('Aula asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Aula:', error.message);
    throw error;
  }
};

/* ACTUALIZAR AULAS */
const actualizarAula = async (datosAula) => {
  try {
    // Cambia a api.put si tu backend espera PUT para actualizar
    const res = await api.put('Aulas/actualizar', datosAula);

    if (res.data.success) {
      console.log('Aula actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Aula:', error.message);
    throw error;
  }
};

/* FILTRAR AULAS POR ID */
const filtrarPorIdAula = async (idAula) => {
  try {
     const res = await api.get('Aulas/filtrar_por_id', {
      params: { idAula }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/*LISTAR */
const listarAula = async () => {
  try {
    const res = await api.get('Aulas/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar Aulas:', error.message);
    throw error;
  }
};

export default {
  insertarAula,
  actualizarAula,
  filtrarPorIdAula,
  listarAula
};
