const systemService = require('../services/system.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const systemController = {
  getHealth: asyncHandler(async (req, res) => {
    const health = await systemService.getHealth();
    return apiResponse.success(res, 'Health check passed', { health });
  }),

  getInfo: asyncHandler(async (req, res) => {
    const info = await systemService.getInfo();
    return apiResponse.success(res, 'System information fetched', { info });
  }),

  getLogs: asyncHandler(async (req, res) => {
    const logs = await systemService.getLogs();
    return apiResponse.success(res, 'System logs fetched', logs);
  }),

  getVersion: asyncHandler(async (req, res) => {
    const version = await systemService.getVersion();
    return apiResponse.success(res, 'System version fetched', { version });
  }),

  getStatus: asyncHandler(async (req, res) => {
    const status = await systemService.getStatus();
    return apiResponse.success(res, 'System status fetched', { status });
  }),

  getUptime: asyncHandler(async (req, res) => {
    const uptime = await systemService.getUptime();
    return apiResponse.success(res, 'System uptime fetched', { uptime });
  }),

  getDatabaseStatus: asyncHandler(async (req, res) => {
    const database = await systemService.getDatabaseStatus();
    return apiResponse.success(res, 'Database status fetched', { database });
  }),

  getCacheStatus: asyncHandler(async (req, res) => {
    const cache = await systemService.getCacheStatus();
    return apiResponse.success(res, 'Cache status fetched', { cache });
  }),

  recalculateStats: asyncHandler(async (req, res) => {
    const result = await systemService.recalculateStats();
    return apiResponse.success(res, 'Stats recalculated', result);
  }),

  reindex: asyncHandler(async (req, res) => {
    const result = await systemService.reindex();
    return apiResponse.success(res, 'Search/database indexes refreshed', result);
  }),

  restart: asyncHandler(async (req, res) => {
    const result = await systemService.restart();
    return apiResponse.success(res, 'Restart request handled', result, {}, 202);
  }),

  getConfig: asyncHandler(async (req, res) => {
    const config = await systemService.getConfig();
    return apiResponse.success(res, 'Public configuration fetched', { config });
  }),

  getSecurityEvents: asyncHandler(async (req, res) => {
    const events = await systemService.getSecurityEvents();
    return apiResponse.success(res, 'Security events fetched', events);
  }),

  getPerformance: asyncHandler(async (req, res) => {
    const performance = await systemService.getPerformance();
    return apiResponse.success(res, 'Performance metrics fetched', { performance });
  }),

  getStorage: asyncHandler(async (req, res) => {
    const storage = await systemService.getStorage();
    return apiResponse.success(res, 'Storage analytics fetched', { storage });
  })
};

module.exports = systemController;
