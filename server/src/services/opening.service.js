const Opening = require('../models/Opening');

const openingService = {
  getAllOpenings: async (filters = {}, skip = 0, limit = 10) => {
    const { page, q, ...dbFilters } = filters;
    const query = { ...dbFilters };
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }
    return await Opening.find(query).sort({ totalGames: -1 }).skip(skip).limit(limit);
  },

  countOpenings: async (filters = {}) => {
    const { page, q, ...dbFilters } = filters;
    const query = { ...dbFilters };
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }
    return await Opening.countDocuments(query);
  },

  getPopularOpenings: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ ...dbFilters }).sort({ totalGames: -1 }).limit(20);
  },

  getTrendingOpenings: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ ...dbFilters }).sort({ createdAt: -1 }).limit(20);
  },

  getOpeningWinRates: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ winRate: { $exists: true }, ...dbFilters })
      .select('eco name totalGames winRate')
      .sort({ totalGames: -1 })
      .limit(20);
  },

  searchOpenings: async (q, filters = {}) => {
    const { page, limit, q: _q, ...dbFilters } = filters;
    const query = {
      ...dbFilters,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { eco: { $regex: q, $options: 'i' } },
        { family: { $regex: q, $options: 'i' } }
      ]
    };
    return await Opening.find(query).sort({ totalGames: -1 }).limit(20);
  },

  getByStyle: async (style, filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ style, ...dbFilters }).sort({ totalGames: -1 }).limit(20);
  },

  getCheckmateOpenings: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ avgPly: { $exists: true, $ne: null }, ...dbFilters })
      .sort({ avgPly: 1 })
      .limit(20);
  },

  getRareOpenings: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Opening.find({ ...dbFilters }).sort({ totalGames: 1 }).limit(20);
  },

  getByAdvantage: async (side, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = side === 'white'
      ? { 'winRate.white': { $gt: 50 }, ...dbFilters }
      : { 'winRate.black': { $gt: 50 }, ...dbFilters };
    return await Opening.find(query).sort({ totalGames: -1 }).limit(20);
  },

  getByComplexity: async (level, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = level ? { complexity: level, ...dbFilters } : { complexity: { $exists: true }, ...dbFilters };
    return await Opening.find(query).sort({ totalGames: -1 }).limit(20);
  },

  getOpeningByEco: async (ecoCode) => {
    const opening = await Opening.findOne({ eco: ecoCode.toUpperCase() });
    if (!opening) throw new Error('Opening not found');
    return opening;
  }
};

module.exports = openingService;
