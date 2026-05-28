import api from './axiosInstance';

const productsAPI = {
  getAll: async (page = 1, limit = 12) => {
    const response = await api.get('/products', {
      params: { page, limit },
    });
    return response.data;
  },

  search: async (query, category) => {
    const response = await api.get('/products/search', {
      params: {
        q: query,
        category,
      },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories/list');
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productsAPI;
