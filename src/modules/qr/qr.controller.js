const pool = require('../../config/db');
const QRCode = require('qrcode');

const generateVehicleQR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });

        const vehicle = rows[0];
        const qrData = JSON.stringify({
            vehicleId: vehicle.id,
            name: vehicle.name,
            plateNumber: vehicle.plateNumber,
            type: 'vehicle_booking'
        });

        const qrImage = await QRCode.toDataURL(qrData);

        // Update vehicle with QR URL (base64 for now)
        await pool.execute('UPDATE vehicles SET qrCode = ? WHERE id = ?', [qrImage, id]);

        res.json({ qrData, qrImage });
    } catch (error) {
        next(error);
    }
};

const getVehicleQRImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT qrCode FROM vehicles WHERE id = ?', [id]);
        if (rows.length === 0 || !rows[0].qrCode) {
            return res.status(404).json({ message: 'QR Code not found' });
        }
        res.json({ qrCode: rows[0].qrCode });
    } catch (error) {
        next(error);
    }
};

const validateQRCode = async (req, res, next) => {
    try {
        const { qrData } = req.body;
        // Check if qrData is a JSON string or already an object
        let data;
        try {
            data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        } catch (e) {
            return res.status(400).json({ valid: false, message: 'Invalid QR data format' });
        }

        if (data && data.type === 'vehicle_booking') {
            const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [data.vehicleId]);
            if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });

            return res.json({
                valid: true,
                type: 'vehicle',
                vehicle: rows[0]
            });
        }

        res.status(400).json({ valid: false, message: 'Invalid QR type' });
    } catch (error) {
        // Log error for debugging
        console.error('QR Validation Error:', error);
        res.status(400).json({ valid: false, message: 'Invalid QR data' });
    }
};

const createQRBooking = async (req, res, next) => {
    try {
        const { vehicleId, customerId } = req.body;

        console.log(`[QR BOOKING] Vehicle: ${vehicleId}, Customer: ${customerId}`);

        // 1. Check if vehicle is available
        const [vRows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
        if (vRows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });
        if (vRows[0].status !== 'available') {
            return res.status(400).json({ message: 'Vehicle is currently not available' });
        }

        // 2. Create Rental Record
        // default dates: today to +7 days
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [rentalResult] = await pool.execute(
            `INSERT INTO rentals (
                customerId, vehicleId, startDate, endDate, rentalType, 
                weeklyAmount, totalAmount, paidAmount, remainingAmount, 
                depositAmount, status, paymentStatus, nextPaymentDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerId, vehicleId, startDate, endDate, 'weekly',
                vRows[0].weeklyPrice || 450, vRows[0].weeklyPrice || 450, 0, vRows[0].weeklyPrice || 450,
                vRows[0].deposit || 500, 'active', 'due', endDate
            ]
        );

        // 3. Update Vehicle Status
        await pool.execute('UPDATE vehicles SET status = "rented" WHERE id = ?', [vehicleId]);

        // 4. Link recently uploaded documents to this rental
        await pool.execute(
            'UPDATE documents SET rentalId = ? WHERE customerId = ? AND vehicleId = ? AND rentalId IS NULL',
            [rentalResult.insertId, customerId, vehicleId]
        );

        res.status(201).json({
            message: 'Booking request processed and rental created',
            rentalId: rentalResult.insertId,
            vehicleId,
            customerId
        });
    } catch (error) {
        console.error('[QR BOOKING ERROR]', error);
        next(error);
    }
};

module.exports = { generateVehicleQR, validateQRCode, createQRBooking, getVehicleQRImage };
