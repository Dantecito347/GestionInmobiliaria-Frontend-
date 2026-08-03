import api from '../api/axios';

export const pagoService = {
  getAll: async () => {
    const response = await api.get('/pagos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData);
    return response.data;
  },

  update: async (id, pagoData) => {
    const response = await api.put(`/pagos/${id}`, pagoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  }
};