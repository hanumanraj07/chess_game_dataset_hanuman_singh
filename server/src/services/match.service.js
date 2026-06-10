const Match = require('../models/Match');

const getMatchQuery = (matchId) => {
  return matchId.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: matchId, isDeleted: false }
    : { id: matchId, isDeleted: false };
};

/**
 * Match Service Logic
 */
const matchService = {
  /**
   * Get all matches (non-deleted) with sort & pagination
   */
  getAllMatches: async (filters = {}, sort = { created_at: -1 }, skip = 0, limit = 10) => {
    const { page, q, rated, type, ...dbFilters } = filters;
    const query = { ...dbFilters, isDeleted: false };
    
    if (q) {
      query.$or = [
        { white_id: { $regex: q, $options: 'i' } },
        { black_id: { $regex: q, $options: 'i' } },
        { opening_name: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (rated) {
      query.rated = rated.toUpperCase();
    }
    
    return await Match.find(query).sort(sort).skip(skip).limit(limit);
  },

  countMatches: async (filters = {}) => {
    const { page, q, rated, type, ...dbFilters } = filters;
    const query = { ...dbFilters, isDeleted: false };
    
    if (q) {
      query.$or = [
        { white_id: { $regex: q, $options: 'i' } },
        { black_id: { $regex: q, $options: 'i' } },
        { opening_name: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (rated) {
      query.rated = rated.toUpperCase();
    }
    
    return await Match.countDocuments(query);
  },

  /**
   * Get match by Lichess ID
   */
  getMatchById: async (matchId) => {
    const match = await Match.findOne(getMatchQuery(matchId));
    if (!match) throw new Error('Match not found');
    return match;
  },

  /**
   * Get match moves
   */
  getMatchMoves: async (matchId) => {
    const match = await Match.findOne(getMatchQuery(matchId));
    if (!match) throw new Error('Match not found');
    return match.moves; // Return the raw moves string
  },

  /**
   * Get match PGN (simplified - in reality would convert to proper PGN)
   */
  getMatchPGN: async (matchId) => {
    const match = await Match.findOne(getMatchQuery(matchId));
    if (!match) throw new Error('Match not found');
    // For now, return moves as PGN (real implementation would add headers, etc.)
    return match.moves;
  },

  /**
   * Get match FEN (simplified - returns starting position)
   */
  getMatchFEN: async (matchId) => {
    const match = await Match.findOne(getMatchQuery(matchId));
    if (!match) throw new Error('Match not found');
    // Return starting FEN position (real implementation would calculate from moves)
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  },

  /**
   * Get match analysis (basic stats)
   */
  getMatchAnalysis: async (matchId) => {
    const match = await Match.findOne(getMatchQuery(matchId));
    if (!match) throw new Error('Match not found');
    return {
      id: match.id,
      turns: match.turns,
      winner: match.winner,
      victoryStatus: match.victory_status,
      openingName: match.opening_name,
      openingECO: match.opening_eco,
      rated: match.rated,
      whitePlayer: match.white_id,
      blackPlayer: match.black_id,
      whiteRating: match.white_rating,
      blackRating: match.black_rating,
      incrementCode: match.increment_code,
      createdAt: match.created_at,
      lastMoveAt: match.last_move_at
    };
  },

  /**
   * Get latest matches
   */
  getLatestMatches: async (filters = {}, skip = 0, limit = 10) => {
    const query = { ...filters, isDeleted: false };
    return await Match.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Get trending matches (simplified - most recent)
   */
  getTrendingMatches: async (filters = {}, skip = 0, limit = 10) => {
    // In a real implementation, this might consider views, likes, etc.
    // For now, return most recent matches
    const query = { ...filters, isDeleted: false };
    return await Match.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Get random match
   */
  getRandomMatch: async () => {
    const count = await Match.countDocuments({ isDeleted: false });
    if (count === 0) throw new Error('No matches found');
    const random = Math.floor(Math.random() * count);
    return await Match.findOne({ isDeleted: false }).skip(random);
  },

  /**
   * Create new match
   */
  createMatch: async (matchData) => {
    // Check if match ID already exists
    const existing = await Match.findOne({ id: matchData.id });
    if (existing) throw new Error('Match ID already exists');

    return await Match.create(matchData);
  },

  /**
   * Update match
   */
  updateMatch: async (matchId, updateData) => {
    const match = await Match.findOneAndUpdate(
      { id: matchId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );
    if (!match) throw new Error('Match not found');
    return match;
  },

  /**
   * Archive match (soft hide)
   */
  archiveMatch: async (matchId) => {
    const match = await Match.findOneAndUpdate(
      { id: matchId, isDeleted: false, isArchived: false },
      { isArchived: true },
      { new: true }
    );
    if (!match) throw new Error('Match not found or already archived');
    return match;
  },

  /**
   * Restore match from archive
   */
  restoreMatch: async (matchId) => {
    const match = await Match.findOneAndUpdate(
      { id: matchId, isDeleted: false, isArchived: true },
      { isArchived: false },
      { new: true }
    );
    if (!match) throw new Error('Match not found or not archived');
    return match;
  },

  /**
   * Bulk upload matches
   */
  bulkUpload: async (matchesData = []) => {
    if (!matchesData.length) throw new Error('No matches provided');

    let createdCount = 0;
    const created = [];

    for (const data of matchesData) {
      const existing = await Match.findOne({ id: data.id });
      if (existing) continue;
      const match = await Match.create(data);
      created.push(match);
      createdCount++;
    }

    return { createdCount, matches: created };
  },

  /**
   * Bulk update matches by IDs
   */
  bulkUpdate: async (ids = [], updateData = {}) => {
    if (!ids.length) throw new Error('No IDs provided');

    const result = await Match.updateMany(
      { id: { $in: ids }, isDeleted: false },
      updateData,
      { runValidators: true }
    );

    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  },

  /**
   * Bulk soft delete matches by IDs
   */
  bulkDelete: async (ids = []) => {
    if (!ids.length) throw new Error('No IDs provided');

    const result = await Match.updateMany(
      { id: { $in: ids }, isDeleted: false },
      { isDeleted: true }
    );

    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  },

  /**
   * Bulk archive matches by IDs
   */
  bulkArchive: async (ids = []) => {
    if (!ids.length) throw new Error('No IDs provided');

    const result = await Match.updateMany(
      { id: { $in: ids }, isDeleted: false, isArchived: false },
      { isArchived: true }
    );

    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  },

  /**
   * Bulk restore matches from archive by IDs
   */
  bulkRestore: async (ids = []) => {
    if (!ids.length) throw new Error('No IDs provided');

    const result = await Match.updateMany(
      { id: { $in: ids }, isDeleted: false, isArchived: true },
      { isArchived: false }
    );

    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  },

  /**
   * Shortest matches (by turns ascending via aggregation)
   */
  getShortestMatches: async (filters = {}) => {
    const pipeline = [
      { $match: { isDeleted: false, turns: { $ne: '', $exists: true }, ...filters } },
      { $addFields: { turnsInt: { $toInt: '$turns' } } },
      { $sort: { turnsInt: 1 } },
      { $limit: 20 }
    ];
    return await Match.aggregate(pipeline);
  },

  /**
   * Longest matches (by turns descending via aggregation)
   */
  getLongestMatches: async (filters = {}) => {
    const pipeline = [
      { $match: { isDeleted: false, turns: { $ne: '', $exists: true }, ...filters } },
      { $addFields: { turnsInt: { $toInt: '$turns' } } },
      { $sort: { turnsInt: -1 } },
      { $limit: 20 }
    ];
    return await Match.aggregate(pipeline);
  },

  /**
   * Cursor-based pagination
   */
  getMatchesByCursor: async (cursor, limit = 20) => {
    const lim = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const query = cursor ? { isDeleted: false, _id: { $gt: cursor } } : { isDeleted: false };
    const matches = await Match.find(query).sort({ _id: 1 }).limit(lim);
    const nextCursor = matches.length === lim ? matches[matches.length - 1]._id : null;
    return { matches, nextCursor };
  },

  /**
   * Infinite scroll (offset-based pagination)
   */
  getMatchesInfinite: async (skip = 0, limit = 20) => {
    return await Match.find({ isDeleted: false }).sort({ created_at: -1 }).skip(skip).limit(limit);
  },

  getHighestRated: async (filters = {}) => {
    const { page, ...dbFilters } = filters;
    const pipeline = [
      { $match: { isDeleted: false, white_rating: { $ne: '' }, black_rating: { $ne: '' }, ...dbFilters } },
      { $addFields: { maxRating: { $max: [{ $toInt: '$white_rating' }, { $toInt: '$black_rating' }] } } },
      { $sort: { maxRating: -1 } },
      { $limit: 20 },
      { $project: { id: 1, white_id: 1, black_id: 1, white_rating: 1, black_rating: 1, maxRating: 1, winner: 1, _id: 0 } }
    ];
    return await Match.aggregate(pipeline);
  },

  /**
   * Filter by winner
   */
  filterByWhiteWins: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, winner: 'white' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByBlackWins: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, winner: 'black' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByDraws: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, winner: 'draw' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  /**
   * Filter by rated status
   */
  filterByRated: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, rated: 'TRUE' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByUnrated: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, rated: 'FALSE' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  /**
   * Filter by victory status
   */
  filterByCheckmates: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, victory_status: 'mate' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByResignations: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, victory_status: 'resign' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByTimeouts: async (filters = {}) => {
    const query = { ...filters, isDeleted: false, victory_status: 'outoftime' };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  /**
   * Filter by time class (derived from increment_code)
   * Uses aggregation to compute initial seconds numerically.
   */
  filterByTimeClass: async (timeClass, filters = {}) => {
    const timeClassRanges = {
      bullet: { $lt: 180 },
      blitz: { $gte: 180, $lt: 600 },
      rapid: { $gte: 600, $lt: 1800 },
      classical: { $gte: 1800 }
    };

    const matchCond = timeClassRanges[timeClass];
    if (!matchCond) throw new Error(`Invalid time class: ${timeClass}`);

    const pipeline = [
      { $match: { isDeleted: false, increment_code: { $ne: '', $exists: true }, ...filters } },
      { $addFields: {
          initial: { $toInt: { $arrayElemAt: [{ $split: ['$increment_code', '+'] }, 0] } }
      }},
      { $match: { initial: matchCond } },
      { $sort: { created_at: -1 } },
      { $limit: 20 }
    ];

    return await Match.aggregate(pipeline);
  },

  /**
   * Filter by rating tiers
   */
  filterByHighRated: async (filters = {}) => {
    const query = {
      ...filters, isDeleted: false,
      $expr: {
        $or: [
          { $gte: [{ $toInt: '$white_rating' }, 2000] },
          { $gte: [{ $toInt: '$black_rating' }, 2000] }
        ]
      }
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  filterByLowRated: async (filters = {}) => {
    const query = {
      ...filters, isDeleted: false,
      $expr: {
        $and: [
          { $lt: [{ $toInt: '$white_rating' }, 1200] },
          { $lt: [{ $toInt: '$black_rating' }, 1200] }
        ]
      }
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  /**
   * Filter by game length (turns >= 100)
   */
  filterByLongGames: async (filters = {}) => {
    const query = {
      ...filters, isDeleted: false,
      $expr: { $gte: [{ $toInt: '$turns' }, 100] }
    };
    return await Match.find(query).sort({ created_at: -1 }).limit(20);
  },

  /**
   * Replace match (full PUT)
   */
  replaceMatch: async (matchId, updateData) => {
    const match = await Match.findOneAndReplace(
      { id: matchId, isDeleted: false },
      { ...updateData, isDeleted: false },
      { new: true, runValidators: true }
    );
    if (!match) throw new Error('Match not found');
    return match;
  },

  /**
   * Soft delete match
   */
  deleteMatch: async (matchId) => {
    const match = await Match.findOneAndUpdate(
      { id: matchId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!match) throw new Error('Match not found');
    return match;
  }
};

module.exports = matchService;
