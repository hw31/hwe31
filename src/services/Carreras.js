import api from './api';

// Insertar carrera
const insertarCarrera = async (datosCarrera) => {
  try {
    const res = await api.post('Carreras/insertar', datosCarrera);
    console.log("Respuesta insertar carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al insertar carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar carrera:', error.message);
    throw error;
  }
};

// Actualizar carrera
const actualizarCarrera = async (datosCarrera) => {
  try {
    const res = await api.put('Carreras/actualizar', datosCarrera);
    console.log("Respuesta actualizar carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al actualizar carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar carrera:', error.message);
    throw error;
  }
};

// Listar carreras
const listarCarreras = async () => {
  try {
    const res = await api.get('Carreras/listar');

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Error al listar carreras');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar carreras:', error.message);
    throw error;
  }
};

// Filtrar carrera por ID
const filtrarCarreraPorId = async (idCarrera) => {
  try {
    const res = await api.get('Carreras/filtrar_por_id', {
      params: { id: idCarrera }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Carrera no encontrada');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al filtrar carrera por ID:', error.message);
    throw error;
  }
};

export default {
  insertarCarrera,
  actualizarCarrera,
  listarCarreras,
  filtrarCarreraPorId
};
