const pool = require('../../config/db');

const processPayment = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { rental_id, amount, payment_type, payment_method, transaction_id, idempotency_key } = req.body;

        // Idempotency check
        const [existing] = await connection.execute('SELECT id FROM payments WHERE idempotency_key = ?', [idempotency_key]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Duplicate payment request' });
        }

        // Insert Payment
        const [result] = await connection.execute(
            'INSERT INTO payments (rental_id, amount, payment_type, payment_method, status, transaction_id, idempotency_key) VALUES (?, ?, ?, ?, "SUCCESS", ?, ?)',
            [rental_id, amount, payment_type, payment_method, transaction_id, idempotency_key]
        );

        // Update Rental Status if Deposit/Rental Fee is paid
        if (payment_type === 'RENTAL_FEE' || payment_type === 'DEPOSIT') {
            const [rental] = await connection.execute('SELECT status FROM rentals WHERE id = ? FOR UPDATE', [rental_id]);
            if (rental.length > 0 && rental[0].status === 'VERIFIED') {
                await connection.execute('UPDATE rentals SET status = "PAID" WHERE id = ?', [rental_id]);
            }
        }

        await connection.commit();
        res.status(201).json({ id: result.insertId, message: 'Payment processed successfully' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const handleRefund = async (req, res, next) => {
    try {
        const { payment_id } = req.params;
        const [payment] = await pool.execute('SELECT * FROM payments WHERE id = ?', [payment_id]);

        if (payment.length === 0) return res.status(404).json({ message: 'Payment not found' });

        await pool.execute('UPDATE payments SET status = "REFUNDED" WHERE id = ?', [payment_id]);

        // Create new Payment entry for refund record
        await pool.execute(
            'INSERT INTO payments (rental_id, amount, payment_type, payment_method, status) VALUES (?, ?, "REFUND", ?, "SUCCESS")',
            [payment[0].rental_id, payment[0].amount, payment[0].payment_method]
        );

        res.json({ message: 'Refund processed successfully' });
    } catch (error) {
        next(error);
    }
};

const getPaymentsByRental = async (req, res, next) => {
    try {
        const [payments] = await pool.execute('SELECT * FROM payments WHERE rental_id = ?', [req.params.rentalId]);
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

module.exports = { processPayment, handleRefund, getPaymentsByRental };
