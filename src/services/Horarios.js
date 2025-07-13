import api from './api';

/* INSERTAR Horarios */
const insertarHorarios= async (datosHorarios) => {
  try {
    const res = await api.post('Horarios/INSERTAR', datosCatalogo);

    if (res.data.success) {
      console.log('Horario asignado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al insertar Horarios:', error.message);
    throw error;
  }
};

/* ACTUALIZAR HORARIOS */
const actualizarHoraios = async (datosHorarios) => {
  try {
    const res = await api.put('Horarios/ACTUALIZAR', datosHorarios);

    if (res.data.success) {
      console.log('Horario actualizado correctamente');
    }

    return res.data;
  } catch (error) {
    console.error('Error al actualizar Horario:', error.message);
    throw error;
  }
};

/* FILTRAR Horario POR ID */
const filtrarPorIdHorario = async (idHorario) => {
  try {
     const res = await api.get('CHorarios/FILTRAR_ID', {
      params: { idCatalogo}
    });
    return res.data;
  } catch (error) {
    console.error('Error al filtrar por id:', error.message);
    throw error;
  }
};

/*LISTAR */
const listarHorario = async () => {
  try {
    const res = await api.get('Horarios/LISTAR');
    return res.data;
  } catch (error) {
    console.error('Error al listar Horario:', error.message);
    throw error;
  }
};

export default {
  insertarHorarios,
  actualizarHoraios,
  filtrarPorIdHorario,
  listarHorario
};