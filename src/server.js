const app = require('./app');
const { PORT } = require('./config/env');
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const startServer = async () => {
    try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Created uploads directory');
        }

        // Test Database Connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database');
        connection.release();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('==========================================');
            console.log('🚀 Car Rental API Server Started');
            console.log('==========================================');
            console.log(`📍 Local:    http://localhost:${PORT}`);
            console.log(`📍 Network:  http://0.0.0.0:${PORT}`);
            console.log(`📍 Health:   http://localhost:${PORT}/health`);
            console.log('==========================================');
            console.log('👀 Watching for API requests...\n');
        });
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        console.error('💡 Make sure MySQL is running and credentials in .env are correct');
        process.exit(1);
    }
};

startServer();
