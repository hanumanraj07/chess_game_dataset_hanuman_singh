const Match = require('../models/Match');
const Player = require('../models/Player');

const statsService = {
  getTotalMatches: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    return { total };
  },

  getTotalPlayers: async () => {
    const total = await Player.countDocuments();
    return { total };
  },

  getAverageRating: async () => {
    const pipeline = [
      { $match: { isDeleted: false, white_rating: { $ne: '' }, black_rating: { $ne: '' } } },
      { $group: { _id: null, avgWhite: { $avg: { $toInt: '$white_rating' } }, avgBlack: { $avg: { $toInt: '$black_rating' } } } },
      { $project: { _id: 0, avgWhite: { $round: ['$avgWhite', 0] }, avgBlack: { $round: ['$avgBlack', 0] }, avgOverall: { $round: [{ $avg: ['$avgWhite', '$avgBlack'] }, 0] } } }
    ];
    const result = await Match.aggregate(pipeline);
    return result[0] || { avgWhite: 0, avgBlack: 0, avgOverall: 0 };
  },

  getTopOpenings: async () => {
    const pipeline = [
      { $match: { isDeleted: false, opening_name: { $ne: '', $exists: true } } },
      { $group: { _id: { name: '$opening_name', eco: '$opening_eco' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { _id: 0, name: '$_id.name', eco: '$_id.eco', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getCheckmateRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, victory_status: 'mate' });
    return { total, type: 'checkmate', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getResignationRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, victory_status: 'resign' });
    return { total, type: 'resignation', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getTimeoutRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, victory_status: 'outoftime' });
    return { total, type: 'timeout', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getWhiteWinRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, winner: 'white' });
    return { total, type: 'white', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getBlackWinRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, winner: 'black' });
    return { total, type: 'black', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getDrawRate: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const count = await Match.countDocuments({ isDeleted: false, winner: 'draw' });
    return { total, type: 'draw', count, rate: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%' };
  },

  getRatedGames: async () => {
    const total = await Match.countDocuments({ isDeleted: false, rated: 'TRUE' });
    return { type: 'rated', count: total };
  },

  getUnratedGames: async () => {
    const total = await Match.countDocuments({ isDeleted: false, rated: 'FALSE' });
    return { type: 'unrated', count: total };
  },

  getDailyGames: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getMonthlyGames: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { _id: 0, month: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getYearlyGames: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } } } },
      { $group: { _id: { $dateToString: { format: '%Y', date: '$createdDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { _id: 0, year: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  }
};

module.exports = statsService;
