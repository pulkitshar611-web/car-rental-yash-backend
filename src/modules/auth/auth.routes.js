const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { publicApiLimiter } = require('../../middlewares/rateLimit.middleware');

const { authenticate } = require('../../middlewares/auth.middleware');

router.post('/login', publicApiLimiter, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, publicApiLimiter, authController.updateProfile);
router.post('/change-password', authenticate, publicApiLimiter, authController.changePassword);

module.exports = router;
