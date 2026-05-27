const playerService = require('../services/player.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/pagination');

const playerController = {
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, sort, ...filters } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const players = await playerService.getAllPlayers(filters, skip, meta.limit);
    return apiResponse.success(res, 'Players fetched successfully', { players }, meta);
  }),

  getByUsername: asyncHandler(async (req, res) => {
    const player = await playerService.getPlayerByUsername(req.params.username);
    return apiResponse.success(res, 'Player fetched successfully', { player });
  }),

  getHistory: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const matches = await playerService.getPlayerHistory(req.params.username, req.query, skip, meta.limit);
    return apiResponse.success(res, 'Player history fetched', { matches }, meta);
  }),

  getStats: asyncHandler(async (req, res) => {
    const stats = await playerService.getPlayerStats(req.params.username);
    return apiResponse.success(res, 'Player stats fetched', { stats });
  }),

  getOpenings: asyncHandler(async (req, res) => {
    const openings = await playerService.getPlayerOpenings(req.params.username);
    return apiResponse.success(res, 'Player openings fetched', { openings });
  }),

  getRatingHistory: asyncHandler(async (req, res) => {
    const history = await playerService.getPlayerRatingHistory(req.params.username);
    return apiResponse.success(res, 'Player rating history fetched', { history });
  }),

  getWinRate: asyncHandler(async (req, res) => {
    const rate = await playerService.getPlayerWinRate(req.params.username);
    return apiResponse.success(res, 'Player win rate fetched', { rate });
  }),

  getLossRate: asyncHandler(async (req, res) => {
    const rate = await playerService.getPlayerLossRate(req.params.username);
    return apiResponse.success(res, 'Player loss rate fetched', { rate });
  }),

  getDrawRate: asyncHandler(async (req, res) => {
    const rate = await playerService.getPlayerDrawRate(req.params.username);
    return apiResponse.success(res, 'Player draw rate fetched', { rate });
  }),

  comparePlayers: asyncHandler(async (req, res) => {
    const comparison = await playerService.comparePlayers(req.params.player1, req.params.player2);
    return apiResponse.success(res, 'Player comparison fetched', { comparison });
  }),

  getTopRated: asyncHandler(async (req, res) => {
    const players = await playerService.getTopRated(req.query);
    return apiResponse.success(res, 'Top rated players fetched', { players });
  }),

  getTopActive: asyncHandler(async (req, res) => {
    const players = await playerService.getTopActive(req.query);
    return apiResponse.success(res, 'Top active players fetched', { players });
  }),

  getTopWinning: asyncHandler(async (req, res) => {
    const players = await playerService.getTopWinning(req.query);
    return apiResponse.success(res, 'Top winning players fetched', { players });
  }),

  getByRatingRange: asyncHandler(async (req, res) => {
    const { min, max } = req.query;
    const players = await playerService.getPlayersByRatingRange(min, max, req.query);
    return apiResponse.success(res, 'Players fetched by rating range', { players });
  }),

  getRecent: asyncHandler(async (req, res) => {
    const matches = await playerService.getRecentMatches(req.params.username);
    return apiResponse.success(res, 'Recent matches fetched', { matches });
  })
};

module.exports = playerController;
