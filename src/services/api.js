import axios from 'axios';
import store from '../redux/store';
import { logout as logoutAction } from '../features/Auth/authSlice';

const api = axios.create({

  baseURL: 'http://localhost:5292/api/',/*'http://192.168.171.128:85/api/',*/
  withCredentials: false, // cambia a true solo si usas cookies httpOnly
});


api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutAction());
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;