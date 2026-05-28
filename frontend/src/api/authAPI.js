import api from './axiosInstance';

const authAPI = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (email, newPassword, resetToken) => {
    const response = await api.post('/auth/reset-password', {
      email,
      newPassword,
      resetToken,
    });
    return response.data;
  },
};

export default authAPI;
