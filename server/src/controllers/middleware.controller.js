const apiResponse = require('../utils/apiResponse');

const middlewareController = {
  logger: (req, res) => apiResponse.success(res, 'Logger middleware is enabled', {
    middleware: { name: 'logger', enabled: true }
  }),

  auth: (req, res) => apiResponse.success(res, 'Authentication middleware is enabled', {
    middleware: { name: 'auth', enabled: true, strategy: 'JWT Bearer token' }
  }),

  rateLimit: (req, res) => apiResponse.success(res, 'Rate limiting middleware is enabled', {
    middleware: { name: 'rate-limit', enabled: true }
  }),

  errorHandler: (req, res) => apiResponse.success(res, 'Error handler middleware is enabled', {
    middleware: { name: 'error-handler', enabled: true }
  })
};

module.exports = middlewareController;
