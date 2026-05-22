const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    // --- Game Identity ---
    id: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },

    // --- Game Meta ---
    rated: {
      type: String,
      enum: ['TRUE', 'FALSE'],
      default: 'FALSE',
    },
    created_at: {
      type: String,
    },
    last_move_at: {
      type: String,
    },
    turns: {
      type: String,
    },

    // --- Result ---
    victory_status: {
      type: String,
      enum: ['mate', 'resign', 'outoftime', 'draw'],
      index: true,
    },
    winner: {
      type: String,
      enum: ['white', 'black', 'draw', ''],
      index: true,
    },

    // --- Time Control ---
    increment_code: {
      type: String,
    },

    // --- Players (FLAT) ---
    white_id: {
      type: String,
      index: true,
    },
    white_rating: {
      type: String,
    },
    black_id: {
      type: String,
      index: true,
    },
    black_rating: {
      type: String,
    },

    // --- Moves & Opening ---
    moves: {
      type: String,
    },
    opening_eco: {
      type: String,
      index: true,
    },
    opening_name: {
      type: String,
    },
    opening_ply: {
      type: String,
    },

    // --- App-level flags ---
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    collection: 'matches' // Renamed from 'moves' to 'matches'
  }
);

// Compound indexes for frequent query patterns
matchSchema.index({ winner: 1, victory_status: 1 });
matchSchema.index({ opening_eco: 1, winner: 1 });
matchSchema.index({ white_id: 1, black_id: 1 });
matchSchema.index({ rated: 1, winner: 1 });
matchSchema.index({ isDeleted: 1, isArchived: 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
