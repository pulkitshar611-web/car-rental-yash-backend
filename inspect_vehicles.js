const pool = require('./src/config/db');

async function checkSchema() {
    try {
        const [vehiclesRows] = await pool.execute('DESCRIBE Vehicles');
        console.log('VEHICLES COLUMNS:');
        vehiclesRows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
