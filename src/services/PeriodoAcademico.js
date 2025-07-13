import api from './api';

/* INSERTAR */
const insertarPeriodoAcademico = async (datosPeriodo) => {
  try {
    const res = await api.post('PeriodoAcademico/insertar', datosPeriodo);

    if (res.data.success) {
      console.log('Periodo académico insertado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar periodo académico:', error.message);
    throw error;
  }
};

/* ACTUALIZAR */
const actualizarPeriodoAcademico = async (datosPeriodo) => {
  try {
    const res = await api.put('PeriodoAcademico/actualizar', datosPeriodo);

    if (res.data.success) {
      console.log('Periodo académico actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar periodo académico:', error.message);
    throw error;
  }
};

/* FILTRAR POR ID */
const filtrarPorIdPeriodo = async (idPeriodo) => {
  try {
    const res = await api.get('PeriodoAcademico/filtrar_por_id', {
      params: { idPeriodo }
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por ID del periodo:', error.message);
    throw error;
  }
};

/* LISTAR PERIODOS */
const listarPeriodosAcademicos = async () => {
  try {
    const res = await api.get('PeriodoAcademico/listar');
    return res.data;
  } catch (error) {
    console.error('Error al listar periodos académicos:', error.message);
    throw error;
  }
};

export default {
  insertarPeriodoAcademico,
  actualizarPeriodoAcademico,
  filtrarPorIdPeriodo,
  listarPeriodosAcademicos
};
