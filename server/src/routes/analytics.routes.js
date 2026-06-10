const express = require('express');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/victory-distribution', analyticsController.getVictoryDistribution);
router.get('/color-advantage', analyticsController.getColorAdvantage);
router.get('/top-games', analyticsController.getTopGames);
router.get('/turn-count-average', analyticsController.getTurnCountAverage);
router.get('/rated-vs-casual', analyticsController.getRatedVsCasual);
router.get('/time-control-usage', analyticsController.getTimeControlUsage);
router.get('/shortest-games', analyticsController.getShortestGames);
router.get('/longest-games', analyticsController.getLongestGames);
router.get('/rating-gap-upsets', analyticsController.getRatingGapUpsets);
router.get('/checkmate-frequency', analyticsController.getCheckmateFrequency);
router.get('/draw-frequency', analyticsController.getDrawFrequency);
router.get('/resignation-frequency', analyticsController.getResignationFrequency);
router.get('/timeouts', analyticsController.getTimeouts);
router.get('/opening-success', analyticsController.getOpeningSuccess);
router.get('/player-growth', analyticsController.getPlayerGrowth);
router.get('/hourly-activity', analyticsController.getHourlyActivity);
router.get('/rating-distribution', analyticsController.getRatingDistribution);
router.get('/rating-trend', analyticsController.getRatingTrend);

module.exports = router;
