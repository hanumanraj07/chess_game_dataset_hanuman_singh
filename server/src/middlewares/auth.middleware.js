const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes - Verifies JWT in Bearer token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return apiResponse.error(res, 'Not authorized to access this route', null, 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return apiResponse.error(res, 'User not found', null, 404);
    }

    if (req.user.isBanned) {
      return apiResponse.error(res, 'Your account has been banned', null, 403);
    }

    next();
  } catch (error) {
    return apiResponse.error(res, 'Not authorized', error.message, 401);
  }
});

module.exports = { protect };
