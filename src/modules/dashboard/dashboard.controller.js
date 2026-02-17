const pool = require('../../config/db');

const getDashboardStats = async (req, res, next) => {
    try {
        const [vehicles] = await pool.execute('SELECT COUNT(*) as total, status FROM vehicles WHERE is_deleted = 0 GROUP BY status');
        const [customers] = await pool.execute('SELECT COUNT(*) as total FROM customers WHERE is_deleted = 0');
        const [rentals] = await pool.execute('SELECT COUNT(*) as total, status FROM rentals GROUP BY status');

        const stats = {
            vehicles: {
                total: vehicles.reduce((acc, curr) => acc + curr.total, 0),
                available: vehicles.find(v => v.status === 'available')?.total || 0,
                rented: vehicles.find(v => v.status === 'rented')?.total || 0,
                maintenance: vehicles.find(v => v.status === 'maintenance')?.total || 0,
            },
            customers: customers[0].total,
            activeRentals: rentals.find(r => r.status === 'active')?.total || 0,
        };

        res.json(stats);
    } catch (error) {
        next(error);
    }
};

const getRevenueData = async (req, res, next) => {
    try {
        const { period } = req.query; // weekly, monthly, yearly
        let query = 'SELECT SUM(totalAmount) as total, DATE_FORMAT(created_at, "%Y-%m-%d") as date FROM rentals WHERE status != "cancelled" GROUP BY date';

        // Simple implementation for now
        const [revenue] = await pool.execute(query);

        res.json(revenue);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getRevenueData
};
