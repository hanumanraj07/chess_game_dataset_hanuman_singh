const analyticsService = require('../services/analytics.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/pagination');

const analyticsController = {
  getVictoryDistribution: asyncHandler(async (req, res) => {
    const data = await analyticsService.getVictoryDistribution();
    return apiResponse.success(res, 'Victory distribution fetched', { data });
  }),

  getColorAdvantage: asyncHandler(async (req, res) => {
    const data = await analyticsService.getColorAdvantage();
    return apiResponse.success(res, 'Color advantage fetched', { data });
  }),

  getTopGames: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 10);
    const data = await analyticsService.getTopGames(skip, meta.limit);
    return apiResponse.success(res, 'Top games fetched', { data }, meta);
  }),

  getTurnCountAverage: asyncHandler(async (req, res) => {
    const data = await analyticsService.getTurnCountAverage();
    return apiResponse.success(res, 'Average turn count fetched', { data });
  }),

  getRatedVsCasual: asyncHandler(async (req, res) => {
    const data = await analyticsService.getRatedVsCasual();
    return apiResponse.success(res, 'Rated vs casual fetched', { data });
  }),

  getTimeControlUsage: asyncHandler(async (req, res) => {
    const data = await analyticsService.getTimeControlUsage();
    return apiResponse.success(res, 'Time control usage fetched', { data });
  }),

  getShortestGames: asyncHandler(async (req, res) => {
    const data = await analyticsService.getShortestGames();
    return apiResponse.success(res, 'Shortest games fetched', { data });
  }),

  getLongestGames: asyncHandler(async (req, res) => {
    const data = await analyticsService.getLongestGames();
    return apiResponse.success(res, 'Longest games fetched', { data });
  }),

  getRatingGapUpsets: asyncHandler(async (req, res) => {
    const data = await analyticsService.getRatingGapUpsets();
    return apiResponse.success(res, 'Rating gap upsets fetched', { data });
  }),

  getCheckmateFrequency: asyncHandler(async (req, res) => {
    const data = await analyticsService.getCheckmateFrequency();
    return apiResponse.success(res, 'Checkmate frequency fetched', { data });
  }),

  getDrawFrequency: asyncHandler(async (req, res) => {
    const data = await analyticsService.getDrawFrequency();
    return apiResponse.success(res, 'Draw frequency fetched', { data });
  }),

  getResignationFrequency: asyncHandler(async (req, res) => {
    const data = await analyticsService.getResignationFrequency();
    return apiResponse.success(res, 'Resignation frequency fetched', { data });
  }),

  getTimeouts: asyncHandler(async (req, res) => {
    const data = await analyticsService.getTimeouts();
    return apiResponse.success(res, 'Timeout analytics fetched', { data });
  }),

  getOpeningSuccess: asyncHandler(async (req, res) => {
    const data = await analyticsService.getOpeningSuccess();
    return apiResponse.success(res, 'Opening success analytics fetched', { data });
  }),

  getPlayerGrowth: asyncHandler(async (req, res) => {
    const data = await analyticsService.getPlayerGrowth();
    return apiResponse.success(res, 'Player growth fetched', { data });
  }),

  getHourlyActivity: asyncHandler(async (req, res) => {
    const data = await analyticsService.getHourlyActivity();
    return apiResponse.success(res, 'Hourly activity fetched', { data });
  })
};

module.exports = analyticsController;
