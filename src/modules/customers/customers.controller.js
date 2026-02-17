const pool = require('../../config/db');

/**
 * Customers Controller
 * Schema: id, name, phone, email, idNumber, address, insurance, depositPaid, paymentMethod, outstandingBalance, rentalType
 */

const getAllCustomers = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers WHERE is_deleted = 0 ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ? AND is_deleted = 0', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

const createCustomer = async (req, res, next) => {
    try {
        const { name, phone, email, idNumber, address, insurance, depositPaid, paymentMethod, outstandingBalance, rentalType } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO customers (name, phone, email, idNumber, address, insurance, depositPaid, paymentMethod, outstandingBalance, rentalType, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
            [name, phone, email || null, idNumber || null, address || null, insurance ? 1 : 0, depositPaid ? 1 : 0, paymentMethod || 'cash', outstandingBalance || 0, rentalType || 'weekly']
        );

        const [newCustomers] = await pool.execute('SELECT * FROM customers WHERE id = ?', [result.insertId]);

        res.status(201).json(newCustomers[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        next(error);
    }
};

const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log('--------------------------------------------------');
        console.log(`[UPDATE CUSTOMER] ID: ${id}`);
        console.log('[BODY]', JSON.stringify(req.body, null, 2));

        const allowedFields = ['name', 'phone', 'email', 'idNumber', 'address', 'insurance', 'depositPaid', 'paymentMethod', 'outstandingBalance', 'rentalType'];
        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                if (field === 'insurance' || field === 'depositPaid') {
                    params.push(req.body[field] ? 1 : 0);
                } else if (field === 'outstandingBalance') {
                    params.push(parseFloat(req.body[field]) || 0);
                } else {
                    params.push(req.body[field]);
                }
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(id);

        const query = `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`;

        console.log('[SQL QUERY]', query);
        console.log('[SQL PARAMS]', params);

        await pool.execute(query, params);

        console.log(`[UPDATE SUCCESS] Customer ${id} updated.`);
        console.log('--------------------------------------------------');

        // Fetch updated customer to return
        const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('[UPDATE CUSTOMER ERROR]', error.message);
        console.error('[ERROR STACK]', error.stack);
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        next(error);
    }
};

const deleteCustomer = async (req, res, next) => {
    try {
        await pool.execute('UPDATE customers SET is_deleted = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
