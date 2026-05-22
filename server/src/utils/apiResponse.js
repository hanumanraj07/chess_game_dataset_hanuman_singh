/**
 * Standardized API Response formats
 */

const apiResponse = {
  // Success response
  success: (res, message, data = {}, meta = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta
    });
  },

  // Error response
  error: (res, message, error = null, statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || message,
      code: statusCode
    });
  }
};

module.exports = apiResponse;
