const pool = require('../../config/db');

const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Basic Counts
        const [[{ totalVehicles }]] = await pool.execute('SELECT COUNT(*) as totalVehicles FROM vehicles');
        const [[{ activeRentals }]] = await pool.execute('SELECT COUNT(*) as activeRentals FROM rentals WHERE status = "active"');
        const [[{ totalCustomers }]] = await pool.execute('SELECT COUNT(*) as totalCustomers FROM customers');

        // 2. Financials
        const [[{ totalRevenue }]] = await pool.execute('SELECT SUM(paidAmount) as totalRevenue FROM rentals');
        const [[{ totalRentals }]] = await pool.execute('SELECT COUNT(*) as totalRentals FROM rentals');
        const [[{ pendingDues }]] = await pool.execute('SELECT SUM(totalAmount - paidAmount) as pendingDues FROM rentals WHERE paymentStatus != "paid"');

        // New: Granular Revenue Stats
        const [[{ todayRevenue }]] = await pool.execute(`
            SELECT SUM(amount) as todayRevenue FROM payments 
            WHERE date = CURRENT_DATE AND status = 'completed'
        `);

        const [[{ weeklyRevenue }]] = await pool.execute(`
            SELECT SUM(amount) as weeklyRevenue FROM payments 
            WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) AND status = 'completed'
        `);

        const [[{ monthlyRevenue }]] = await pool.execute(`
            SELECT SUM(amount) as monthlyRevenue FROM payments 
            WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) AND status = 'completed'
        `);

        res.json({
            stats: {
                vehicles: totalVehicles,
                rentals: activeRentals, // Active
                totalRentalsCount: totalRentals, // All time
                customers: totalCustomers,
                revenue: parseFloat(totalRevenue) || 0,
                todayRevenue: parseFloat(todayRevenue) || 0,
                weeklyRevenue: parseFloat(weeklyRevenue) || 0,
                monthlyRevenue: parseFloat(monthlyRevenue) || 0,
                pendingDues: parseFloat(pendingDues) || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

const getRevenueData = async (req, res, next) => {
    try {
        // 1. Weekly Data (Last 7 Days)
        // Group by Date, returning Day Name (Mon, Tue) and Revenue
        const [daily] = await pool.execute(`
            SELECT DATE_FORMAT(startDate, '%a') as day, SUM(totalAmount) as revenue, DATE(startDate) as date
            FROM rentals 
            WHERE startDate >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY date, day
            ORDER BY date ASC
        `);

        // 2. Monthly Data (Last 6 Months)
        const [monthly] = await pool.execute(`
            SELECT DATE_FORMAT(startDate, '%b') as month, SUM(totalAmount) as revenue, MIN(startDate) as sortDate
            FROM rentals 
            WHERE startDate >= DATE(NOW()) - INTERVAL 6 MONTH
            GROUP BY DATE_FORMAT(startDate, '%Y-%m'), month
            ORDER BY sortDate ASC
        `);

        // 3. Top Performing Vehicles
        const [topVehicles] = await pool.execute(`
            SELECT v.name, v.model, COUNT(r.id) as rentalCount, SUM(r.totalAmount) as revenue
            FROM rentals r
            JOIN vehicles v ON r.vehicleId = v.id
            GROUP BY v.id, v. name, v.model
            ORDER BY revenue DESC
            LIMIT 5
        `);

        // 4. Recent Rentals List (for report table)
        const [recentRentals] = await pool.execute(`
            SELECT r.id, c.name as customerName, v.name as vehicleName, v.model as vehicleModel, 
                   r.startDate, r.endDate, r.totalAmount, r.status, r.paymentStatus
            FROM rentals r
            LEFT JOIN customers c ON r.customerId = c.id
            LEFT JOIN vehicles v ON r.vehicleId = v.id
            ORDER BY r.created_at DESC
            LIMIT 50
        `);

        res.json({
            weekly: daily.map(d => ({ day: d.day, revenue: parseFloat(d.revenue) })),
            monthly: monthly.map(m => ({ month: m.month, revenue: parseFloat(m.revenue) })),
            topVehicles: topVehicles.map(v => ({
                vehicle: { name: v.name, model: v.model },
                rentalCount: v.rentalCount,
                revenue: parseFloat(v.revenue)
            })),
            rentals: recentRentals
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats, getRevenueData };
