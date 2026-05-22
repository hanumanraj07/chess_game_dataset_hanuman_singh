const mongoose = require('mongoose');

const openingSchema = new mongoose.Schema(
  {
    eco: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    name: {
      type: String,
      index: true,
    },
    family: {
      type: String, // e.g. "Sicilian"
    },
    totalGames: {
      type: Number,
      default: 0,
    },
    whiteWins: {
      type: Number,
      default: 0,
    },
    blackWins: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
    winRate: {
      white: { type: Number },
      black: { type: Number },
      draw: { type: Number },
    },
    avgPly: {
      type: Number,
    },
    complexity: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    style: {
      type: String,
      enum: ['aggressive', 'defensive', 'gambit', 'balanced'],
    },
  },
  { timestamps: true }
);

const Opening = mongoose.model('Opening', openingSchema);

module.exports = Opening;
