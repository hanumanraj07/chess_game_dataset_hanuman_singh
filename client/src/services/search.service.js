import api from './api.js';

export const searchService = {
  searchMatches: (q) => api.get('/search/matches', { params: { q } }),
  searchPlayers: (q) => api.get('/search/players', { params: { q } }),
  searchOpenings: (q) => api.get('/search/openings', { params: { q } }),
};
