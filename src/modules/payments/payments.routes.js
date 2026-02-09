const express = require('express');
const router = express.Router();
const paymentController = require('./payments.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.post('/', paymentController.processPayment); // Public/Client payment processor
router.post('/:payment_id/refund', authenticate, authorize(['SUPER_ADMIN']), paymentController.handleRefund);
router.get('/rental/:rentalId', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), paymentController.getPaymentsByRental);

module.exports = router;
