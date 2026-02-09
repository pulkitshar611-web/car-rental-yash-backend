const express = require('express');
const router = express.Router();
const customerController = require('./customers.controller');
const docController = require('../documents/documents.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Admin Routes
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), customerController.getAllCustomers);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), customerController.getCustomerById);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), customerController.updateCustomer);

// Requirement: GET /customers/:id/documents
router.get('/:customerId/documents', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), docController.getCustomerDocuments);

module.exports = router;
