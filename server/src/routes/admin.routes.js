const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getLogs);
router.get('/system/health', adminController.getSystemHealth);
router.delete('/cache/clear', adminController.clearCache);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.get('/protected/dashboard', adminController.getDashboard);

module.exports = router;
