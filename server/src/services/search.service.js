const Match = require('../models/Match');
const Player = require('../models/Player');
const Opening = require('../models/Opening');

const searchService = {
  searchMatches: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = {
      isDeleted: false,
      $or: [
        { id: { $regex: q, $options: 'i' } },
        { white_id: { $regex: q, $options: 'i' } },
        { black_id: { $regex: q, $options: 'i' } },
        { opening_name: { $regex: q, $options: 'i' } },
        { opening_eco: { $regex: q, $options: 'i' } },
        { winner: { $regex: q, $options: 'i' } },
        { victory_status: { $regex: q, $options: 'i' } }
      ],
      ...dbFilters
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  searchPlayers: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = {
      ...dbFilters,
      $or: [
        { username: { $regex: q, $options: 'i' } }
      ]
    };
    return await Player.find(query).sort({ totalGames: -1 }).limit(20);
  },

  searchOpenings: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
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

  searchEco: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = { eco: { $regex: q, $options: 'i' }, ...dbFilters };
    return await Opening.find(query).sort({ totalGames: -1 }).limit(20);
  },

  searchMoves: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = {
      isDeleted: false,
      moves: { $regex: q.replace(/,/g, ' '), $options: 'i' },
      ...dbFilters
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  searchFuzzy: async (q) => {
    const regex = new RegExp(q, 'i');
    const [matches, players, openings] = await Promise.all([
      Match.countDocuments({ isDeleted: false, $or: [{ id: regex }, { white_id: regex }, { black_id: regex }, { opening_name: regex }] }),
      Player.countDocuments({ username: regex }),
      Opening.countDocuments({ $or: [{ name: regex }, { eco: regex }, { family: regex }] })
    ]);
    return { matches, players, openings };
  },

  searchAutocomplete: async (q) => {
    const regex = new RegExp(`^${q}`, 'i');
    const [players, openings] = await Promise.all([
      Player.find({ username: regex }).select('username').sort({ totalGames: -1 }).limit(5),
      Opening.find({ $or: [{ name: regex }, { eco: regex }] }).select('name eco').sort({ totalGames: -1 }).limit(5)
    ]);
    return { players: players.map(p => p.username), openings: openings.map(o => ({ name: o.name, eco: o.eco })) };
  },

  getRecentSearches: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    return await Match.find({ isDeleted: false, ...dbFilters })
      .sort({ created_at: -1 })
      .limit(10)
      .select('id white_id black_id opening_name');
  },

  getPopularSearches: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    const pipeline = [
      { $match: { isDeleted: false, opening_name: { $ne: '', $exists: true }, ...dbFilters } },
      { $group: { _id: '$opening_name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ];
    return await Match.aggregate(pipeline);
  },

  searchAdvanced: async (filters = {}) => {
    const { page, q, from, to, rating, opening, status, ...dbFilters } = filters;
    const query = { isDeleted: false, ...dbFilters };

    if (q) {
      query.$or = [
        { id: { $regex: q, $options: 'i' } },
        { white_id: { $regex: q, $options: 'i' } },
        { black_id: { $regex: q, $options: 'i' } },
        { opening_name: { $regex: q, $options: 'i' } },
        { moves: { $regex: q, $options: 'i' } }
      ];
    }
    if (rating) query.$expr = { $or: [{ $gte: [{ $toInt: '$white_rating' }, parseInt(rating)] }, { $gte: [{ $toInt: '$black_rating' }, parseInt(rating)] }] };
    if (status) query.victory_status = status;
    if (opening) query.opening_name = { $regex: opening, $options: 'i' };

    const matches = await Match.find(query).sort({ created_at: -1 }).limit(20);

    return { matches, filters: { q, from, to, rating, opening, status } };
  },

  searchByPlayerRating: async (rating, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const ratingNum = parseInt(rating) || 0;
    const query = {
      isDeleted: false,
      $expr: {
        $or: [
          { $gte: [{ $toInt: '$white_rating' }, ratingNum] },
          { $gte: [{ $toInt: '$black_rating' }, ratingNum] }
        ]
      },
      ...dbFilters
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  searchByDateRange: async (from, to, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = { isDeleted: false, ...dbFilters };

    if (from || to) {
      query.$expr = {};
      const conditions = [];
      if (from) conditions.push({ $gte: [{ $toLong: { $toDouble: '$created_at' } }, new Date(from).getTime()] });
      if (to) conditions.push({ $lte: [{ $toLong: { $toDouble: '$created_at' } }, new Date(to).getTime()] });
      query.$expr = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  searchByOpeningFamily: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const regex = new RegExp(q, 'i');
    return await Opening.find({ family: regex, ...dbFilters }).sort({ totalGames: -1 }).limit(20);
  },

  searchCheckmatePatterns: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = {
      isDeleted: false,
      victory_status: 'mate',
      ...dbFilters
    };
    if (q) query.moves = { $regex: q, $options: 'i' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  searchEndgames: async (q, filters = {}) => {
    const { page, ...dbFilters } = filters;
    const query = {
      isDeleted: false,
      $expr: { $gte: [{ $toInt: '$turns' }, 60] },
      ...dbFilters
    };
    if (q) query.moves = { $regex: q, $options: 'i' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  }
};

module.exports = searchService;
