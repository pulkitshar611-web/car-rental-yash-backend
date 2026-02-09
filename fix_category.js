const pool = require('./src/config/db');

async function fixCategory() {
    try {
        console.log("Modifying category column to VARCHAR...");
        await pool.execute('ALTER TABLE Vehicles MODIFY COLUMN category VARCHAR(50) NOT NULL');
        console.log("Successfully modified category column.");
        process.exit(0);
    } catch (error) {
        console.error("Error modifying category:", error.message);
        process.exit(1);
    }
}

fixCategory();
