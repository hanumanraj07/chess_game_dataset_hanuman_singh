const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema(
  {
    fen: { type: String, required: true },
    solution: [{ type: String, required: true }], // Array of UCI moves (e.g., ['e2e4', 'e7e5'])
    rating: { type: Number, default: 1200 },
    themes: [{ type: String }], // 'mateIn2', 'fork', 'pin'
    plays: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Puzzle = mongoose.model('Puzzle', puzzleSchema);
module.exports = Puzzle;
