const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  fenContext: { type: String }, // Optional FEN to show a board alongside the question
  explanation: { type: String }
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['Openings', 'Tactics', 'Endgames', 'Famous Games', 'History', 'Grandmasters'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    questions: [questionSchema],
    xpReward: { type: Number, default: 50 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
