const pool = require('./src/config/db');

async function fixSchema() {
    try {
        console.log("Trying to add customer_id...");
        try {
            await pool.execute('ALTER TABLE Documents ADD COLUMN customer_id INT NULL');
            console.log("Added customer_id.");
        } catch (err) {
            console.log("customer_id add error (may exist):", err.message);
        }

        console.log("Trying to make rental_id nullable...");
        try {
            await pool.execute('ALTER TABLE Documents MODIFY COLUMN rental_id INT NULL');
            console.log("Made rental_id nullable.");
        } catch (err) {
            console.log("rental_id modify error:", err.message);
        }

        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixSchema();
