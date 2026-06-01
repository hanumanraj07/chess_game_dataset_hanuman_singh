const express = require('express');
const mongoose = require('mongoose');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Opening = require('../models/Opening');
const { protect, authorize } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const sendOptions = (methods) => (req, res) => {
  const allow = [...new Set([...methods, 'OPTIONS'])].join(', ');
  res.set('Allow', allow);
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', allow);
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(204).end();
};

const headOk = (req, res) => res.status(200).end();

const requireDb = (res) => {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).end();
  return false;
};

const headExists = (model, buildQuery) => asyncHandler(async (req, res) => {
  if (!requireDb(res)) return;

  const exists = await model.exists(buildQuery(req));
  return res.status(exists ? 200 : 404).end();
});

const matchExists = headExists(Match, (req) => ({
  id: req.params.matchId,
  isDeleted: false,
}));

const playerExists = headExists(Player, (req) => ({
  username: req.params.username,
}));

const openingExists = headExists(Opening, (req) => ({
  eco: req.params.ecoCode.toUpperCase(),
}));

// OPTIONS routes
router.options('/matches', sendOptions(['GET', 'POST', 'HEAD']));
router.options('/matches/:matchId', sendOptions(['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD']));
router.options('/matches/:matchId/moves', sendOptions(['GET']));
router.options('/matches/:matchId/pgn', sendOptions(['GET', 'HEAD']));
router.options('/matches/:matchId/analysis', sendOptions(['GET', 'HEAD']));
router.options('/players', sendOptions(['GET', 'HEAD']));
router.options('/players/:username', sendOptions(['GET', 'HEAD']));
router.options('/openings', sendOptions(['GET', 'HEAD']));
router.options('/openings/eco/:ecoCode', sendOptions(['GET', 'HEAD']));
router.options('/search/matches', sendOptions(['GET', 'HEAD']));
router.options('/search/players', sendOptions(['GET', 'HEAD']));
router.options('/search/openings', sendOptions(['GET']));
router.options('/search/advanced', sendOptions(['GET']));
router.options('/matches/filter/blitz', sendOptions(['GET', 'HEAD']));
router.options('/matches/filter/checkmates', sendOptions(['GET', 'HEAD']));
router.options('/analytics/victory-distribution', sendOptions(['GET', 'HEAD']));
router.options('/stats/total-matches', sendOptions(['GET', 'HEAD']));
router.options('/auth/login', sendOptions(['POST']));
router.options('/auth/register', sendOptions(['POST']));
router.options('/auth/profile', sendOptions(['GET', 'PATCH', 'DELETE', 'HEAD']));
router.options('/admin/users', sendOptions(['GET']));
router.options('/admin/system/health', sendOptions(['GET', 'HEAD']));
router.options('/system/status', sendOptions(['GET', 'HEAD']));
router.options('/system/restart', sendOptions(['POST']));
router.options('/protected/matches', sendOptions(['GET', 'POST', 'HEAD']));
router.options('/middleware/rate-limit', sendOptions(['GET']));
router.options('/system/database/status', sendOptions(['GET', 'HEAD']));
router.options('/system/cache/status', sendOptions(['GET']));
router.options('/matches/bulk-upload', sendOptions(['POST']));
router.options('/matches/bulk-delete', sendOptions(['DELETE']));

// HEAD routes
router.head('/matches', headOk);
router.head('/matches/latest', headOk);
router.head('/matches/trending', headOk);
router.head('/matches/:matchId', matchExists);
router.head('/matches/:matchId/pgn', matchExists);
router.head('/matches/:matchId/fen', matchExists);
router.head('/matches/:matchId/analysis', matchExists);
router.head('/players', headOk);
router.head('/players/:username', playerExists);
router.head('/players/:username/stats', playerExists);
router.head('/openings', headOk);
router.head('/openings/eco/:ecoCode', openingExists);
router.head('/search/matches', headOk);
router.head('/search/players', headOk);
router.head('/analytics/victory-distribution', headOk);
router.head('/stats/total-matches', headOk);
router.head('/system/status', headOk);
router.head('/system/database/status', headOk);
router.head('/admin/system/health', protect, authorize('admin'), headOk);
router.head('/protected/matches', protect, headOk);
router.head('/auth/profile', protect, headOk);
router.head('/matches/filter/blitz', headOk);
router.head('/matches/filter/checkmates', headOk);
router.head('/openings/popular', headOk);
router.head('/search/autocomplete', headOk);

module.exports = router;
