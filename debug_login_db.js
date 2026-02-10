const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function debugLogin() {
    try {
        const username = 'admin';
        const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
        console.log('User found:', rows.length);
        if (rows.length > 0) {
            const user = rows[0];
            console.log('User ID:', user.id);
            console.log('Hash in DB:', user.password_hash);
            const isMatch = await bcrypt.compare('admin123', user.password_hash);
            console.log('Comparison with "admin123":', isMatch);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
debugLogin();
