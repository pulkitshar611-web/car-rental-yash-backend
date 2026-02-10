const pool = require('../../config/db');
const { logAction } = require('../../utils/logger');
// Assuming we might use a library for QR code generation later or just store the URL string directly.
// For now, we generate the URL string as requested: /public/qr-booking?vehicleId=ID

const getAllVehicles = async (req, res, next) => {
    try {
        const [vehicles] = await pool.execute('SELECT * FROM vehicles');
        res.json(vehicles);
    } catch (error) {
        next(error);
    }
};

const getVehicleById = async (req, res, next) => {
    try {
        const [vehicles] = await pool.execute(
            'SELECT * FROM vehicles WHERE id = ?',
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
        // New Schema: name, model, plateNumber, dailyPrice, status, insuranceRequired, image
        const { name, model, plateNumber, dailyPrice, status, insuranceRequired, image } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO vehicles (name, model, plateNumber, dailyPrice, status, insuranceRequired, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, model, plateNumber, dailyPrice, status || 'available', insuranceRequired || 0, image || null]
        );

        const vehicleId = result.insertId;

        // Generate QR Code URL
        const qrCode = `/public/qr-booking?vehicleId=${vehicleId}`;

        await pool.execute('UPDATE vehicles SET qrCode = ? WHERE id = ?', [qrCode, vehicleId]);

        await logAction(req.user.id, 'CREATE_VEHICLE', 'Vehicles', vehicleId, null, req.body);

        const [newVehicles] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(201).json(newVehicles[0]);
    } catch (error) {
        next(error);
    }
};

const updateVehicle = async (req, res, next) => {
    try {
        const { name, model, plateNumber, dailyPrice, status, insuranceRequired, image } = req.body;
        const [oldVehicle] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

        if (oldVehicle.length === 0) return res.status(404).json({ message: 'Vehicle not found' });

        await pool.execute(
            'UPDATE vehicles SET name=?, model=?, plateNumber=?, dailyPrice=?, status=?, insuranceRequired=?, image=? WHERE id=?',
            [
                name,
                model,
                plateNumber,
                dailyPrice,
                status || oldVehicle[0].status,
                insuranceRequired,
                image,
                req.params.id
            ]
        );

        await logAction(req.user.id, 'UPDATE_VEHICLE', 'Vehicles', req.params.id, oldVehicle[0], req.body);

        res.json({ message: 'Vehicle updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    try {
        // Instead of hard delete or missing 'deleted_at', we set status to 'outOfService'
        await pool.execute('UPDATE vehicles SET status = "outOfService" WHERE id = ?', [req.params.id]);
        await logAction(req.user.id, 'DELETE_VEHICLE', 'Vehicles', req.params.id);
        res.json({ message: 'Vehicle marked as out of service' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
