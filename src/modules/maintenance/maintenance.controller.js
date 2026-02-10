const pool = require('../../config/db');

const getAllMaintenance = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT m.*, v.name as vehicleName, v.plateNumber 
            FROM maintenance m
            JOIN vehicles v ON m.vehicleId = v.id
            ORDER BY m.serviceDate DESC
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getVehicleMaintenance = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const [rows] = await pool.execute('SELECT * FROM maintenance WHERE vehicleId = ? ORDER BY serviceDate DESC', [vehicleId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const createMaintenance = async (req, res, next) => {
    try {
        const { vehicleId, serviceDate, reason, description, expectedReturnDate, cost, status } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO maintenance (vehicleId, serviceDate, reason, description, expectedReturnDate, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [vehicleId, serviceDate || new Date().toISOString().split('T')[0], reason || 'repair', description, expectedReturnDate || null, cost || 0, status || 'scheduled']
        );

        // Update vehicle status
        if (status !== 'completed') {
            await pool.execute('UPDATE vehicles SET status = "maintenance" WHERE id = ?', [vehicleId]);
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
        const { id } = req.params;
        const { status, cost, description, reason, serviceDate, expectedReturnDate, vehicleId } = req.body;

        await pool.execute(
            `UPDATE maintenance SET 
                status = COALESCE(?, status), 
                cost = COALESCE(?, cost), 
                description = COALESCE(?, description),
                reason = COALESCE(?, reason),
                serviceDate = COALESCE(?, serviceDate),
                expectedReturnDate = COALESCE(?, expectedReturnDate)
             WHERE id = ?`,
            [status, cost, description, reason, serviceDate, expectedReturnDate, id]
        );

        // If status changed to completed, update vehicle status back to available
        if (status === 'completed' && vehicleId) {
            await pool.execute('UPDATE vehicles SET status = "available" WHERE id = ?', [vehicleId]);
        } else if (status !== 'completed' && vehicleId) {
            await pool.execute('UPDATE vehicles SET status = "maintenance" WHERE id = ?', [vehicleId]);
        }

        res.json({ message: 'Maintenance record updated successfully' });
    } catch (error) {
        next(error);
    }
};

const getMaintenanceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT m.*, v.name as vehicleName, v.plateNumber 
            FROM maintenance m
            JOIN vehicles v ON m.vehicleId = v.id
            WHERE m.id = ?
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllMaintenance, getVehicleMaintenance, getMaintenanceById, createMaintenance, updateMaintenance };
