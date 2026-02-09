const pool = require('./src/config/db');

async function ensureColumns() {
    try {
        console.log("Start checking...");

        try {
            await pool.execute('ALTER TABLE Customers ADD COLUMN address TEXT AFTER email');
            console.log("Added address column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Address column already exists.");
            } else {
                console.error("Error adding address:", e.message);
            }
        }

        try {
            await pool.execute('ALTER TABLE Customers ADD COLUMN id_number VARCHAR(50) AFTER address');
            console.log("Added id_number column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("id_number column already exists.");
            } else {
                console.error("Error adding id_number:", e.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

ensureColumns();
