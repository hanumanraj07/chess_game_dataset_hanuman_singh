const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      minlength: 6,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    // Ecosystem Features
    ratings: {
      bullet: { current: { type: Number, default: 1200 }, peak: { type: Number, default: 1200 } },
      blitz: { current: { type: Number, default: 1200 }, peak: { type: Number, default: 1200 } },
      rapid: { current: { type: Number, default: 1200 }, peak: { type: Number, default: 1200 } },
      classical: { current: { type: Number, default: 1200 }, peak: { type: Number, default: 1200 } },
      puzzle: { current: { type: Number, default: 1200 }, peak: { type: Number, default: 1200 } },
    },
    stats: {
      totalGames: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },
    social: {
      friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    progress: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      achievements: [{ type: String }], // Array of achievement IDs
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
