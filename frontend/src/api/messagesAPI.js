import api from './axiosInstance';

const messagesAPI = {
  getRecent: async (limit = 50) => {
    const response = await api.get('/messages', {
      params: { limit },
    });
    return response.data;
  },

  getByRoom: async (room, limit = 50, offset = 0) => {
    const response = await api.get(`/messages/${room}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  create: async (content, room = 'general') => {
    const response = await api.post('/messages', {
      content,
      room,
    });
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messages/user/conversations');
    return response.data;
  },

  getAdminConversations: async () => {
    const response = await api.get('/messages/admin/conversations');
    return response.data;
  },
};

export default messagesAPI;
