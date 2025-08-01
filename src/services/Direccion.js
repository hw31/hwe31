import api from './api';

// INSERTAR
const insertarDireccion = async (datosDireccion) => {
  try {
    const res = await api.post('Direccion/insertar', datosDireccion);
    return {
      success: res.data.numero >= 0,
      message: res.data.mensaje,
      numero: res.data.numero,
      ...res.data
    };
  } catch (error) {
    console.error('Error al insertar dirección:', error.message);
    throw error;
  }
};

// ACTUALIZAR
const actualizarDireccion = async (datosDireccion) => {
  try {
    const res = await api.put('Direccion/actualizar', datosDireccion);
    return {
      success: res.data.numero >= 0,
      message: res.data.mensaje,
      numero: res.data.numero,
      ...res.data
    };
  } catch (error) {
    console.error('Error al actualizar dirección:', error.message);
    throw error;
  }
};

// FILTRAR POR ID
const filtrarPorIdDireccion = async (idDireccion) => {
  try {
    const res = await api.get('Direccion/filtrar_por_id', {
      params: { idDireccion }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar dirección por ID:', error.message);
    throw error;
  }
};

// FILTRAR POR NOMBRE DE PERSONA
const filtrarPorNombrePersona = async (nombrePersona) => {
  try {
    const res = await api.get('Direccion/filtrar_por_nombre_persona', {
      params: { nombrePersona }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar dirección por nombre de persona:', error.message);
    throw error;
  }
};

// LISTAR
const listarDirecciones = async () => {
  try {
    const res = await api.get('Direccion/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar direcciones:', error.message);
    throw error;
  }
};

export default {
  insertarDireccion,
  actualizarDireccion,
  filtrarPorIdDireccion,
  filtrarPorNombrePersona,
  listarDirecciones
};
