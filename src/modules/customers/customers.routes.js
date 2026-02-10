const express = require('express');
const router = express.Router();
const customerController = require('./customers.controller');
const docController = require('../documents/documents.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public Routes (for frontend to fetch data)
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

// Admin Routes (protected)
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), customerController.createCustomer);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), customerController.updateCustomer);

// Customer documents
router.get('/:customerId/documents', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), docController.getCustomerDocuments);

module.exports = router;
