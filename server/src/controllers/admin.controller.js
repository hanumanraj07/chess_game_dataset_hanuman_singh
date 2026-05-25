const adminService = require('../services/admin.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/pagination');

const adminController = {
  getUsers: asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const { skip, meta } = paginate(req.query, page, limit);
    const users = await adminService.getUsers(filters, skip, meta.limit);
    return apiResponse.success(res, 'Users fetched successfully', { users }, meta);
  }),

  getLogs: asyncHandler(async (req, res) => {
    const data = await adminService.getLogs();
    return apiResponse.success(res, 'System logs fetched', data);
  }),

  getSystemHealth: asyncHandler(async (req, res) => {
    const health = await adminService.getSystemHealth();
    return apiResponse.success(res, 'Admin system health fetched', { health });
  }),

  clearCache: asyncHandler(async (req, res) => {
    const result = await adminService.clearCache();
    return apiResponse.success(res, 'Cache clear request completed', result);
  }),

  banUser: asyncHandler(async (req, res) => {
    const user = await adminService.setUserBanStatus(req.params.id, true);
    return apiResponse.success(res, 'User banned successfully', { user });
  }),

  unbanUser: asyncHandler(async (req, res) => {
    const user = await adminService.setUserBanStatus(req.params.id, false);
    return apiResponse.success(res, 'User unbanned successfully', { user });
  }),

  getDashboard: asyncHandler(async (req, res) => {
    const dashboard = await adminService.getDashboard();
    return apiResponse.success(res, 'Admin dashboard fetched', { dashboard });
  })
};

module.exports = adminController;
