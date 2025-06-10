import axios from 'axios';
import toast from 'react-hot-toast';

// Definir la URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 404) {
      console.error('Recurso no encontrado:', error.config.url);
      toast.error('Recurso no encontrado. Verifique la URL.');
    }
    return Promise.reject(error);
  }
);

export default api;