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
    const { status } = error.response || {};
    
    switch (status) {
      case 401:
        // Token inválido o expirado
        console.log('Error 401: Token inválido o expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Redirigir al login solo si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        console.log('Error 403: Acceso denegado');
        toast.error('No tienes permisos para realizar esta acción.');
        break;
        
      case 404:
        console.error('Recurso no encontrado:', error.config?.url);
        toast.error('Recurso no encontrado. Verifique la URL.');
        break;
        
      case 500:
        console.error('Error interno del servidor:', error);
        toast.error('Error interno del servidor. Intente nuevamente.');
        break;
        
      default:
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        break;
    }
    
    return Promise.reject(error);
  }
);

export default api;