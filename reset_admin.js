const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const email = 'admin@example.com';

        console.log(`Resetting admin user: ${username} / ${password}`);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if exists
        const [users] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);

        if (users.length > 0) {
            console.log('Admin exists, updating password...');
            await pool.execute('UPDATE admins SET password_hash = ? WHERE username = ?', [passwordHash, username]);
            console.log('Password updated.');
        } else {
            console.log('Admin does not exist, creating...');
            await pool.execute(
                'INSERT INTO admins (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)',
                [username, email, passwordHash, 'SUPER_ADMIN', 'System Admin']
            );
            console.log('Admin created.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

resetAdmin();
