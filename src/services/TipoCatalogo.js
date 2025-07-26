import api from './api';

/* INSERTAR */
const insertarTipoCatalogo = async (datosTipoCatalogo) => {
  try {
    const res = await api.post('TipoCatalogos/insertar', datosTipoCatalogo);

    if (res.data.Numero > 0) {
      console.log('Tipo de catálogo insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar tipo de catálogo:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarTipoCatalogo = async (datosTipoCatalogo) => {
  try {
    const res = await api.put('TipoCatalogos/actualizar', datosTipoCatalogo);

    if (res.data.Numero > 0) {
      console.log('Tipo de catálogo actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar tipo de catálogo:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdTipoCatalogo = async (idTipoCatalogo) => {
  try {
    const res = await api.get('TipoCatalogos/filtrar_por_id', {
      params: { idTipoCatalogo }
    });

    return res.data; // Espera { success: true, data: objeto }
  } catch (error) {
    console.error('Error al filtrar tipo catálogo por ID:', error.message);
    throw error;
  }
};

/* FILTRAR POR NOMBRE */
const filtrarPorNombreTipoCatalogo = async (nombre) => {
  try {
    const res = await api.get('TipoCatalogos/filtrar_por_nombre', {
      params: { nombre }
    });

    return res.data; // Espera { success: true, data: [...] }
  } catch (error) {
    console.error('Error al filtrar tipo catálogo por nombre:', error.message);
    throw error;
  }
};

/* LISTAR TIPOS DE CATÁLOGO */
const listarTiposCatalogo = async () => {
  try {
    const res = await api.get('TipoCatalogos/listar');
    return res.data; // Espera { success: true, data: [...] }
  } catch (error) {
    console.error('Error al listar tipos de catálogo:', error.message);
    throw error;
  }
};

export default {
  insertarTipoCatalogo,
  actualizarTipoCatalogo,
  filtrarPorIdTipoCatalogo,
  filtrarPorNombreTipoCatalogo,
  listarTiposCatalogo
};
