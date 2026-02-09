const pool = require('./src/config/db');

async function migrateDocuments() {
    try {
        console.log("Starting migration...");

        // 1. Add customer_id column to Documents
        try {
            await pool.execute('ALTER TABLE Documents ADD COLUMN customer_id INT AFTER id');
            console.log("Added customer_id column.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e.message);
        }

        // 2. Make rental_id nullable
        try {
            await pool.execute('ALTER TABLE Documents MODIFY COLUMN rental_id INT NULL');
            console.log("Made rental_id nullable.");
        } catch (e) {
            console.error(e.message);
        }

        // 3. Add foreign key for customer_id
        try {
            await pool.execute('ALTER TABLE Documents ADD CONSTRAINT fk_document_customer FOREIGN KEY (customer_id) REFERENCES Customers(id)');
            console.log("Added foreign key for customer_id.");
        } catch (e) {
            if (e.code !== 'ER_DUP_KEY' && e.code !== 'ER_FK_DUP_NAME') console.error(e.message);
        }

        // 4. Update existing documents to populate customer_id from Rentals
        try {
            await pool.execute(`
                UPDATE Documents d
                JOIN Rentals r ON d.rental_id = r.id
                SET d.customer_id = r.customer_id
                WHERE d.customer_id IS NULL
            `);
            console.log("Backfilled customer_id from Rentals.");
        } catch (e) {
            console.error(e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateDocuments();
