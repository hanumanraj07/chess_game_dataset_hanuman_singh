const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g., 'first_win', 'puzzle_master'
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Trophy' }, // Lucide icon name
    xpReward: { type: Number, default: 100 },
    conditionType: { type: String, enum: ['wins', 'puzzles', 'quizzes', 'streak', 'rating'], required: true },
    conditionTarget: { type: Number, required: true } // e.g., 100 wins
  },
  { timestamps: true }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;
