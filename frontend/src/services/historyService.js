import api from './api';

export const historyService = {
  getHistory: async (page = 0, size = 10) => {
    const response = await api.get(`/history?page=${page}&size=${size}`);
    return response.data;
  },

  getDebate: async (id) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },

  deleteDebate: async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },
};
