import axios from 'axios';
import { store } from '../app/store';

const api = axios.create({
  baseURL: 'http://192.168.171.128:85/api/', 
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

