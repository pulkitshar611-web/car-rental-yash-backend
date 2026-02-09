const express = require('express');
const router = express.Router();
const auditController = require('./auditLogs.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, authorize(['SUPER_ADMIN']), auditController.getAuditLogs);
router.get('/export', authenticate, authorize(['SUPER_ADMIN', 'MANAGER']), auditController.exportRentalReport);

module.exports = router;
