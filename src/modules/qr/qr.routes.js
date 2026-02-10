const express = require('express');
const router = express.Router();
const qrController = require('./qr.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes
router.post('/validate', qrController.validateQRCode);
router.post('/booking', qrController.createQRBooking);

// Admin routes - Generate QR for vehicle
router.get('/vehicle/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), qrController.generateVehicleQR);
router.get('/vehicle/:id/image', qrController.getVehicleQRImage); // Public - for displaying QR

module.exports = router;
