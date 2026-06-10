const Match = require('../models/Match');

const analyticsService = {
  getVictoryDistribution: async () => {
    const pipeline = [
      { $match: { isDeleted: false, victory_status: { $ne: '', $exists: true } } },
      { $group: { _id: '$victory_status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getColorAdvantage: async () => {
    const pipeline = [
      { $match: { isDeleted: false, winner: { $nin: ['draw', ''], $exists: true } } },
      { $group: { _id: '$winner', count: { $sum: 1 } } },
      { $project: { _id: 0, color: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getTopGames: async (skip = 0, limit = 10) => {
    const pipeline = [
      { $match: { isDeleted: false, white_rating: { $ne: '' }, black_rating: { $ne: '' } } },
      {
        $addFields: {
          whiteRatingInt: { $toInt: '$white_rating' },
          blackRatingInt: { $toInt: '$black_rating' }
        }
      },
      {
        $addFields: {
          combinedRating: { $add: ['$whiteRatingInt', '$blackRatingInt'] }
        }
      },
      { $sort: { combinedRating: -1, created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: 1,
          white_id: 1,
          black_id: 1,
          white_rating: 1,
          black_rating: 1,
          combinedRating: 1,
          winner: 1,
          opening_name: 1,
          turns: 1
        }
      }
    ];

    return await Match.aggregate(pipeline);
  },

  getTurnCountAverage: async () => {
    const pipeline = [
      { $match: { isDeleted: false, turns: { $ne: '', $exists: true } } },
      { $group: { _id: null, avgTurns: { $avg: { $toInt: '$turns' } }, minTurns: { $min: { $toInt: '$turns' } }, maxTurns: { $max: { $toInt: '$turns' } } } },
      { $project: { _id: 0, avgTurns: { $round: ['$avgTurns', 1] }, minTurns: 1, maxTurns: 1 } }
    ];
    const result = await Match.aggregate(pipeline);
    return result[0] || { avgTurns: 0, minTurns: 0, maxTurns: 0 };
  },

  getRatedVsCasual: async () => {
    const pipeline = [
      { $match: { isDeleted: false, rated: { $ne: '', $exists: true } } },
      { $group: { _id: '$rated', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getTimeControlUsage: async () => {
    const pipeline = [
      { $match: { isDeleted: false, increment_code: { $ne: '', $exists: true } } },
      { $addFields: { initial: { $toInt: { $arrayElemAt: [{ $split: ['$increment_code', '+'] }, 0] } } } },
      { $addFields: { timeClass: { $switch: { branches: [{ case: { $lt: ['$initial', 180] }, then: 'bullet' }, { case: { $lt: ['$initial', 600] }, then: 'blitz' }, { case: { $lt: ['$initial', 1800] }, then: 'rapid' }], default: 'classical' } } } },
      { $group: { _id: '$timeClass', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, timeClass: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getShortestGames: async () => {
    const pipeline = [
      { $match: { isDeleted: false, turns: { $ne: '', $exists: true } } },
      { $addFields: { turnsInt: { $toInt: '$turns' } } },
      { $sort: { turnsInt: 1 } },
      { $limit: 10 },
      { $project: { id: 1, white_id: 1, black_id: 1, winner: 1, turnsInt: 1, _id: 0 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getLongestGames: async () => {
    const pipeline = [
      { $match: { isDeleted: false, turns: { $ne: '', $exists: true } } },
      { $addFields: { turnsInt: { $toInt: '$turns' } } },
      { $sort: { turnsInt: -1 } },
      { $limit: 10 },
      { $project: { id: 1, white_id: 1, black_id: 1, winner: 1, turnsInt: 1, _id: 0 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getRatingGapUpsets: async () => {
    const pipeline = [
      { $match: { isDeleted: false, winner: { $in: ['white', 'black'] }, white_rating: { $ne: '' }, black_rating: { $ne: '' } } },
      { $addFields: { whiteInt: { $toInt: '$white_rating' }, blackInt: { $toInt: '$black_rating' }, ratingGap: { $abs: { $subtract: [{ $toInt: '$white_rating' }, { $toInt: '$black_rating' }] } } } },
      { $match: { ratingGap: { $gte: 200 } } },
      { $addFields: { upset: { $or: [{ $and: [{ $eq: ['$winner', 'white'] }, { $lt: ['$whiteInt', '$blackInt'] }] }, { $and: [{ $eq: ['$winner', 'black'] }, { $lt: ['$blackInt', '$whiteInt'] }] }] } } },
      { $match: { upset: true } },
      { $sort: { ratingGap: -1 } },
      { $limit: 10 },
      { $project: { id: 1, white_id: 1, black_id: 1, whiteInt: 1, blackInt: 1, ratingGap: 1, winner: 1, _id: 0 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getCheckmateFrequency: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const checkmates = await Match.countDocuments({ isDeleted: false, victory_status: 'mate' });
    return { total, type: 'checkmate', count: checkmates, percentage: total > 0 ? `${((checkmates / total) * 100).toFixed(1)}%` : '0%' };
  },

  getDrawFrequency: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const draws = await Match.countDocuments({ isDeleted: false, winner: 'draw' });
    return { total, type: 'draw', count: draws, percentage: total > 0 ? `${((draws / total) * 100).toFixed(1)}%` : '0%' };
  },

  getResignationFrequency: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const resigns = await Match.countDocuments({ isDeleted: false, victory_status: 'resign' });
    return { total, type: 'resignation', count: resigns, percentage: total > 0 ? `${((resigns / total) * 100).toFixed(1)}%` : '0%' };
  },

  getTimeouts: async () => {
    const total = await Match.countDocuments({ isDeleted: false });
    const timeouts = await Match.countDocuments({ isDeleted: false, victory_status: 'outoftime' });
    return { total, type: 'timeout', count: timeouts, percentage: total > 0 ? `${((timeouts / total) * 100).toFixed(1)}%` : '0%' };
  },

  getOpeningSuccess: async () => {
    const pipeline = [
      { $match: { isDeleted: false, opening_name: { $ne: '', $exists: true } } },
      { $group: { _id: { name: '$opening_name', eco: '$opening_eco' }, total: { $sum: 1 }, whiteWins: { $sum: { $cond: [{ $eq: ['$winner', 'white'] }, 1, 0] } }, blackWins: { $sum: { $cond: [{ $eq: ['$winner', 'black'] }, 1, 0] } }, draws: { $sum: { $cond: [{ $eq: ['$winner', 'draw'] }, 1, 0] } } } },
      { $addFields: { winRate: { $round: [{ $multiply: [{ $divide: ['$whiteWins', '$total'] }, 100] }, 1] } } },
      { $sort: { total: -1 } },
      { $limit: 15 },
      { $project: { _id: 0, name: '$_id.name', eco: '$_id.eco', total: 1, whiteWins: 1, blackWins: 1, draws: 1, winRate: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getPlayerGrowth: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } } } },
      { $group: { _id: { year: { $year: '$createdDate' }, month: { $month: '$createdDate' } }, newPlayers: { $addToSet: '$white_id' } } },
      { $addFields: { playerCount: { $size: '$newPlayers' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', playerCount: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getHourlyActivity: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } } } },
      { $group: { _id: { $hour: '$createdDate' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { _id: 0, hour: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  getRatingDistribution: async () => {
    const Player = require('../models/Player');
    const pipeline = [
      {
        $bucket: {
          groupBy: "$currentRating",
          boundaries: [0, 1000, 1200, 1400, 1600, 1800, 2000, 2200],
          default: 2200,
          output: { count: { $sum: 1 } }
        }
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "< 1000" },
                { case: { $eq: ["$_id", 1000] }, then: "1000-1199" },
                { case: { $eq: ["$_id", 1200] }, then: "1200-1399" },
                { case: { $eq: ["$_id", 1400] }, then: "1400-1599" },
                { case: { $eq: ["$_id", 1600] }, then: "1600-1799" },
                { case: { $eq: ["$_id", 1800] }, then: "1800-1999" },
                { case: { $eq: ["$_id", 2000] }, then: "2000-2199" }
              ],
              default: "2200+"
            }
          },
          count: 1,
          _id: 0
        }
      }
    ];
    return await Player.aggregate(pipeline);
  },

  getRatingTrend: async () => {
    const pipeline = [
      { $match: { isDeleted: false, created_at: { $ne: '', $exists: true }, white_rating: { $ne: '' }, black_rating: { $ne: '' } } },
      { $addFields: { createdDate: { $toDate: { $toLong: { $toDouble: '$created_at' } } }, avgMatchRating: { $divide: [{ $add: [{ $toInt: '$white_rating' }, { $toInt: '$black_rating' }] }, 2] } } },
      { $group: { _id: { year: { $year: '$createdDate' }, month: { $month: '$createdDate' } }, avgRating: { $avg: '$avgMatchRating' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, date: { $concat: [{ $toString: '$_id.year' }, '-', { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }] }, avgRating: { $round: ['$avgRating', 0] } } }
    ];
    return await Match.aggregate(pipeline);
  }
};

module.exports = analyticsService;
