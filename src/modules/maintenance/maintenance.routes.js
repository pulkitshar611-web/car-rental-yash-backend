const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), maintenanceController.getAllMaintenance);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), maintenanceController.getMaintenanceById);
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), maintenanceController.createMaintenance);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), maintenanceController.updateMaintenance);

module.exports = router;
