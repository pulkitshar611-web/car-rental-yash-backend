const pool = require('./src/config/db');

async function checkSchema() {
    try {
        const [rentalsRows] = await pool.execute('DESCRIBE Rentals');
        console.log('RENTALS_COLUMNS:' + JSON.stringify(rentalsRows.map(r => r.Field)));

        const [customersRows] = await pool.execute('DESCRIBE Customers');
        console.log('CUSTOMERS_COLUMNS:' + JSON.stringify(customersRows.map(r => r.Field)));

        const [vehiclesRows] = await pool.execute('DESCRIBE Vehicles');
        console.log('VEHICLES_COLUMNS:' + JSON.stringify(vehiclesRows.map(r => r.Field)));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
