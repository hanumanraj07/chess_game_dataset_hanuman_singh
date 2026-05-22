const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    currentRating: {
      type: Number,
      index: true,
    },
    ratingHistory: [
      {
        date: { type: Date },
        rating: { type: Number },
      },
    ],
    totalGames: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
    preferredOpenings: [
      {
        type: String,
      },
    ],
    lastSeen: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for performance
playerSchema.index({ currentRating: -1 });
playerSchema.index({ totalGames: -1 });
playerSchema.index({ wins: -1 });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
