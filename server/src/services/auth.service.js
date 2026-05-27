const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Generate Access Token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Auth Service Logic
 */
const authService = {
  register: async (userData) => {
    const user = await User.create(userData);
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  },

  login: async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (user.isBanned) {
      throw new Error('Your account has been banned');
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  },

  logout: async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },

  refreshAccessToken: async (receivedRefreshToken) => {
    if (!receivedRefreshToken) throw new Error('Refresh token is required');

    const decoded = jwt.verify(receivedRefreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== receivedRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  },

  forgotPassword: async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();
    return resetToken; // In prod, send this via email
  },

  resetPassword: async (token, newPassword) => {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) throw new Error('Invalid or expired reset token');

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
  },

  verifyEmail: async (email) => {
    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) throw new Error('User not found');
    return user;
  },

  getProfile: async (userId) => {
    return await User.findById(userId).select('-password -refreshToken');
  },

  updateProfile: async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');
  },

  deleteProfile: async (userId) => {
    return await User.findByIdAndDelete(userId);
  }
};

module.exports = authService;
