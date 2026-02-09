const pool = require('../../config/db');

const getAllMaintenance = async (req, res, next) => {
    try {
        const [records] = await pool.execute(`
            SELECT m.*, v.name as vehicleName, v.plateNumber 
            FROM Maintenance m
            JOIN Vehicles v ON m.vehicleId = v.id
            WHERE m.deleted_at IS NULL
            ORDER BY m.serviceDate DESC
        `);
        res.json(records);
    } catch (error) {
        next(error);
    }
};

const getMaintenanceById = async (req, res, next) => {
    try {
        const [records] = await pool.execute(
            'SELECT * FROM Maintenance WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );
        if (records.length === 0) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json(records[0]);
    } catch (error) {
        next(error);
    }
};

const createMaintenance = async (req, res, next) => {
    try {
        const { vehicleId, reason, description, cost, status } = req.body;

        // Insert Maintenance Record
        const [result] = await pool.execute(
            'INSERT INTO Maintenance (vehicleId, reason, description, cost, status) VALUES (?, ?, ?, ?, ?)',
            [vehicleId, reason, description, cost, status || 'in_progress']
        );

        // Update Vehicle Status
        if (status !== 'completed') {
            await pool.execute('UPDATE Vehicles SET status = ? WHERE id = ?', ['MAINTENANCE', vehicleId]);
        } else {
            await pool.execute('UPDATE Vehicles SET status = ? WHERE id = ?', ['AVAILABLE', vehicleId]);
        }

        res.status(201).json({
            id: result.insertId,
            message: 'Maintenance record created successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updateMaintenance = async (req, res, next) => {
    try {
        const { vehicleId, reason, description, cost, status } = req.body;

        await pool.execute(
            'UPDATE Maintenance SET vehicleId=?, reason=?, description=?, cost=?, status=? WHERE id=?',
            [vehicleId, reason, description, cost, status, req.params.id]
        );

        // Update Vehicle Status based on maintenance status
        if (status === 'completed') {
            await pool.execute('UPDATE Vehicles SET status = ? WHERE id = ?', ['AVAILABLE', vehicleId]);
        } else {
            await pool.execute('UPDATE Vehicles SET status = ? WHERE id = ?', ['MAINTENANCE', vehicleId]);
        }

        res.json({ message: 'Maintenance record updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteMaintenance = async (req, res, next) => {
    try {
        await pool.execute('UPDATE Maintenance SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance };
