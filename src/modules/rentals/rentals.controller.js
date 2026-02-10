const pool = require('../../config/db');

/**
 * Rentals Controller
 * Schema matches frontend expectations for rental details and status.
 */

const getAllRentals = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT r.*, c.name as customerName, v.name as vehicleName, v.plateNumber 
            FROM rentals r
            JOIN customers c ON r.customerId = c.id
            JOIN vehicles v ON r.vehicleId = v.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getRentalById = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT r.*, c.name as customerName, v.name as vehicleName, v.plateNumber 
            FROM rentals r
            JOIN customers c ON r.customerId = c.id
            JOIN vehicles v ON r.vehicleId = v.id
            WHERE r.id = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Rental not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

const createRental = async (req, res, next) => {
    try {
        const {
            customerId, vehicleId, startDate, endDate, rentalType,
            weeklyAmount, monthlyAmount, depositAmount, totalAmount,
            paidAmount, remainingAmount, nextPaymentDate, status,
            paymentStatus, agreementSigned, qrCode
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO rentals (
                customerId, vehicleId, startDate, endDate, rentalType, 
                weeklyAmount, monthlyAmount, depositAmount, totalAmount, 
                paidAmount, remainingAmount, nextPaymentDate, status, 
                paymentStatus, agreementSigned, qrCode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerId, vehicleId, startDate, endDate, rentalType,
                weeklyAmount || null, monthlyAmount || null, depositAmount || 0,
                totalAmount, paidAmount || 0, remainingAmount || totalAmount,
                nextPaymentDate || null, status || 'active',
                paymentStatus || 'due', agreementSigned ? 1 : 0, qrCode || null
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Rental created successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updateRentalStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        await pool.execute(
            'UPDATE rentals SET status = COALESCE(?, status), paymentStatus = COALESCE(?, paymentStatus) WHERE id = ?',
            [status, paymentStatus, id]
        );

        res.json({ message: 'Rental status updated successfully' });
    } catch (error) {
        next(error);
    }
};

const updateRental = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            vehicleId, startDate, endDate, rentalType,
            weeklyAmount, monthlyAmount, depositAmount, totalAmount,
            paidAmount, remainingAmount, nextPaymentDate, status,
            paymentStatus, agreementSigned
        } = req.body;

        await pool.execute(
            `UPDATE rentals SET 
                vehicleId = COALESCE(?, vehicleId),
                startDate = COALESCE(?, startDate),
                endDate = COALESCE(?, endDate),
                rentalType = COALESCE(?, rentalType),
                weeklyAmount = COALESCE(?, weeklyAmount),
                monthlyAmount = COALESCE(?, monthlyAmount),
                depositAmount = COALESCE(?, depositAmount),
                totalAmount = COALESCE(?, totalAmount),
                paidAmount = COALESCE(?, paidAmount),
                remainingAmount = COALESCE(?, remainingAmount),
                nextPaymentDate = COALESCE(?, nextPaymentDate),
                status = COALESCE(?, status),
                paymentStatus = COALESCE(?, paymentStatus),
                agreementSigned = COALESCE(?, agreementSigned)
            WHERE id = ?`,
            [
                vehicleId, startDate, endDate, rentalType,
                weeklyAmount, monthlyAmount, depositAmount, totalAmount,
                paidAmount, remainingAmount, nextPaymentDate, status,
                paymentStatus, agreementSigned, id
            ]
        );

        res.json({ message: 'Rental updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllRentals, getRentalById, createRental, updateRentalStatus, updateRental };
