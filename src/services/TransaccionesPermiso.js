import api from './api';

/* INSERTAR */
const insertarTransaccionPermiso = async (datos) => {
  try {
    const res = await api.post('TransaccionesPermiso/INSERTAR', datos);

    if (res.data.success) {
      console.log('Permiso de transacción insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar permiso de transacción:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarTransaccionPermiso = async (datos) => {
  try {
    const res = await api.put('TransaccionesPermiso/actualizar', datos);

    if (res.data.success) {
      console.log('Permiso de transacción actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar permiso de transacción:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdTransaccionPermiso = async (idTransaccionPermiso) => {
  try {
    const res = await api.get('TransaccionesPermiso/Filtrar_Por_ID', {
      params: { idTransaccionPermiso }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar transacción-permiso por ID:', error.message);
    throw error;
  }
};

/* LISTAR */
const listarTransaccionesPermisos = async () => {
  try {
    const res = await api.get('TransaccionesPermiso/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar transacciones-permisos:', error.message);
    throw error;
  }
};

export default {
  insertarTransaccionPermiso,
  actualizarTransaccionPermiso,
  filtrarPorIdTransaccionPermiso,
  listarTransaccionesPermisos
};
