const express = require('express');
const router = express.Router();
const docController = require('./documents.controller');
const upload = require('../../middlewares/upload.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public upload (part of booking flow)
router.post('/upload', upload.single('document'), docController.uploadDocument);

// Admin routes
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), docController.getAllDocuments);
router.put('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), docController.verifyDocument);
router.get('/customer/:customerId', authenticate, authorize(['SUPER_ADMIN', 'MANAGER', 'STAFF']), docController.getCustomerDocuments);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), docController.deleteDocument);

module.exports = router;
