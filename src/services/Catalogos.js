import api from './api';

/* INSERTAR */
const insertarCatalogo= async (datosCatalogo) => {
  try {
    const res = await api.post('Catalogo/Insertar', datosCatalogo);

    if (res.data.success) {
      console.log('Catalogo asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Catalogo:', error.message);
    throw error;
  }
};

/* ACTUALIZAR*/
const actualizarCatalogo = async (datosCatalogo) => {
  try {
    const res = await api.put('Catalogo/Actualizar', datosCatalogo);

    if (res.data.success) {
      console.log('Catalogo actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Catalogo:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdCatalogo = async (idCatalogo) => {
  try {
     const res = await api.get('Catalogo/FiltrarPorId', {
      params: { idCatalogo}
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/**FILTRAR POR NOMBRE */
const filtrarPorNombreCatalogo = async (nombre) => {
  try {
    const res = await api.get('Catalogo/FiltrarPorNombre', {
      params: { nombre }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por nombre:', error.message);
    throw error;
  }
};

const filtrarPorTipoCatalogo = async (idTipoCatalogo) => {
  try {
    const res = await api.get('Catalogo/FiltrarPorTipo', {
      params: { idTipoCatalogo }  // Aquí cambiar tipo por idTipoCatalogo
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por tipo:', error.message);
    throw error;
  }
};
/*LISTAR */
const listarCatalogo = async () => {
  try {
    const res = await api.get('Catalogo/Listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar Catalogo:', error.message);
    throw error;
  }
};

export default {
  insertarCatalogo,
  actualizarCatalogo,
  filtrarPorIdCatalogo,
  filtrarPorNombreCatalogo,
  filtrarPorTipoCatalogo,
  listarCatalogo
};
