const express = require('express');
const router = express.Router();
const rentalController = require('./rentals.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public/Admin Creation
router.post('/', rentalController.createRental);

// Admin Routes
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), rentalController.getAllRentals);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), rentalController.updateRental);
router.put('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), rentalController.updateRentalStatus);

module.exports = router;
