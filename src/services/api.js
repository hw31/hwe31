
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.171.128:85/api/', // O  dominio DNS
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

export default api;