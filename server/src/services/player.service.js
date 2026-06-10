const Player = require('../models/Player');
const Match = require('../models/Match');

const playerService = {
  getAllPlayers: async (filters = {}, skip = 0, limit = 10) => {
    const { page, q, ...dbFilters } = filters;
    const query = { ...dbFilters };
    if (q) {
      query.username = { $regex: q, $options: 'i' };
    }
    return await Player.find(query).sort({ totalGames: -1 }).skip(skip).limit(limit);
  },

  countPlayers: async (filters = {}) => {
    const { page, q, ...dbFilters } = filters;
    const query = { ...dbFilters };
    if (q) {
      query.username = { $regex: q, $options: 'i' };
    }
    return await Player.countDocuments(query);
  },

  getPlayerByUsername: async (identifier) => {
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: identifier } : { username: identifier };
    
    const player = await Player.findOne(query);
    if (!player) throw new Error('Player not found');
    
    // Fetch recent match history to attach for the frontend PlayerDetail view
    const matchHistory = await Match.find({ 
      isDeleted: false, 
      $or: [{ white_id: player.username }, { black_id: player.username }] 
    }).sort({ created_at: -1 }).limit(20);
    
    return { ...player.toObject(), matchHistory };
  },

  getPlayerHistory: async (username, filters = {}, skip = 0, limit = 20) => {
    const { page, limit: _limit, ...dbFilters } = filters;
    const query = {
      isDeleted: false,
      $or: [{ white_id: username }, { black_id: username }],
      ...dbFilters
    };
    return await Match.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);
  },

  getPlayerStats: async (username) => {
    const player = await Player.findOne({ username });
    if (!player) throw new Error('Player not found');
    return {
      username: player.username,
      currentRating: player.currentRating,
      totalGames: player.totalGames,
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      winRate: player.totalGames > 0 ? ((player.wins / player.totalGames) * 100).toFixed(1) : 0,
      lossRate: player.totalGames > 0 ? ((player.losses / player.totalGames) * 100).toFixed(1) : 0,
      drawRate: player.totalGames > 0 ? ((player.draws / player.totalGames) * 100).toFixed(1) : 0,
      lastSeen: player.lastSeen
    };
  },

  getPlayerOpenings: async (username) => {
    const pipeline = [
      { $match: { isDeleted: false, $or: [{ white_id: username }, { black_id: username }] } },
      { $group: { _id: { eco: '$opening_eco', name: '$opening_name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, eco: '$_id.eco', name: '$_id.name', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getPlayerRatingHistory: async (username) => {
    const player = await Player.findOne({ username });
    if (!player) throw new Error('Player not found');
    return player.ratingHistory || [];
  },

  getPlayerWinRate: async (username) => {
    const player = await Player.findOne({ username });
    if (!player) throw new Error('Player not found');
    const rate = player.totalGames > 0 ? (player.wins / player.totalGames) * 100 : 0;
    return { username: player.username, wins: player.wins, totalGames: player.totalGames, winRate: `${rate.toFixed(1)}%` };
  },

  getPlayerLossRate: async (username) => {
    const player = await Player.findOne({ username });
    if (!player) throw new Error('Player not found');
    const rate = player.totalGames > 0 ? (player.losses / player.totalGames) * 100 : 0;
    return { username: player.username, losses: player.losses, totalGames: player.totalGames, lossRate: `${rate.toFixed(1)}%` };
  },

  getPlayerDrawRate: async (username) => {
    const player = await Player.findOne({ username });
    if (!player) throw new Error('Player not found');
    const rate = player.totalGames > 0 ? (player.draws / player.totalGames) * 100 : 0;
    return { username: player.username, draws: player.draws, totalGames: player.totalGames, drawRate: `${rate.toFixed(1)}%` };
  },

  comparePlayers: async (player1, player2) => {
    const [p1, p2] = await Promise.all([
      Player.findOne({ username: player1 }),
      Player.findOne({ username: player2 })
    ]);
    if (!p1) throw new Error(`Player not found: ${player1}`);
    if (!p2) throw new Error(`Player not found: ${player2}`);

    return {
      player1: { username: p1.username, currentRating: p1.currentRating, totalGames: p1.totalGames, wins: p1.wins, losses: p1.losses, draws: p1.draws },
      player2: { username: p2.username, currentRating: p2.currentRating, totalGames: p2.totalGames, wins: p2.wins, losses: p2.losses, draws: p2.draws }
    };
  },

  getTopRated: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Player.find({ ...dbFilters }).sort({ currentRating: -1 }).limit(20);
  },

  getTopActive: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Player.find({ ...dbFilters }).sort({ totalGames: -1 }).limit(20);
  },

  getTopWinning: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Player.find({ ...dbFilters }).sort({ wins: -1 }).limit(20);
  },

  getPlayersByRatingRange: async (min, max, filters = {}) => {
    const { page, min: _min, max: _max, ...dbFilters } = filters;
    const query = { ...dbFilters };
    if (min || max) {
      query.currentRating = {};
      if (min) query.currentRating.$gte = parseInt(min);
      if (max) query.currentRating.$lte = parseInt(max);
    }
    return await Player.find(query).sort({ currentRating: -1 }).limit(20);
  },

  getRecentMatches: async (username) => {
    const query = {
      isDeleted: false,
      $or: [{ white_id: username }, { black_id: username }]
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(10);
  }
};

module.exports = playerService;
