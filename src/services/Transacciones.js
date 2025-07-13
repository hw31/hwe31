import api from './api';

/* FILTRAR POR ID */
const filtrarPorIdTransaccion = async (idTransaccion) => {
  try {
    const res = await api.get('ransacciones/Filtrar_Por_ID', {
      params: { idTransaccion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar transacción por ID:', error.message);
    throw error;
  }
};


/* LISTAR TRANSACCIONES */
const listarTransacciones = async () => {
  try {
    const res = await api.get('Transacciones/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar transacciones:', error.message);
    throw error;
  }
};

export default {
  filtrarPorIdTransaccion,
  listarTransacciones
};
