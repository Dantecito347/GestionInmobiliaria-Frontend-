import api from '../api/axios';

export const propiedadService = {
  getAll: async () => {
    const response = await api.get('/propiedades');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/propiedades/${id}`);
    return response.data;
  },

  create: async (propiedadData) => {
    const response = await api.post('/propiedades', propiedadData);
    return response.data;
  },

  update: async (id, propiedadData) => {
    const response = await api.put(`/propiedades/${id}`, propiedadData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/propiedades/${id}`);
    return response.data;
  }
};

export const tipoInmuebleService = {
  getAll: async () => {
    const response = await api.get('/tipos-inmueble');
    return response.data;
  }
};

export const zonaService = {
  getAll: async () => {
    const response = await api.get('/zonas');
    return response.data;
  }
};