import api from './api'; // tu instancia axios personalizada

export const getMenu = async () => {
  const response = await api.get('Menu/usuario'); // o la ruta correcta de tu API
  return response.data.data; // asumiendo que aquí está el arreglo de menús
};