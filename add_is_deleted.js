const pool = require('./src/config/db');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('--- Starting Migration: Add is_deleted ---');

        // Add is_deleted to vehicles if not exists
        try {
            await pool.execute('ALTER TABLE vehicles ADD COLUMN is_deleted TINYINT(1) DEFAULT 0');
            console.log('✅ Added is_deleted to vehicles table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ is_deleted column already exists in vehicles table');
            } else {
                throw e;
            }
        }

        // Add is_deleted to customers if not exists
        try {
            await pool.execute('ALTER TABLE customers ADD COLUMN is_deleted TINYINT(1) DEFAULT 0');
            console.log('✅ Added is_deleted to customers table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ is_deleted column already exists in customers table');
            } else {
                throw e;
            }
        }

        console.log('✅ Migration successful');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
