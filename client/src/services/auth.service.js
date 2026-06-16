import api from './api.js';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};
