const express = require('express');
const router = express.Router();
const docController = require('./documents.controller');
const upload = require('../../middlewares/upload.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes (for frontend to fetch data and upload)
router.get('/', docController.getAllDocuments);
router.get('/customer/:customerId', docController.getCustomerDocuments);
router.post('/upload', upload.single('document'), docController.uploadDocument);
router.post('/upload-general', upload.single('file'), docController.uploadGeneralFile);
router.put('/:id', upload.single('document'), docController.updateDocumentData);

// Admin routes (protected)
router.put('/:id/verify', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), docController.verifyDocument);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), docController.deleteDocument);

module.exports = router;
