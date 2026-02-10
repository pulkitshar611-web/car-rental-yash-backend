const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        console.log('DB_NAME:', process.env.DB_NAME);
        const [users] = await pool.execute('SELECT id, username, password_hash, role FROM admins');
        console.log('Admins in DB:', users);

        if (users.length > 0) {
            const match = await bcrypt.compare('admin123', users[0].password_hash);
            console.log('Password "admin123" matches first user:', match);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkAdmin();
