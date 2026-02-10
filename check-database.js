const pool = require('./src/config/db');

async function checkDatabase() {
    try {
        console.log('🔍 Checking database tables...\n');

        // Show all tables
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('📋 Tables in database:');
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${index + 1}. ${tableName}`);
        });

        console.log('\n🔍 Checking table structures...\n');

        // Check each expected table
        const expectedTables = ['SystemAdmins', 'Customers', 'Vehicles', 'Documents', 'Rentals', 'Payments'];

        for (const tableName of expectedTables) {
            try {
                const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                console.log(`✅ ${tableName}: ${rows[0].count} rows`);
            } catch (error) {
                console.log(`❌ ${tableName}: ${error.message}`);

                // Try lowercase
                try {
                    const lowerName = tableName.toLowerCase();
                    const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM \`${lowerName}\``);
                    console.log(`   ℹ️  Found as lowercase: ${lowerName} (${rows[0].count} rows)`);
                } catch (e) {
                    console.log(`   ❌ Not found in lowercase either`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();
