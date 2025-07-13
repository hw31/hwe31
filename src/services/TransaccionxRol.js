import api from './api';

/* INSERTAR */
const insertarTransaccionPorRol = async (datos) => {
  try {
    const res = await api.post('TransaccionRol/INSERTAR', datos);

    if (res.data.success) {
      console.log('Transacción asignada al rol correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar transacción por rol:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarTransaccionPorRol = async (datos) => {
  try {
    const res = await api.put('TransaccionRol/actualizar', datos);

    if (res.data.success) {
      console.log('Transacción por rol actualizada correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar transacción por rol:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdTransaccionRol = async (idTransaccionRol) => {
  try {
    const res = await api.get('/TransaccionRol/Filtrar_Por_ID', {
      params: { idTransaccionRol }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por ID de transacción-rol:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID_ROL */
const filtrarPorRol = async (idRol) => {
  try {
    const res = await api.get('TransaccionRol/Filtrar_Por_Rol_Id', {
      params: { idRol }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar transacciones por rol:', error.message);
    throw error;
  }
};


/* LISTAR TODAS LAS TRANSACCIONES POR ROL */
const listarTransaccionesPorRol = async () => {
  try {
    const res = await api.get('TransaccionRol/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar transacciones por rol:', error.message);
    throw error;
  }
};

export default {
  insertarTransaccionPorRol,
  actualizarTransaccionPorRol,
  filtrarPorIdTransaccionRol,
  filtrarPorRol,
  listarTransaccionesPorRol
};
