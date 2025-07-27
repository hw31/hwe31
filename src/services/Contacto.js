import api from './api';

const insertarContacto = async (datosContacto) => {
  try {
    const res = await api.post('Contacto/insertar', datosContacto);
    return {
      success: res.data.numero >= 0,
      message: res.data.mensaje,
      numero: res.data.numero,
      ...res.data
    };
  } catch (error) {
    console.error('Error al insertar Contacto:', error.message);
    throw error;
  }
};

const actualizarContacto = async (datosContacto) => {
  try {
    const res = await api.put('Contacto/actualizar', datosContacto);
    return {
      success: res.data.numero >= 0,
      message: res.data.mensaje,
      numero: res.data.numero,
      ...res.data
    };
  } catch (error) {
    console.error('Error al actualizar Contacto:', error.message);
    throw error;
  }
};



/* FILTRAR AULAS POR ID */
const filtrarPorIdContacto = async (idContacto) => {
  try {
     const res = await api.get('Contacto/filtrar_por_id', {
      params: { idContacto }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/**FILTRAR POR NOMBRE */
const filtrarPorNombreContacto = async (nombre) => {
  try {
    const res = await api.get('Contacto/filtrar_por_nombre', {
      params: { nombre }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por nombre:', error.message);
    throw error;
  }
};

/*LISTAR */
const listarContacto = async () => {
  try {
    const res = await api.get('Contacto/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar Catalogo:', error.message);
    throw error;
  }
};

export default {
  insertarContacto,
  actualizarContacto,
  filtrarPorIdContacto,
  filtrarPorNombreContacto,
  listarContacto
};

