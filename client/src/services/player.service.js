import api from './api.js';

export const playerService = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  getTopRated: () => api.get('/players/top-rated'),
  getTopActive: () => api.get('/players/top-active'),
  compare: (p1, p2) => api.get(`/players/compare/${p1}/${p2}`),
  getByUsername: (username) => api.get(`/players/${username}`),
  getStats: (username) => api.get(`/players/${username}/stats`),
  getRatingHistory: (username) => api.get(`/players/${username}/rating-history`),
  getHistory: (username) => api.get(`/players/${username}/history`),
};
