import api from './api';

const login = async (usuario, contrasena) => {
  const res = await api.post('Auth/login', {
    Usuario: usuario,
    contrasena: contrasena
  });

  if (res.data.success && res.data.token) {
    localStorage.setItem('accessToken', res.data.token);
  }

  return res.data;
};

const refreshToken = async () => {
  const res = await api.post('Auth/refresh');

  if (res.data.success && res.data.token) {
    localStorage.setItem('accessToken', res.data.token);
    return res.data.token;
  }

  throw new Error('No se pudo refrescar el token');
};

const logout = async () => {
  await api.post('Auth/logout');
  localStorage.removeItem('accessToken');
};

export default {
  login,
  refreshToken,
  logout
};