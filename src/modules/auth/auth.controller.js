const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log(`[LOGIN] Attempt for username: ${username}`);

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Query the 'admins' table
        const [users] = await pool.execute(
            'SELECT * FROM admins WHERE username = ? OR email = ?',
            [username, username]
        );

        console.log(`[LOGIN] Users found: ${users.length}`);

        if (users.length === 0) {
            console.warn(`[LOGIN] FAILED: User "${username}" not found in database.`);
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`[LOGIN] Password match result: ${isMatch}`);

        if (!isMatch) {
            console.warn(`[LOGIN] FAILED: Incorrect password for user "${username}".`);
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role
        });

        console.log(`[LOGIN] Successful login for: ${username}`);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, phone, role, created_at FROM admins WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, email } = req.body;

        await pool.execute(
            'UPDATE admins SET full_name = ?, phone = ?, email = ? WHERE id = ?',
            [full_name, phone, email, userId]
        );

        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, phone, role, created_at FROM admins WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const [users] = await pool.execute('SELECT password_hash FROM admins WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await pool.execute(
            'UPDATE admins SET password_hash = ? WHERE id = ?',
            [passwordHash, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, getProfile, updateProfile, changePassword };
