const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'car', // Connect directly to the database
    multipleStatements: true
};

async function resetDatabaseTables() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL database "car"...');
        connection = await mysql.createConnection(dbConfig);

        console.log('🗑️ Dropping existing tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tables = [
            'admins', 'vehicles', 'customers', 'rentals', 'documents', 'maintenance', 'payments', 'settings',
            'SystemAdmins', 'Vehicles', 'Customers', 'Rentals', 'Documents', 'Maintenance', 'Payments' // Drop capitalized ones too if they exist
        ];

        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables dropped.');

        console.log('📄 Reading FRESH_DATABASE.sql...');
        const sqlPath = path.join(__dirname, 'FRESH_DATABASE.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Remove the database creation part to avoid permission errors
        // We assume the database 'car' already exists and we are connected to it
        sql = sql.replace(/DROP DATABASE IF EXISTS `car`;/g, '');
        sql = sql.replace(/CREATE DATABASE `car`[^;]*;/g, '');
        sql = sql.replace(/USE `car`;/g, '');

        console.log('🚀 Executing schema and seeds...');
        await connection.query(sql);

        console.log('✅ Database tables reset successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting tables:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

resetDatabaseTables();
