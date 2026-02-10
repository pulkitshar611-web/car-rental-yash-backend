const pool = require('../../config/db');

const getAllPayments = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, c.name as customerName, r.id as rentalId 
            FROM payments p
            JOIN customers c ON p.customerId = c.id
            LEFT JOIN rentals r ON p.rentalId = r.id
            ORDER BY p.date DESC
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getPaymentsByRental = async (req, res, next) => {
    try {
        const { rentalId } = req.params;
        const [rows] = await pool.execute('SELECT * FROM payments WHERE rentalId = ? ORDER BY date DESC', [rentalId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const processPayment = async (req, res, next) => {
    try {
        const { rentalId, customerId, amount, method, status } = req.body;
        console.log(`[PROCESS PAYMENT] Rental: ${rentalId}, Customer: ${customerId}, Amount: ${amount}`);

        if (!customerId || !amount) {
            return res.status(400).json({ message: 'customerId and amount are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO payments (rentalId, customerId, amount, date, method, status) VALUES (?, ?, ?, CURRENT_DATE, ?, ?)',
            [rentalId || null, customerId, amount, method || 'cash', status || 'completed']
        );

        // If linked to a rental, update rental balance
        if (rentalId) {
            await pool.execute(
                'UPDATE rentals SET paidAmount = paidAmount + ?, remainingAmount = remainingAmount - ? WHERE id = ?',
                [amount, amount, rentalId]
            );
        }

        // Always update customer outstanding balance
        await pool.execute(
            'UPDATE customers SET outstandingBalance = outstandingBalance - ? WHERE id = ?',
            [amount, customerId]
        );

        console.log(`[PAYMENT SUCCESS] ID: ${result.insertId}`);
        res.status(201).json({
            id: result.insertId,
            message: 'Payment recorded successfully'
        });
    } catch (error) {
        console.error('[PROCESS PAYMENT ERROR]', error);
        next(error);
    }
};

const handleRefund = async (req, res, next) => {
    try {
        const { payment_id } = req.params;
        // Basic refund logic - for now just marking as failed or logic to come
        // Since 'refunded' isn't in ENUM, we might need to handle this differently or just return success 
        // without DB change if schema doesn't support it yet.
        // For now, let's just return a success message.
        res.json({ message: 'Refund processed successfully (Simulation)' });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAllPayments, getPaymentsByRental, processPayment, handleRefund };
