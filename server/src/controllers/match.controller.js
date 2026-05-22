const matchService = require('../services/match.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildSort } = require('../utils/pagination');

/**
 * Match Controller Handlers
 */
const matchController = {
  // Filter: white-wins / black-wins / draws
  // @route   GET /api/v1/filters/white-wins
  filterWhiteWins: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByWhiteWins(req.query);
    return apiResponse.success(res, 'White win matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/black-wins
  filterBlackWins: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByBlackWins(req.query);
    return apiResponse.success(res, 'Black win matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/draws
  filterDraws: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByDraws(req.query);
    return apiResponse.success(res, 'Draw matches fetched', { matches });
  }),

  // Filter: rated / unrated
  // @route   GET /api/v1/filters/rated
  filterRated: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByRated(req.query);
    return apiResponse.success(res, 'Rated matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/unrated
  filterUnrated: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByUnrated(req.query);
    return apiResponse.success(res, 'Unrated matches fetched', { matches });
  }),

  // Filter: checkmates / resignations / timeouts
  // @route   GET /api/v1/filters/checkmates
  filterCheckmates: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByCheckmates(req.query);
    return apiResponse.success(res, 'Checkmate matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/resignations
  filterResignations: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByResignations(req.query);
    return apiResponse.success(res, 'Resignation matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/timeouts
  filterTimeouts: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByTimeouts(req.query);
    return apiResponse.success(res, 'Timeout matches fetched', { matches });
  }),

  // Filter: time class
  // @route   GET /api/v1/filters/bullet
  filterBullet: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByTimeClass('bullet', req.query);
    return apiResponse.success(res, 'Bullet matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/blitz
  filterBlitz: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByTimeClass('blitz', req.query);
    return apiResponse.success(res, 'Blitz matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/rapid
  filterRapid: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByTimeClass('rapid', req.query);
    return apiResponse.success(res, 'Rapid matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/classical
  filterClassical: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByTimeClass('classical', req.query);
    return apiResponse.success(res, 'Classical matches fetched', { matches });
  }),

  // Filter: high / low rated
  // @route   GET /api/v1/filters/high-rated
  filterHighRated: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByHighRated(req.query);
    return apiResponse.success(res, 'High rated matches fetched', { matches });
  }),

  // @route   GET /api/v1/filters/low-rated
  filterLowRated: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByLowRated(req.query);
    return apiResponse.success(res, 'Low rated matches fetched', { matches });
  }),

  // Filter: long games
  // @route   GET /api/v1/filters/long-games
  filterLongGames: asyncHandler(async (req, res) => {
    const matches = await matchService.filterByLongGames(req.query);
    return apiResponse.success(res, 'Long games fetched', { matches });
  }),

  // @desc    Get all matches (with sort & pagination)
  // @route   GET /api/v1/matches
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, sort, ...filters } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const sortObj = buildSort(sort);
    const matches = await matchService.getAllMatches(filters, sortObj, skip, meta.limit);
    return apiResponse.success(res, 'Matches fetched successfully', { matches }, meta);
  }),

  // @desc    Get shortest matches (by turns ascending)
  // @route   GET /api/v1/matches/sort/shortest
  getShortestMatches: asyncHandler(async (req, res) => {
    const matches = await matchService.getShortestMatches(req.query);
    return apiResponse.success(res, 'Shortest matches fetched', { matches });
  }),

  // @desc    Get longest matches (by turns descending)
  // @route   GET /api/v1/matches/sort/longest
  getLongestMatches: asyncHandler(async (req, res) => {
    const matches = await matchService.getLongestMatches(req.query);
    return apiResponse.success(res, 'Longest matches fetched', { matches });
  }),

  // @desc    Get highest rated matches
  // @route   GET /api/v1/matches/sort/highest-rated
  getHighestRated: asyncHandler(async (req, res) => {
    const matches = await matchService.getHighestRated(req.query);
    return apiResponse.success(res, 'Highest rated matches fetched', { matches });
  }),

  // @desc    Cursor-based pagination
  // @route   GET /api/v1/matches/scroll?cursor=:id
  getMatchesByCursor: asyncHandler(async (req, res) => {
    const { cursor, limit } = req.query;
    const { matches, nextCursor } = await matchService.getMatchesByCursor(cursor, limit);
    return apiResponse.success(res, 'Matches fetched', { matches, nextCursor });
  }),

  // @desc    Infinite scroll pagination
  // @route   GET /api/v1/matches/infinite?page=1
  getMatchesInfinite: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const matches = await matchService.getMatchesInfinite(skip, meta.limit);
    return apiResponse.success(res, 'Matches fetched', { matches }, meta);
  }),

  // @desc    Get match by ID
  // @route   GET /api/v1/matches/:id
  getById: asyncHandler(async (req, res) => {
    const match = await matchService.getMatchById(req.params.id);
    return apiResponse.success(res, 'Match fetched successfully', { match });
  }),

  // @desc    Get match moves
  // @route   GET /api/v1/matches/:id/moves
  getMoves: asyncHandler(async (req, res) => {
    const moves = await matchService.getMatchMoves(req.params.id);
    return apiResponse.success(res, 'Match moves fetched', { moves });
  }),

  // @desc    Get match PGN
  // @route   GET /api/v1/matches/:id/pgn
  getPGN: asyncHandler(async (req, res) => {
    const pgn = await matchService.getMatchPGN(req.params.id);
    return apiResponse.success(res, 'Match PGN fetched', { pgn });
  }),

  // @desc    Get match FEN
  // @route   GET /api/v1/matches/:id/fen
  getFEN: asyncHandler(async (req, res) => {
    const fen = await matchService.getMatchFEN(req.params.id);
    return apiResponse.success(res, 'Match FEN fetched', { fen });
  }),

  // @desc    Get match analysis
  // @route   GET /api/v1/matches/:id/analysis
  getAnalysis: asyncHandler(async (req, res) => {
    const analysis = await matchService.getMatchAnalysis(req.params.id);
    return apiResponse.success(res, 'Match analysis fetched', { analysis });
  }),

  // @desc    Get latest matches
  // @route   GET /api/v1/matches/latest
  getLatestMatches: asyncHandler(async (req, res) => {
    const matches = await matchService.getLatestMatches(req.query);
    return apiResponse.success(res, 'Latest matches fetched', { matches });
  }),

  // @desc    Get trending matches
  // @route   GET /api/v1/matches/trending
  getTrendingMatches: asyncHandler(async (req, res) => {
    const matches = await matchService.getTrendingMatches(req.query);
    return apiResponse.success(res, 'Trending matches fetched', { matches });
  }),

  // @desc    Get random match
  // @route   GET /api/v1/matches/random
  getRandomMatch: asyncHandler(async (req, res) => {
    const match = await matchService.getRandomMatch();
    return apiResponse.success(res, 'Random match fetched', { match });
  }),

  // @desc    Create new match
  // @route   POST /api/v1/matches
  create: asyncHandler(async (req, res) => {
    const match = await matchService.createMatch(req.body);
    return apiResponse.success(res, 'Match created successfully', { match }, {}, 201);
  }),

  // @desc    Update match
  // @route   PATCH /api/v1/matches/:id
  update: asyncHandler(async (req, res) => {
    const match = await matchService.updateMatch(req.params.id, req.body);
    return apiResponse.success(res, 'Match updated successfully', { match });
  }),

  // @desc    Archive match
  // @route   PATCH /api/v1/matches/:id/archive
  archive: asyncHandler(async (req, res) => {
    const match = await matchService.archiveMatch(req.params.id);
    return apiResponse.success(res, 'Match archived successfully', { match });
  }),

  // @desc    Restore match from archive
  // @route   PATCH /api/v1/matches/:id/restore
  restore: asyncHandler(async (req, res) => {
    const match = await matchService.restoreMatch(req.params.id);
    return apiResponse.success(res, 'Match restored successfully', { match });
  }),

  // @desc    Bulk upload matches
  // @route   POST /api/v1/matches/bulk-upload
  bulkUpload: asyncHandler(async (req, res) => {
    const result = await matchService.bulkUpload(req.body.matches);
    return apiResponse.success(res, 'Bulk upload successful', result, {}, 201);
  }),

  // @desc    Bulk update matches
  // @route   PATCH /api/v1/matches/bulk-update
  bulkUpdate: asyncHandler(async (req, res) => {
    const result = await matchService.bulkUpdate(req.body.ids, req.body.updateData);
    return apiResponse.success(res, 'Bulk update successful', result);
  }),

  // @desc    Bulk delete matches (soft delete)
  // @route   POST /api/v1/matches/bulk-delete
  bulkDelete: asyncHandler(async (req, res) => {
    const result = await matchService.bulkDelete(req.body.ids);
    return apiResponse.success(res, 'Bulk delete successful', result);
  }),

  // @desc    Bulk archive matches
  // @route   PATCH /api/v1/matches/bulk/archive
  bulkArchive: asyncHandler(async (req, res) => {
    const result = await matchService.bulkArchive(req.body.ids);
    return apiResponse.success(res, 'Bulk archive successful', result);
  }),

  // @desc    Bulk restore matches
  // @route   PATCH /api/v1/matches/bulk/restore
  bulkRestore: asyncHandler(async (req, res) => {
    const result = await matchService.bulkRestore(req.body.ids);
    return apiResponse.success(res, 'Bulk restore successful', result);
  }),

  // @desc    Replace match (full PUT)
  // @route   PUT /api/v1/matches/:id
  replace: asyncHandler(async (req, res) => {
    const match = await matchService.replaceMatch(req.params.id, req.body);
    return apiResponse.success(res, 'Match replaced successfully', { match });
  }),

  // @desc    Delete match
  // @route   DELETE /api/v1/matches/:id
  delete: asyncHandler(async (req, res) => {
    await matchService.deleteMatch(req.params.id);
    return apiResponse.success(res, 'Match deleted successfully');
  })
};

module.exports = matchController;
