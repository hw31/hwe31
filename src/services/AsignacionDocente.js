import api from './api'; 
const insertarDocente = async (datosDocente) => {
  try {
    const res = await api.post('AsignacionDocente/insertar', datosDocente);
    console.log("Respuesta insertar:", res.data);

    // Validación robusta:
    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al insertar asignación');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar docente:', error.message);
    throw error;
  }
};

const actualizarDocente = async (datosDocente) => {
  try {
    const res = await api.put('AsignacionDocente/actualizar', datosDocente);
    console.log("Respuesta actualizar:", res.data);

    const mensaje = res.data?.mensaje?.toLowerCase() || "";
    const esError = mensaje.includes("error") || mensaje.includes("falló") || mensaje.includes("no");

    if (esError) {
      throw new Error(res.data?.mensaje || 'Error al actualizar asignación');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar docente:', error.message);
    throw error;
  }
};

const filtrarPorIdDocente = async (idAsignacion) => {
  try {
    const res = await api.get('AsignacionDocente/filtrar_por_id', {
      params: { IdAsignacion: idAsignacion }
    });
    if (!res.data.success) {
      throw new Error(res.data.mensaje || 'Error al filtrar por ID');
    }
    return res.data.data;
  } catch (error) {
    console.error('Error al filtrar por ID:', error.message);
    throw error;
  }
};

const listarAsignaciones = async () => {
  try {
    const res = await api.get('AsignacionDocente/listar');
    if (!res.data.success) {
      throw new Error(res.data.mensaje || 'Error al listar asignaciones');
    }
    return res.data.data;
  } catch (error) {
    console.error('Error al listar asignaciones:', error.message);
    throw error;
  }
};

export default {
  insertarDocente,
  actualizarDocente,
  filtrarPorIdDocente,
  listarAsignaciones
};
