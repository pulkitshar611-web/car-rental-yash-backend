const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testLogin() {
    try {
        console.log('--- Testing Login Logic ---');
        const username = 'admin';
        const password = 'admin123';

        const [users] = await pool.execute(
            'SELECT * FROM admins WHERE username = ? OR email = ?',
            [username, username]
        );

        console.log('User found:', users.length > 0);
        if (users.length > 0) {
            const user = users[0];
            console.log('User details:', { id: user.id, username: user.username, role: user.role });
            console.log('Has password_hash:', !!user.password_hash);

            const isMatch = await bcrypt.compare(password, user.password_hash);
            console.log('Password matches:', isMatch);

            if (isMatch) {
                const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    role: user.role
                }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '24h' });
                console.log('Token generated successfully');
            }
        } else {
            console.log('Admin user not found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error during test login:', error);
        process.exit(1);
    }
}

testLogin();
