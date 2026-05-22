const authService = require('../services/auth.service');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Auth Controller Handlers
 */
const authController = {
  // @desc    Register user
  // @route   POST /api/v1/auth/register
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    return apiResponse.success(res, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }, {}, 201);
  }),

  // @desc    Login user
  // @route   POST /api/v1/auth/login
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    return apiResponse.success(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  }),

  // @desc    Logout user
  // @route   POST /api/v1/auth/logout
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);
    return apiResponse.success(res, 'Logged out successfully');
  }),

  // @desc    Refresh Token
  // @route   POST /api/v1/auth/refresh
  refresh: asyncHandler(async (req, res) => {
    const { refreshToken: receivedToken } = req.body;
    const { accessToken, refreshToken } = await authService.refreshAccessToken(receivedToken);
    return apiResponse.success(res, 'Token refreshed successfully', { accessToken, refreshToken });
  }),

  // @desc    Forgot Password
  // @route   POST /api/v1/auth/forgot-password
  forgotPassword: asyncHandler(async (req, res) => {
    const resetToken = await authService.forgotPassword(req.body.email);
    // In production, resetToken is sent via email. 
    // Here we return it in the response for development ease.
    return apiResponse.success(res, 'Reset token generated', { resetToken });
  }),

  // @desc    Reset Password
  // @route   POST /api/v1/auth/reset-password/:token
  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.params.token, req.body.password);
    return apiResponse.success(res, 'Password reset successful');
  }),

  // @desc    Get user profile
  // @route   GET /api/v1/auth/profile
  getProfile: asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.user._id);
    return apiResponse.success(res, 'Profile fetched successfully', { profile });
  }),

  // @desc    Update user profile
  // @route   PATCH /api/v1/auth/profile
  updateProfile: asyncHandler(async (req, res) => {
    const profile = await authService.updateProfile(req.user._id, req.body);
    return apiResponse.success(res, 'Profile updated successfully', { profile });
  }),

  // @desc    Delete user profile
  // @route   DELETE /api/v1/auth/profile
  deleteProfile: asyncHandler(async (req, res) => {
    await authService.deleteProfile(req.user._id);
    return apiResponse.success(res, 'Account deleted successfully');
  })
};

module.exports = authController;
