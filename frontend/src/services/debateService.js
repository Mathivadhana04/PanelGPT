import api from './api';

export const debateService = {
  saveDebate: async (data) => {
    const response = await api.post('/debate/save', data);
    return response.data;
  },

  getPersonas: async () => {
    const response = await api.get('/personas');
    return response.data;
  },

  getSummary: async (topic, messagesList) => {
    const response = await api.post('/debate/summary', { topic, messages: messagesList });
    return response.data.summary;
  },

  stopDebate: async () => {
    const response = await api.post('/debate/stop');
    return response.data;
  },
};
