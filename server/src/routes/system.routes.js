const express = require('express');
const systemController = require('../controllers/system.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
const adminOnly = [protect, authorize('admin')];

router.get('/info', systemController.getInfo);
router.get('/logs', protect, systemController.getLogs);
router.get('/version', systemController.getVersion);
router.get('/status', systemController.getStatus);
router.get('/uptime', systemController.getUptime);
router.get('/database/status', systemController.getDatabaseStatus);
router.get('/cache/status', systemController.getCacheStatus);
router.post('/recalculate-stats', adminOnly, systemController.recalculateStats);
router.post('/reindex', adminOnly, systemController.reindex);
router.post('/restart', adminOnly, systemController.restart);
router.get('/config', systemController.getConfig);
router.get('/security/events', adminOnly, systemController.getSecurityEvents);
router.get('/performance', protect, systemController.getPerformance);
router.get('/storage', protect, systemController.getStorage);

module.exports = router;
