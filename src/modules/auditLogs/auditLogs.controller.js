const pool = require('../../config/db');
const ExcelJS = require('exceljs');

const getAuditLogs = async (req, res, next) => {
    try {
        const [logs] = await pool.execute(`
      SELECT al.*, au.username 
      FROM AuditLogs al 
      LEFT JOIN SystemAdmins au ON al.user_id = au.id 
      ORDER BY al.created_at DESC
    `);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

const exportRentalReport = async (req, res, next) => {
    try {
        const [rentals] = await pool.execute(`
      SELECT r.id, c.name as customerName, v.name as vehicleName, r.startDate, r.endDate, r.totalAmount, r.status 
      FROM Rentals r 
      JOIN Customers c ON r.customerId = c.id 
      JOIN Vehicles v ON r.vehicleId = v.id
    `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rentals');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Customer', key: 'customerName', width: 25 },
            { header: 'Vehicle', key: 'vehicleName', width: 25 },
            { header: 'Start Date', key: 'startDate', width: 20 },
            { header: 'End Date', key: 'endDate', width: 20 },
            { header: 'Total Price', key: 'totalAmount', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        worksheet.addRows(rentals);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="rental_report.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

module.exports = { getAuditLogs, exportRentalReport };
