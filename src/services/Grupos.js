import api from './api';

/* INSERTAR GRUPOS */
const insertarGrupos= async (datosGrupos) => {
  try {
    const res = await api.post('Grupos/INSERTAR', datosGrupos);

    if (res.data.success) {
      console.log('Grupo asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Grupo:', error.message);
    throw error;
  }
};

/* ACTUALIZAR Grupo */
const actualizarGrupo = async (datosGrupos) => {
  try {
    const res = await api.put('Grupos/ACTUALIZAR', datosGrupos);

    if (res.data.success) {
      console.log('Grupo actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Grupo:', error.message);
    throw error;
  }
};

/* FILTRAR GRUPO POR ID */
const filtrarPorIdGrupo = async (idGrupo) => {
  try {
     const res = await api.get('Grupos/FILTRAR_ID', {
      params: { idCatalogo}
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/**FILTRAR POR NOMBRE */
const filtrarPorNombreGrupo = async (nombre) => {
  try {
    const res = await api.get('Grupos/FILTRAR_NOMBRE', {
      params: { nombre }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por nombre:', error.message);
    throw error;
  }
};

/*LISTAR */
const listarGrupos = async () => {
  try {
    const res = await api.get('Grupos/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar grupo:', error.message);
    throw error;
  }
};

export default {
  insertarGrupos,
  actualizarGrupo,
  filtrarPorIdGrupo,
  filtrarPorNombreGrupo,
  listarGrupos
};
