import api from './api';

/* INSERTAR */
const insertarTipoTransaccion = async (datosTipoTransaccion) => {
  try {
    const res = await api.post('TiposTransaccion/insertar', datosTipoTransaccion);

    if (res.data.success) {
      console.log('Tipo de transacción insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar tipo de transacción:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarTipoTransaccion = async (datosTipoTransaccion) => {
  try {
    const res = await api.put('TiposTransaccion/actualizar', datosTipoTransaccion);

    if (res.data.success) {
      console.log('Tipo de transacción actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar tipo de transacción:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdTipoTransaccion = async (idTipoTransaccion) => {
  try {
    const res = await api.get('TiposTransaccion/filtrar-por-id', {
      params: { idTipoTransaccion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar tipo de transacción por ID:', error.message);
    throw error;
  }
};


/* LISTAR TIPOS DE TRANSACCIÓN */
const listarTiposTransaccion = async () => {
  try {
    const res = await api.get('TiposTransaccion/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar tipos de transacción:', error.message);
    throw error;
  }
};

export default {
  insertarTipoTransaccion,
  actualizarTipoTransaccion,
  filtrarPorIdTipoTransaccion,
  listarTiposTransaccion
};
