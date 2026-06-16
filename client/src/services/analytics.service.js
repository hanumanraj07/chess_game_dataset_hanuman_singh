import api from './api.js';

export const analyticsService = {
  // Correct server routes under /api/v1/analytics/*
  getVictories: () => api.get('/analytics/victory-distribution'),
  getOpenings: () => api.get('/analytics/opening-success'),
  getColorAdvantage: () => api.get('/analytics/color-advantage'),

  // Stats sub-routes (no single /stats root endpoint exists)
  getStats: () => api.get('/stats/total-matches'),
  getWhiteWinRate: () => api.get('/stats/white-win-rate'),
  getBlackWinRate: () => api.get('/stats/black-win-rate'),
  getDrawRate: () => api.get('/stats/draw-rate'),
  getTotalPlayers: () => api.get('/stats/total-players'),
  getCheckmateRate: () => api.get('/stats/checkmate-rate'),
  getResignationRate: () => api.get('/stats/resignation-rate'),
  getTopOpenings: () => api.get('/stats/top-openings'),
  getTimeControlUsage: () => api.get('/analytics/time-control-usage'),
  getPlayerGrowth: () => api.get('/analytics/player-growth'),
  getHourlyActivity: () => api.get('/analytics/hourly-activity'),
  getRatingDistribution: () => api.get('/analytics/rating-distribution'),
  getRatingTrend: () => api.get('/analytics/rating-trend'),
  getRatingGapUpsets: () => api.get('/analytics/rating-gap-upsets'),
  getTopGames: () => api.get('/analytics/top-games'),
};
