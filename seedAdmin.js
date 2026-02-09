const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const username = 'admin';
        const email = 'admin@car.com';
        const password = 'admin123';

        console.log(`Hashing password for ${username}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        console.log('Inserting admin into database...');
        const [result] = await pool.execute(
            'INSERT INTO systemadmins (username, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
            [username, email, hash, 'SUPER_ADMIN', hash]
        );

        console.log('Successfully seeded admin user!');
        console.log('Username: admin (or admin@car.com)');
        console.log('Password: 123456');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
