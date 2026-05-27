const searchService = require('../services/search.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/pagination');

const searchController = {
  searchMatches: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchMatches(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Match search results', { matches }, meta);
  }),

  searchPlayers: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const players = await searchService.searchPlayers(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Player search results', { players }, meta);
  }),

  searchOpenings: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const openings = await searchService.searchOpenings(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Opening search results', { openings }, meta);
  }),

  searchEco: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const openings = await searchService.searchEco(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'ECO search results', { openings }, meta);
  }),

  searchMoves: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchMoves(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Move search results', { matches }, meta);
  }),

  searchFuzzy: asyncHandler(async (req, res) => {
    const { q } = req.query;
    const results = await searchService.searchFuzzy(q);
    return apiResponse.success(res, 'Fuzzy search results', results);
  }),

  searchAutocomplete: asyncHandler(async (req, res) => {
    const { q } = req.query;
    const suggestions = await searchService.searchAutocomplete(q);
    return apiResponse.success(res, 'Autocomplete suggestions', { suggestions });
  }),

  getRecent: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 10);
    const searches = await searchService.getRecentSearches(req.query, skip, meta.limit);
    return apiResponse.success(res, 'Recent searches fetched', { searches }, meta);
  }),

  getPopular: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 10);
    const searches = await searchService.getPopularSearches(req.query, skip, meta.limit);
    return apiResponse.success(res, 'Popular searches fetched', { searches }, meta);
  }),

  searchAdvanced: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const results = await searchService.searchAdvanced(req.query, skip, meta.limit);
    return apiResponse.success(res, 'Advanced search results', results, meta);
  }),

  searchByPlayerRating: asyncHandler(async (req, res) => {
    const { rating, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchByPlayerRating(rating, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Player rating search results', { matches }, meta);
  }),

  searchByDateRange: asyncHandler(async (req, res) => {
    const { from, to, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchByDateRange(from, to, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Date range search results', { matches }, meta);
  }),

  searchByOpeningFamily: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const openings = await searchService.searchByOpeningFamily(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Opening family search results', { openings }, meta);
  }),

  searchCheckmatePatterns: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchCheckmatePatterns(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Checkmate pattern search results', { matches }, meta);
  }),

  searchEndgames: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit || 20);
    const matches = await searchService.searchEndgames(q, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Endgame search results', { matches }, meta);
  })
};

module.exports = searchController;
