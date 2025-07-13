import api from './api';

/* INSERTAR */
const insertarRol = async (datosRol) => {
  try {
    const res = await api.post('Roles/insertar', datosRol);

    if (res.data.success) {
      console.log('Rol insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar rol:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarRol = async (datosRol) => {
  try {
    const res = await api.put('Roles/actualizar', datosRol);

    if (res.data.success) {
      console.log('Rol actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar rol:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdRol = async (idRol) => {
  try {
    const res = await api.get('Roles/FILTRAR POR ID', {
      params: { idRol }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar rol por ID:', error.message);
    throw error;
  }
};

/* FILTRAR POR NOMBRE */
const filtrarPorNombreRol = async (nombre) => {
  try {
    const res = await api.get('Roles/filtrar_por_nombre', {
      params: { nombre }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar rol por nombre:', error.message);
    throw error;
  }
};

/* LISTAR ROLES */
const listarRoles = async () => {
  try {
    const res = await api.get('Roles/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar roles:', error.message);
    throw error;
  }
};

export default {
  insertarRol,
  actualizarRol,
  filtrarPorIdRol,
  filtrarPorNombreRol,
  listarRoles
};
