const openingService = require('../services/opening.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/pagination');

const openingController = {
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const openings = await openingService.getAllOpenings(filters, skip, meta.limit);
    meta.total = await openingService.countOpenings(filters);
    return apiResponse.success(res, 'Openings fetched', { openings }, meta);
  }),

  getPopular: asyncHandler(async (req, res) => {
    const openings = await openingService.getPopularOpenings(req.query);
    return apiResponse.success(res, 'Popular openings fetched', { openings });
  }),

  getTrending: asyncHandler(async (req, res) => {
    const openings = await openingService.getTrendingOpenings(req.query);
    return apiResponse.success(res, 'Trending openings fetched', { openings });
  }),

  getWinRates: asyncHandler(async (req, res) => {
    const openings = await openingService.getOpeningWinRates(req.query);
    return apiResponse.success(res, 'Opening win rates fetched', { openings });
  }),

  search: asyncHandler(async (req, res) => {
    const { q } = req.query;
    const openings = await openingService.searchOpenings(q, req.query);
    return apiResponse.success(res, 'Openings search results', { openings });
  }),

  getAggressive: asyncHandler(async (req, res) => {
    const openings = await openingService.getByStyle('aggressive', req.query);
    return apiResponse.success(res, 'Aggressive openings fetched', { openings });
  }),

  getDefensive: asyncHandler(async (req, res) => {
    const openings = await openingService.getByStyle('defensive', req.query);
    return apiResponse.success(res, 'Defensive openings fetched', { openings });
  }),

  getGambits: asyncHandler(async (req, res) => {
    const openings = await openingService.getByStyle('gambit', req.query);
    return apiResponse.success(res, 'Gambit openings fetched', { openings });
  }),

  getCheckmates: asyncHandler(async (req, res) => {
    const openings = await openingService.getCheckmateOpenings(req.query);
    return apiResponse.success(res, 'Fastest checkmate openings fetched', { openings });
  }),

  getRare: asyncHandler(async (req, res) => {
    const openings = await openingService.getRareOpenings(req.query);
    return apiResponse.success(res, 'Rare openings fetched', { openings });
  }),

  getWhiteAdvantage: asyncHandler(async (req, res) => {
    const openings = await openingService.getByAdvantage('white', req.query);
    return apiResponse.success(res, 'White advantage openings fetched', { openings });
  }),

  getBlackAdvantage: asyncHandler(async (req, res) => {
    const openings = await openingService.getByAdvantage('black', req.query);
    return apiResponse.success(res, 'Black advantage openings fetched', { openings });
  }),

  getBeginnerFriendly: asyncHandler(async (req, res) => {
    const openings = await openingService.getByComplexity('beginner', req.query);
    return apiResponse.success(res, 'Beginner friendly openings fetched', { openings });
  }),

  getByComplexity: asyncHandler(async (req, res) => {
    const { level } = req.query;
    const openings = await openingService.getByComplexity(level, req.query);
    return apiResponse.success(res, 'Openings by complexity fetched', { openings });
  }),

  getByEco: asyncHandler(async (req, res) => {
    const opening = await openingService.getOpeningByEco(req.params.ecoCode);
    return apiResponse.success(res, 'Opening fetched', { opening });
  })
};

module.exports = openingController;
