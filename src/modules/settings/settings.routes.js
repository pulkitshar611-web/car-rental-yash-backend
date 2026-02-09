const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.use(authenticate);

// Allow SUPER_ADMIN and MANAGER to access settings
// For update, maybe restrict to SUPER_ADMIN? For now, both can update.
router.get('/', authorize(['SUPER_ADMIN', 'MANAGER']), settingsController.getAllSettings);
router.get('/:key', authorize(['SUPER_ADMIN', 'MANAGER']), settingsController.getSettings);
router.put('/:key', authorize(['SUPER_ADMIN', 'MANAGER']), settingsController.updateSettings);

module.exports = router;
