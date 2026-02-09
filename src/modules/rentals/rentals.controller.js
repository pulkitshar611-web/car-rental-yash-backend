const pool = require('../../config/db');
const { logAction } = require('../../utils/logger');

/**
 * Rentals Controller
 * Strictly following the defined business flow and schema.
 */

// POST /rentals (Admin + QR Flow)
const createRental = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { vehicleId, customerId, name, phone, email, startDate, endDate, totalAmount, status } = req.body;

        // 1. Validate vehicle
        const [vehicles] = await connection.execute(
            'SELECT * FROM Vehicles WHERE id = ? AND deleted_at IS NULL FOR UPDATE',
            [vehicleId]
        );
        if (vehicles.length === 0) {
            throw new Error('Vehicle not found');
        }

        // Validation: If not admin, check if available (assuming we might differentiate later)
        // For now, let's just use what's sent.

        let finalCustomerId = customerId;

        // 2. Handle Customer (Reuse or Create if name/phone provided)
        if (!finalCustomerId && phone) {
            const [existingCustomers] = await connection.execute(
                'SELECT id FROM Customers WHERE phone = ?',
                [phone]
            );

            if (existingCustomers.length > 0) {
                finalCustomerId = existingCustomers[0].id;
                await connection.execute(
                    'UPDATE Customers SET name = ?, email = ? WHERE id = ?',
                    [name, email, finalCustomerId]
                );
            } else {
                const [newCustomer] = await connection.execute(
                    'INSERT INTO Customers (name, phone, email, status) VALUES (?, ?, ?, "active")',
                    [name, phone, email]
                );
                finalCustomerId = newCustomer.insertId;
            }
        }

        if (!finalCustomerId) {
            throw new Error("Customer ID or Customer details (phone) required");
        }

        // 3. Create Rental
        const rentalStatus = status || "booking_request";
        const [rentalResult] = await connection.execute(
            'INSERT INTO Rentals (vehicleId, customerId, startDate, endDate, totalAmount, status) VALUES (?, ?, ?, ?, ?, ?)',
            [vehicleId, finalCustomerId, startDate, endDate, totalAmount, rentalStatus]
        );

        // If status is immediately set to active (Admin mode), update vehicle status
        if (rentalStatus === 'active') {
            await connection.execute('UPDATE Vehicles SET status = "rented" WHERE id = ?', [vehicleId]);
        }

        await connection.commit();
        res.status(201).json({
            message: 'Rental created successfully.',
            rentalId: rentalResult.insertId,
            customerId: finalCustomerId
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// PUT /rentals/:id (Admin Edit)
const updateRental = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { vehicleId, customerId, startDate, endDate, totalAmount, status } = req.body;

        const [oldRental] = await pool.execute('SELECT * FROM Rentals WHERE id = ?', [id]);
        if (oldRental.length === 0) return res.status(404).json({ message: 'Rental not found' });

        await pool.execute(
            'UPDATE Rentals SET vehicleId=?, customerId=?, startDate=?, endDate=?, totalAmount=?, status=? WHERE id=?',
            [vehicleId, customerId, startDate, endDate, totalAmount, status || oldRental[0].status, id]
        );

        res.json({ message: 'Rental updated successfully' });
    } catch (error) {
        next(error);
    }
};

// PUT /rentals/:id/status (Admin Update Status with logic)
const updateRentalStatus = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { status } = req.body; // active, completed, cancelled

        // Get current rental and vehicle data
        const [rentalData] = await connection.execute('SELECT * FROM Rentals WHERE id = ? FOR UPDATE', [id]);
        if (rentalData.length === 0) throw new Error('Rental not found');

        const rental = rentalData[0];
        const oldStatus = rental.status;

        // Activation Logic: booking_request -> active
        if (status === 'active') {
            // ONLY if all required documents are approved
            const [vehicles] = await connection.execute('SELECT insuranceRequired FROM Vehicles WHERE id = ?', [rental.vehicleId]);
            const insuranceRequired = vehicles[0].insuranceRequired;

            // Check Driver's License
            const [license] = await connection.execute(
                'SELECT status FROM Documents WHERE customerId = ? AND documentType = "driver_license" ORDER BY created_at DESC LIMIT 1',
                [rental.customerId]
            );

            if (!license.length || license[0].status !== 'approved') {
                throw new Error('Cannot activate rental: Driver\'s license not approved');
            }

            // Check Insurance if required
            if (insuranceRequired) {
                const [insurance] = await connection.execute(
                    'SELECT status FROM Documents WHERE customerId = ? AND documentType = "insurance" ORDER BY created_at DESC LIMIT 1',
                    [rental.customerId]
                );
                if (!insurance.length || insurance[0].status !== 'approved') {
                    throw new Error('Cannot activate rental: Insurance document not approved');
                }
            }

            // Activate: Change vehicle status to 'rented'
            await connection.execute('UPDATE Vehicles SET status = "rented" WHERE id = ?', [rental.vehicleId]);
        }

        // Completion or Cancellation logic
        if ((status === 'completed' || status === 'cancelled') && oldStatus === 'active') {
            // Vehicle status back to 'available'
            await connection.execute('UPDATE Vehicles SET status = "available" WHERE id = ?', [rental.vehicleId]);
        }

        // Update Rental Status
        await connection.execute('UPDATE Rentals SET status = ? WHERE id = ?', [status, id]);

        await logAction(req.user.id, 'UPDATE_RENTAL_STATUS', 'Rentals', id, { oldStatus }, { newStatus: status });

        await connection.commit();
        res.json({ message: `Rental status updated to ${status}` });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const getAllRentals = async (req, res, next) => {
    try {
        const [rentals] = await pool.execute(`
            SELECT r.*, v.name as vehicleName, v.model as vehicleModel, c.name as customerName 
            FROM Rentals r 
            JOIN Vehicles v ON r.vehicleId = v.id 
            JOIN Customers c ON r.customerId = c.id 
            WHERE r.deleted_at IS NULL
            ORDER BY r.created_at DESC
        `);
        res.json(rentals);
    } catch (error) {
        next(error);
    }
};

module.exports = { createRental, updateRental, updateRentalStatus, getAllRentals };
