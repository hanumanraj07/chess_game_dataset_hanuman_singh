const os = require('os');
const mongoose = require('mongoose');
const env = require('../config/env');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Opening = require('../models/Opening');
const User = require('../models/User');
const packageJson = require('../../package.json');

const dbStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

const systemService = {
  getHealth: async () => {
    return {
      status: 'healthy',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  },

  getInfo: async () => {
    return {
      name: packageJson.name,
      version: packageJson.version,
      node: process.version,
      platform: process.platform,
      environment: env.NODE_ENV
    };
  },

  getLogs: async () => {
    return {
      message: 'Persistent log storage is not configured yet.',
      logs: []
    };
  },

  getVersion: async () => {
    return {
      apiVersion: 'v1',
      packageVersion: packageJson.version
    };
  },

  getStatus: async () => {
    return {
      status: 'online',
      database: dbStates[mongoose.connection.readyState] || 'unknown',
      uptimeSeconds: Math.round(process.uptime())
    };
  },

  getUptime: async () => {
    return {
      uptimeSeconds: Math.round(process.uptime()),
      uptimeHuman: `${Math.floor(process.uptime() / 60)} minutes`
    };
  },

  getDatabaseStatus: async () => {
    return {
      state: dbStates[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    };
  },

  getCacheStatus: async () => {
    return {
      configured: false,
      provider: null,
      status: 'not_configured'
    };
  },

  recalculateStats: async () => {
    const [matches, players, openings] = await Promise.all([
      Match.countDocuments({ isDeleted: false }),
      Player.countDocuments(),
      Opening.countDocuments()
    ]);

    return {
      recalculated: true,
      counts: { matches, players, openings }
    };
  },

  reindex: async () => {
    await Promise.all([
      Match.syncIndexes(),
      Player.syncIndexes(),
      Opening.syncIndexes(),
      User.syncIndexes()
    ]);

    return { reindexed: true };
  },

  restart: async () => {
    return {
      accepted: true,
      message: 'Restart is deployment-specific and was not executed by the API process.'
    };
  },

  getConfig: async () => {
    return {
      environment: env.NODE_ENV,
      apiVersion: 'v1',
      rateLimitEnabled: true,
      authEnabled: true
    };
  },

  getSecurityEvents: async () => {
    return {
      message: 'Security event persistence is not configured yet.',
      events: []
    };
  },

  getPerformance: async () => {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      loadAverage: os.loadavg()
    };
  },

  getStorage: async () => {
    if (mongoose.connection.readyState !== 1) {
      return { databaseConnected: false };
    }

    const stats = await mongoose.connection.db.stats();
    return {
      databaseConnected: true,
      database: mongoose.connection.name,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize
    };
  }
};

module.exports = systemService;
