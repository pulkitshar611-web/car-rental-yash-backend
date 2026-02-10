const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.get('/stats', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), dashboardController.getDashboardStats);
router.get('/revenue', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), dashboardController.getRevenueData);

module.exports = router;
