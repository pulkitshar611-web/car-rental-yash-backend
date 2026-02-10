const express = require('express');
const router = express.Router();
const rentalController = require('./rentals.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes for initial fetch
router.get('/', (req, res, next) => {
    console.log('[DEBUG] GET /rentals hit (Public)');
    next();
}, rentalController.getAllRentals);

// Protected routes
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), rentalController.getRentalById);
router.post('/', rentalController.createRental);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), rentalController.updateRental);
router.put('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), rentalController.updateRentalStatus);

module.exports = router;
