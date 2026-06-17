const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const User = require('../models/User');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

const issueAuthTokens = async (user) => {
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

/**
 * Auth Service Logic
 */
const authService = {
  register: async (userData) => {
    const user = await User.create(userData);
    return issueAuthTokens(user);
  },

  login: async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (user.isBanned) {
      throw new Error('Your account has been banned');
    }

    return issueAuthTokens(user);
  },

  googleLogin: async (credential) => {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error('Google login is not configured');
    }

    if (!credential) {
      throw new Error('Google credential is required');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      throw new Error('Invalid Google account response');
    }

    if (!payload.email_verified) {
      throw new Error('Google account email is not verified');
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (user?.isBanned) {
      throw new Error('Your account has been banned');
    }

    if (user?.googleId && user.googleId !== payload.sub) {
      throw new Error('This email is linked to a different Google account');
    }

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        authProvider: 'google',
        googleId: payload.sub,
        emailVerified: true,
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.emailVerified = true;
      if (!user.name && payload.name) user.name = payload.name;
      await user.save();
    }

    return issueAuthTokens(user);
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
