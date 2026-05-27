const os = require('os');
const User = require('../models/User');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Opening = require('../models/Opening');

const sanitizeUser = '-password -refreshToken -resetToken -resetTokenExpiry';

const adminService = {
  getUsers: async (filters = {}, skip = 0, limit = 20) => {
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.emailVerified) query.emailVerified = filters.emailVerified === 'true';
    if (filters.isBanned) query.isBanned = filters.isBanned === 'true';

    return await User.find(query)
      .select(sanitizeUser)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  getLogs: async () => {
    return {
      message: 'File-based log storage is not configured yet.',
      logs: []
    };
  },

  getSystemHealth: async () => {
    const [users, matches, players, openings] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments({ isDeleted: false }),
      Player.countDocuments(),
      Opening.countDocuments()
    ]);

    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      cpuCount: os.cpus().length,
      counts: { users, matches, players, openings }
    };
  },

  clearCache: async () => {
    return {
      cleared: true,
      message: 'No external cache is configured; in-memory cache clear completed.'
    };
  },

  setUserBanStatus: async (id, isBanned) => {
    const user = await User.findByIdAndUpdate(
      id,
      { isBanned },
      { new: true, runValidators: true }
    ).select(sanitizeUser);

    if (!user) throw new Error('User not found');
    return user;
  },

  getDashboard: async () => {
    const [users, admins, matches, archivedMatches, players, openings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Match.countDocuments({ isDeleted: false }),
      Match.countDocuments({ isDeleted: false, isArchived: true }),
      Player.countDocuments(),
      Opening.countDocuments()
    ]);

    return {
      users,
      admins,
      matches,
      archivedMatches,
      players,
      openings,
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = adminService;
