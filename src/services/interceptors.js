import api from './api';
import { store } from '../redux/store'; 

// Agrega token desde Redux (persistido con redux-persist)
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

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
      console.warn('Sesión expirada o no autorizada.');
    
    }

    return Promise.reject(error);
  }
);
