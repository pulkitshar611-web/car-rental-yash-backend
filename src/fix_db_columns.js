const pool = require('./config/db');

async function fixVehiclesTable() {
    try {
        console.log('Checking vehicles table for missing columns...');

        const columnsToAdd = [
            { name: 'weeklyPrice', type: 'DECIMAL(10, 2) DEFAULT NULL' },
            { name: 'monthlyPrice', type: 'DECIMAL(10, 2) DEFAULT NULL' },
            { name: 'deposit', type: 'DECIMAL(10, 2) DEFAULT NULL' }
        ];

        for (const col of columnsToAdd) {
            try {
                // Try to add column. If it exists, SQL might throw error, we catch it.
                // Alternatively, query information_schema to check existance.
                // But simple ADD COLUMN IF NOT EXISTS is cleaner if MySQL version supports it (MySQL 8.0+).
                // Or catch duplicate column name error.

                await pool.execute(`ALTER TABLE vehicles ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Added column: ${col.name}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Column already exists: ${col.name}`);
                } else {
                    console.error(`❌ Error adding column ${col.name}:`, err.message);
                }
            }
        }

        console.log('Database verification complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

fixVehiclesTable();
