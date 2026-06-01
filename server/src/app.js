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
const adminRoutes = require('./routes/admin.routes');
const middlewareRoutes = require('./routes/middleware.routes');
const protectedRoutes = require('./routes/protected.routes');
const systemRoutes = require('./routes/system.routes');
const metaRoutes = require('./routes/meta.routes');
const systemController = require('./controllers/system.controller');

const app = express();

// Explicit HEAD/OPTIONS metadata routes are mounted before CORS preflight handling.
app.use('/api/v1', metaRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
app.use(rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/matches/filter', filterRoutes);
app.use('/api/v1/filters', filterRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/openings', openingRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/middleware', middlewareRoutes);
app.use('/api/v1/protected', protectedRoutes);
app.use('/api/v1/system', systemRoutes);

app.get('/api/v1/health', systemController.getHealth);

// Basic Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
