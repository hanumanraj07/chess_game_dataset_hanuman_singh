const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./middlewares/logger.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const matchRoutes = require('./routes/match.routes');
const filterRoutes = require('./routes/filter.routes');
const playerRoutes = require('./routes/player.routes');
const openingRoutes = require('./routes/opening.routes');
const searchRoutes = require('./routes/search.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
app.use(rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/filters', filterRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/openings', openingRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stats', statsRoutes);

// Basic Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
