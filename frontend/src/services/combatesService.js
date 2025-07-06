import api from './api';

const combatesService = {
  // Obtener todos los combates
  getCombates: async (params = {}) => {
    const response = await api.get('/combates/', { params });
    return response.data;
  },

  // Obtener un combate específico
  getCombate: async (id) => {
    const response = await api.get(`/combates/${id}/`);
    return response.data;
  },

  // Crear un nuevo combate
  createCombate: async (data) => {
    const response = await api.post('/combates/', data);
    return response.data;
  },

  // Actualizar un combate
  updateCombate: async (id, data) => {
    const response = await api.put(`/combates/${id}/`, data);
    return response.data;
  },

  // Eliminar un combate
  deleteCombate: async (id) => {
    const response = await api.delete(`/combates/${id}/`);
    return response.data;
  },

  // Iniciar un combate
  iniciarCombate: async (combateId) => {
    const response = await api.post(`/combates/${combateId}/iniciar_combate/`);
    return response.data;
  },

  // Finalizar un combate
  finalizarCombate: async (combateId, data) => {
    const response = await api.post(`/combates/${combateId}/finalizar_combate/`, data);
    return response.data;
  },

  // Registrar acción Tashi Waza - ACTUALIZADO para manejar respuesta con ganador
  registrarAccionTashi: async (combateId, data) => {
    const response = await api.post(`/combates/${combateId}/registrar_accion_tashi_waza/`, data);
    return response.data; // Incluye: { accion, ganador, combate_finalizado }
  },

  // Registrar acción Ne Waza - ACTUALIZADO para manejar respuesta con ganador
  registrarAccionNe: async (combateId, data) => {
    const response = await api.post(`/combates/${combateId}/registrar_accion_ne_waza/`, data);
    return response.data; // Incluye: { accion, ganador, combate_finalizado }
  },

  // Registrar amonestación - ACTUALIZADO para manejar respuesta con ganador
  registrarAmonestacion: async (combateId, data) => {
    const response = await api.post(`/combates/${combateId}/registrar_amonestacion/`, data);
    return response.data; // Incluye: { amonestacion, ganador, combate_finalizado }
  },

  // Registrar acción combinada
  registrarAccionCombinada: async (combateId, data) => {
    const response = await api.post(`/combates/${combateId}/registrar_accion_combinada/`, data);
    return response.data;
  },

  // NUEVA: Obtener estadísticas del combate en tiempo real
  getEstadisticasCombate: async (combateId) => {
    const response = await api.get(`/combates/${combateId}/estadisticas/`);
    return response.data;
  },

  // Agregar estas funciones al final del objeto combatesService, antes del cierre
  obtenerPuntuaciones: async (combateId) => {
    const response = await api.get(`/combates/${combateId}/puntuaciones/`);
    return response.data;
  },
  
  // Pausar combate
  pausarCombate: async (combateId) => {
    const response = await api.post(`/combates/${combateId}/pausar/`);
    return response.data;
  },
  
  // Reanudar combate
  reanudarCombate: async (combateId) => {
    const response = await api.post(`/combates/${combateId}/reanudar/`);
    return response.data;
  },
  
  // Iniciar Osaekomi
  iniciarOsaekomi: async (combateId, competidorId) => {
    const response = await api.post(`/combates/${combateId}/iniciar_osaekomi/`, {
      competidor: competidorId
    });
    return response.data;
  },
  
  // Detener Osaekomi
  detenerOsaekomi: async (combateId) => {
    const response = await api.post(`/combates/${combateId}/detener_osaekomi/`);
    return response.data;
  },
  
  // Verificar finalización automática
  verificarFinalizacionAutomatica: async (combateId) => {
    const response = await api.post(`/combates/${combateId}/verificar_finalizacion_automatica/`);
    return response.data;
  }
};

export default combatesService;
