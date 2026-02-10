const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const vehicleRoutes = require('../modules/vehicles/vehicles.routes');
const customerRoutes = require('../modules/customers/customers.routes');
const rentalRoutes = require('../modules/rentals/rentals.routes');
const documentRoutes = require('../modules/documents/documents.routes');
const paymentRoutes = require('../modules/payments/payments.routes');
const auditRoutes = require('../modules/auditLogs/auditLogs.routes');
const settingsRoutes = require('../modules/settings/settings.routes');
const maintenanceRoutes = require('../modules/maintenance/maintenance.routes');
const qrRoutes = require('../modules/qr/qr.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/customers', customerRoutes);
router.use('/rentals', rentalRoutes);
router.use('/documents', documentRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', auditRoutes);
router.use('/settings', settingsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/qr', qrRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
