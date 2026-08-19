import api from '../api/axios';

export const personaService = {
  getAll: async () => {
    const response = await api.get('/personas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/personas/${id}`);
    return response.data;
  },

  create: async (personaData) => {
    const response = await api.post('/personas', personaData);
    return response.data;
  },

  update: async (id, personaData) => {
    const response = await api.put(`/personas/${id}`, personaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },

  getSugerencias: async (termino) => {
    const response = await api.get('/personas/sugerencias', {
      params: { termino }
    });
    return response.data;
  }
};