import api from '../api/axios';

export const obligacionService = {
  getByContrato: async (idContrato) => {
    const res = await api.get(`/obligaciones/contrato/${idContrato}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post('/obligaciones', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/obligaciones/${id}`, payload);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/obligaciones/${id}`);
    return res.data;
  }
};