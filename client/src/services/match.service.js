import api from './api.js';

export const matchService = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  uploadPGN: (formData) => api.post('/matches/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000 // Allow up to 120 seconds for large PGN bulk inserts
  }),
  update: (id, data) => api.put(`/matches/${id}`, data),
  remove: (id) => api.delete(`/matches/${id}`),
};
