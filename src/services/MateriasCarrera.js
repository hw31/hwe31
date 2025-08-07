import api from './api';

// Insertar materia-carrera
const insertarMateriaCarrera = async (datos) => {
  try {
    const res = await api.post('MateriasCarreras/insertar', datos);
    console.log("Respuesta insertar materia-carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al insertar relación materia-carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar materia-carrera:', error.message);
    throw error;
  }
};

// Actualizar materia-carrera
const actualizarMateriaCarrera = async (datos) => {
  try {
    const res = await api.put('MateriasCarreras/actualizar', datos);
    console.log("Respuesta actualizar materia-carrera:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al actualizar relación materia-carrera');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar materia-carrera:', error.message);
    throw error;
  }
};

// Filtrar por ID
const filtrarPorId = async (id) => {
  try {
    const res = await api.get('MateriasCarreras/filtrar_por_id', {
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
    const res = await api.get('MateriasCarreras/listar');

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
    const res = await api.get('MateriasCarreras/listar_por_carrera', {
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

// Listar por materia
const listarPorMateria = async (idMateria) => {
  try {
    const res = await api.get('MateriasCarreras/listar_por_materia', {
      params: { idMateria }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'No hay datos para esa materia');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar por materia:', error.message);
    throw error;
  }
};

export default {
  insertarMateriaCarrera,
  actualizarMateriaCarrera,
  filtrarPorId,
  listarTodos,
  listarPorCarrera,
  listarPorMateria
};
