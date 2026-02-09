const express = require('express');
const router = express.Router();
const vehicleController = require('./vehicles.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Admin routes
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), vehicleController.deleteVehicle);

module.exports = router;
