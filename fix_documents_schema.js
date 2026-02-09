const pool = require('./src/config/db');

async function fixDocumentsSchema() {
    try {
        console.log("Start updating Documents table schema...");

        // 1. Add customer_id column
        try {
            await pool.execute('ALTER TABLE Documents ADD COLUMN customer_id INT NULL AFTER id');
            console.log("Added customer_id column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("customer_id column already exists.");
            } else {
                console.error("Error adding customer_id:", e.message);
            }
        }

        // 2. Add Foreign Key for customer_id
        try {
            await pool.execute('ALTER TABLE Documents ADD CONSTRAINT fk_document_customer FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE SET NULL');
            console.log("Added foreign key for customer_id.");
        } catch (e) {
            // Ignore if FK exists or other harmless errors for now
            console.log("Foreign key might already exist or error:", e.message);
        }


        // 3. Make rental_id nullable (MODIFY COLUMN)
        try {
            await pool.execute('ALTER TABLE Documents MODIFY COLUMN rental_id INT NULL');
            console.log("Made rental_id nullable.");
        } catch (e) {
            console.error("Error modifying rental_id:", e.message);
        }

        console.log("Documents table schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

fixDocumentsSchema();
