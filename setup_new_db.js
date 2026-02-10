const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

const NEW_DB_NAME = process.env.DB_NAME || 'car_app_new_rental_v2';

async function setupNewDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);

        console.log(`🗑️ Dropping existing database "${NEW_DB_NAME}" if exists...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${NEW_DB_NAME}\``);

        console.log(`✨ Creating new database "${NEW_DB_NAME}"...`);
        await connection.query(`CREATE DATABASE \`${NEW_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        console.log(`➡️ Using database "${NEW_DB_NAME}"...`);
        await connection.query(`USE \`${NEW_DB_NAME}\``);

        console.log('📄 Reading FRESH_DATABASE.sql...');
        const sqlPath = path.join(__dirname, 'FRESH_DATABASE.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Remove the database creation part from SQL file to avoid conflicts
        // Also remove USE statement
        sql = sql.replace(/DROP DATABASE IF EXISTS `car`;/g, '');
        sql = sql.replace(/CREATE DATABASE `car`[^;]*;/g, '');
        sql = sql.replace(/USE `car`;/g, '');

        console.log('🚀 Executing schema and seeds...');
        await connection.query(sql);

        console.log(`✅ Database "${NEW_DB_NAME}" setup successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

setupNewDatabase();
