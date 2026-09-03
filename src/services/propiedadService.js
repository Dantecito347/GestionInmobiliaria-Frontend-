import api from '../api/axios';

const crearFormData = (propiedadData, imagenArchivo) => {
  const formData = new FormData();

  formData.append(
    'propiedad',
    new Blob([JSON.stringify(propiedadData)], { type: 'application/json' })
  );

  if (imagenArchivo) {
    formData.append('imagen', imagenArchivo);
  }

  return formData;
};

export const propiedadService = {
  getAll: async () => {
    const response = await api.get('/propiedades');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/propiedades/${id}`);
    return response.data;
  },

  create: async (propiedadData, imagenArchivo) => {
    const formData = crearFormData(propiedadData, imagenArchivo);
    const response = await api.post('/propiedades', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id, propiedadData, imagenArchivo) => {
    const formData = crearFormData(propiedadData, imagenArchivo);
    const response = await api.put(`/propiedades/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/propiedades/${id}`);
    return response.data;
  },

  getSugerencias: async (termino) => {
    const response = await api.get('/propiedades/sugerencias', {
      params: { termino }
    });
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

