import api from './api';

// Insertar estudiante-carrera
const insertarEstudianteCarrera = async (datos) => {
  try {
    const res = await api.post('EstudiantesCarreras/insertar', datos);
    console.log("Respuesta insertar estudiante-carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al insertar relación estudiante-carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar estudiante-carrera:', error.message);
    throw error;
  }
};

// Actualizar estudiante-carrera
const actualizarEstudianteCarrera = async (datos) => {
  try {
    const res = await api.put('EstudiantesCarreras/actualizar', datos);
    console.log("Respuesta actualizar estudiante-carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al actualizar relación estudiante-carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar estudiante-carrera:', error.message);
    throw error;
  }
};

// Filtrar por ID
const filtrarPorId = async (id) => {
  try {
    const res = await api.get('EstudiantesCarreras/filtrar_por_id', {
      params: { id }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Relación no encontrada');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al filtrar por ID:', error.message);
    throw error;
  }
};

// Listar todos
const listarTodos = async () => {
  try {
    const res = await api.get('EstudiantesCarreras/listar');

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Error al listar relaciones');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar relaciones:', error.message);
    throw error;
  }
};

// Listar por carrera
const listarPorCarrera = async (idCarrera) => {
  try {
    const res = await api.get('EstudiantesCarreras/listar_por_carrera', {
      params: { idCarrera }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'No hay datos para esa carrera');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar por carrera:', error.message);
    throw error;
  }
};

// Listar por usuario
const listarPorUsuario = async (idUsuario) => {
  try {
    const res = await api.get('EstudiantesCarreras/listar_por_usuario', {
      params: { idUsuario }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'No hay datos para ese usuario');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar por usuario:', error.message);
    throw error;
  }
};

export default {
  insertarEstudianteCarrera,
  actualizarEstudianteCarrera,
  filtrarPorId,
  listarTodos,
  listarPorCarrera,
  listarPorUsuario
};
