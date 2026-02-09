const pool = require('../../config/db');

/**
 * Customers Controller
 * Strictly following the schema: id, name, email, phone (unique), address, status (active, inactive), outstandingBalance
 */

const getAllCustomers = async (req, res, next) => {
    try {
        const [customers] = await pool.execute('SELECT id, name, phone, email, address, idNumber, status, outstandingBalance, created_at FROM customers WHERE deleted_at IS NULL');
        res.json(customers);
    } catch (error) {
        next(error);
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const [customers] = await pool.execute(
            'SELECT id, name, phone, email, address, idNumber, status, outstandingBalance, created_at FROM customers WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );
        if (customers.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(customers[0]);
    } catch (error) {
        next(error);
    }
};

const createCustomer = async (req, res, next) => {
    try {
        const { name, phone, email, address, idNumber, status, outstandingBalance } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO customers (name, phone, email, address, idNumber, status, outstandingBalance) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, phone, email || null, address || null, idNumber || null, status || 'active', outstandingBalance || 0]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            phone,
            email,
            address,
            idNumber,
            status: status || 'active',
            outstandingBalance: outstandingBalance || 0,
            message: 'Customer created successfully'
        });
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
        const { name, phone, email, address, idNumber, status, outstandingBalance } = req.body;

        await pool.execute(
            'UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, idNumber = ?, status = ?, outstandingBalance = ? WHERE id = ?',
            [name, phone, email || null, address || null, idNumber || null, status || 'active', outstandingBalance || 0, id]
        );

        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer };
