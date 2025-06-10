import api from './api';

export const estadisticasService = {
  async getEstadisticasGenerales() {
    try {
      const response = await api.get('/estadisticas/generales/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  async getEstadisticasCompetidor(competidorId) {
    try {
      const response = await api.get(`/estadisticas/competidor/${competidorId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching competitor statistics:', error);
      throw error;
    }
  },

  async getEstadisticasCompeticion(competicionId) {
    try {
      const response = await api.get(`/estadisticas/competicion/${competicionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching competition statistics:', error);
      throw error;
    }
  }
};
export default estadisticasService;