const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const [users] = await pool.execute(
            'SELECT * FROM SystemAdmins WHERE (username = ? OR email = ?) AND deleted_at IS NULL',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, phone, address, role, created_at FROM SystemAdmins WHERE id = ?',
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
        const { full_name, email, phone, address } = req.body;

        // Check email uniqueness if changing
        if (email) {
            const [existing] = await pool.execute(
                'SELECT id FROM SystemAdmins WHERE email = ? AND id != ?',
                [email, userId]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        await pool.execute(
            'UPDATE SystemAdmins SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [full_name, email, phone, address, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        const [users] = await pool.execute('SELECT password_hash FROM SystemAdmins WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute('UPDATE SystemAdmins SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, getProfile, updateProfile, changePassword };
