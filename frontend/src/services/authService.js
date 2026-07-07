import api, { setToken, clearToken } from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.accessToken) setToken(response.data.accessToken);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.accessToken) setToken(response.data.accessToken);
    return response.data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    clearToken();
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    if (response.data.accessToken) setToken(response.data.accessToken);
    return response.data;
  },
};
