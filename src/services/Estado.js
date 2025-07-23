import api from './api';

/* INSERTAR Estados */
const insertarEstado= async (datosEstado) => {
  try {
    const res = await api.post('Estados/agregar', datosEstado);

    if (res.data.success) {
      console.log('Estado asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Estado:', error.message);
    throw error;
  }
};


/* ACTUALIZAR Catalogo */
const actualizarEstado = async (datosEstado) => {
  try {
    const res = await api.put('/Estados/actualizar', datosEstado);

    if (res.data.success) {
      console.log('Estadoo actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Estado:', error.message);
    throw error;
  }
};

/* FILTRAR AULAS POR ID */
const filtrarPorIdEstado = async (idEstado) => {
  try {
     const res = await api.get('Estados/filtrar-id', {
      params: { idEstado}
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};


/**FILTRAR POR NOMBRE */
const filtrarPorNombreEstados = async (nombre) => {
  try {
    const res = await api.get('Estados/filtrar-nombree', {
      params: { nombre }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por nombre:', error.message);
    throw error;
  }
};


const listarEstados = async () => {
  try {
    const res = await api.get('/Estados/listar');

    console.log(" EstadoService respuesta completa:", res.data);

    return {
      success: true,
      data: res.data.datos,  
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Error inesperado al listar estados.',
    };
  }
};

export default {
  insertarEstado,
  actualizarEstado,
  filtrarPorIdEstado,
  filtrarPorNombreEstados,
  listarEstados
};
