import api from './api';

// Insertar título académico
const insertarTitulo = async (datosTitulo) => {
  try {
    const res = await api.post('TitulosAcademicos/insertar', datosTitulo);
    console.log("Respuesta insertar título:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al insertar título académico');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar título académico:', error.message);
    throw error;
  }
};

// Actualizar título académico
const actualizarTitulo = async (datosTitulo) => {
  try {
    const res = await api.put('TitulosAcademicos/actualizar', datosTitulo);
    console.log("Respuesta actualizar título:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al actualizar título académico');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar título académico:', error.message);
    throw error;
  }
};

// Filtrar título académico por ID
const filtrarPorIdTitulo = async (idTitulo) => {
  try {
    const res = await api.get('TitulosAcademicos/filtrar_por_id', {
      params: { id: idTitulo }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Título académico no encontrado');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al filtrar título por ID:', error.message);
    throw error;
  }
};

// Filtrar títulos académicos por persona
const filtrarTitulosPorPersona = async (idPersona) => {
  try {
    const res = await api.get('TitulosAcademicos/filtrar_por_persona', {
      params: { idPersona }
    });

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'No se encontraron títulos para esta persona');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al filtrar títulos por persona:', error.message);
    throw error;
  }
};

// Listar todos los títulos académicos
const listarTitulos = async () => {
  try {
    const res = await api.get('TitulosAcademicos/listar');

    if (!res.data || res.data.numero === -1) {
      throw new Error(res.data?.mensaje || 'Error al listar títulos académicos');
    }

    return res.data.resultado;
  } catch (error) {
    console.error('Error al listar títulos académicos:', error.message);
    throw error;
  }
};

export default {
  insertarTitulo,
  actualizarTitulo,
  filtrarPorIdTitulo,
  filtrarTitulosPorPersona,
  listarTitulos
};
