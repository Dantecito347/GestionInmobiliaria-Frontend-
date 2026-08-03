import api from '../api/axios';

export const contratoService = {
  getAll: async () => {
    const response = await api.get('/contratos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contratos/${id}`);
    return response.data;
  },

  create: async (contratoData) => {
    const response = await api.post('/contratos', contratoData);
    return response.data;
  },

  update: async (id, contratoData) => {
    const response = await api.put(`/contratos/${id}`, contratoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contratos/${id}`);
    return response.data;
  },

};