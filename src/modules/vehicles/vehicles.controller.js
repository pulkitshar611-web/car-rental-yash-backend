const pool = require('../../config/db');
const { logAction } = require('../../utils/logger');
// Assuming we might use a library for QR code generation later or just store the URL string directly.
// For now, we generate the URL string as requested: /public/qr-booking?vehicleId=ID

const getAllVehicles = async (req, res, next) => {
    try {
        const [vehicles] = await pool.execute('SELECT * FROM vehicles WHERE deleted_at IS NULL');
        res.json(vehicles);
    } catch (error) {
        next(error);
    }
};

const getVehicleById = async (req, res, next) => {
    try {
        const [vehicles] = await pool.execute(
            'SELECT * FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );
        if (vehicles.length === 0) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicles[0]);
    } catch (error) {
        next(error);
    }
};

// Admin Purpose: Create new Vehicle
const createVehicle = async (req, res, next) => {
    try {
        // New Schema: name, model, plateNumber, dailyPrice, status, insuranceRequired
        const { name, model, plateNumber, dailyPrice, status, insuranceRequired, imageUrl } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO vehicles (name, model, plateNumber, dailyPrice, status, insuranceRequired, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, model, plateNumber, dailyPrice, (status || 'AVAILABLE').toUpperCase(), insuranceRequired || 0, imageUrl || null]
        );

        const vehicleId = result.insertId;

        // Generate QR Code URL
        const qrCodeUrl = `/public/qr-booking?vehicleId=${vehicleId}`;

        await pool.execute('UPDATE vehicles SET qrCodeUrl = ? WHERE id = ?', [qrCodeUrl, vehicleId]);

        await logAction(req.user.id, 'CREATE_VEHICLE', 'vehicles', vehicleId, null, req.body);

        res.status(201).json({
            id: vehicleId,
            message: 'Vehicle created successfully',
            qrCodeUrl
        });
    } catch (error) {
        next(error);
    }
};

const updateVehicle = async (req, res, next) => {
    try {
        const { name, model, plateNumber, dailyPrice, status, insuranceRequired, imageUrl } = req.body;
        const [oldVehicle] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

        if (oldVehicle.length === 0) return res.status(404).json({ message: 'Vehicle not found' });

        await pool.execute(
            'UPDATE vehicles SET name=?, model=?, plateNumber=?, dailyPrice=?, status=?, insuranceRequired=?, imageUrl=? WHERE id=?',
            [name, model, plateNumber, dailyPrice, (status || oldVehicle[0].status).toUpperCase(), insuranceRequired, imageUrl, req.params.id]
        );

        await logAction(req.user.id, 'UPDATE_VEHICLE', 'vehicles', req.params.id, oldVehicle[0], req.body);

        res.json({ message: 'Vehicle updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    try {
        await pool.execute('UPDATE vehicles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        await logAction(req.user.id, 'DELETE_VEHICLE', 'vehicles', req.params.id);
        res.json({ message: 'Vehicle soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
