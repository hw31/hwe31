import api from './api';

/* INSERTAR CONTACTOS */
const insertarContacto= async (datosContacto) => {
  try {
    const res = await api.post('Contacto/insertar', datosContacto);

    if (res.data.success) {
      console.log('Contacto asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Contacto:', error.message);
    throw error;
  }
};

/* ACTUALIZAR AULAS */
const actualizarContacto = async (datosContacto) => {
  try {
    // Cambia a api.put si tu backend espera PUT para actualizar
    const res = await api.put('Contacto/actualizar', datosContacto);

    if (res.data.success) {
      console.log('Contacto actualizado correctamente');
    }

    return res.data;
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

