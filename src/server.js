const app = require('./app');
const { PORT } = require('./config/env');
const pool = require('./config/db');

const startServer = async () => {
    try {
        // Test Database Connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database');
        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

startServer();
