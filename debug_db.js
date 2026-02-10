const pool = require('./src/config/db');

async function debugTables() {
    try {
        console.log('--- DATABASE TABLES ---');
        const [tables] = await pool.execute('SHOW TABLES');
        console.log(tables);

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\n--- Structure of ${tableName} ---`);
            const [columns] = await pool.execute(`DESCRIBE \`${tableName}\``);
            console.log(columns);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error debugging tables:', error);
        process.exit(1);
    }
}

debugTables();
