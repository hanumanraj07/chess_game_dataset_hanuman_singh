const express = require('express');
const middlewareController = require('../controllers/middleware.controller');

const router = express.Router();

router.get('/logger', middlewareController.logger);
router.get('/auth', middlewareController.auth);
router.get('/rate-limit', middlewareController.rateLimit);
router.get('/error-handler', middlewareController.errorHandler);

module.exports = router;
