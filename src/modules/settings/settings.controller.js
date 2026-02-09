const pool = require('../../config/db');

const getSettings = async (req, res, next) => {
    try {
        const { key } = req.params;
        const [rows] = await pool.execute('SELECT setting_value FROM SystemSettings WHERE setting_key = ?', [key]);

        if (rows.length === 0) {
            // Return default structure if not found to avoid client crashes
            return res.json({});
        }

        let settingValue = rows[0].setting_value;
        // Parse if it's a string (which it should be from DB)
        if (typeof settingValue === 'string') {
            try {
                settingValue = JSON.parse(settingValue);
            } catch (e) {
                console.error('Failed to parse setting value:', e);
            }
        }

        res.json(settingValue);
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const { key } = req.params;
        const value = req.body;

        console.log(`Updating setting ${key}:`, value);

        if (!value) {
            return res.status(400).json({ message: 'Value is required' });
        }

        // Ensure value is stored as a JSON string
        // If value is an object, JSON.stringify it. If string, keep it?
        // Ideally we expect an object from frontend which express.json() parsed.
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

        await pool.execute(
            'INSERT INTO SystemSettings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, stringValue, stringValue]
        );

        res.json({ message: 'Settings updated successfully', key, value });
    } catch (error) {
        console.error('Update settings error:', error);
        next(error);
    }
};

const getAllSettings = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT setting_key, setting_value FROM SystemSettings');

        const defaultSettings = {
            security: {
                twoFactorAuth: false,
                biometricLogin: false,
                autoLock: true,
                lockTimeout: '5',
                dataEncryption: true
            },
            rental_rules: {
                insuranceRequired: true,
                minimumAge: 25,
                maxRentalDays: 30,
                depositRequired: true,
                defaultDeposit: 500,
                lateFeePerDay: 50,
                cancellationPolicy: '24 hours'
            },
            business_info: {
                name: 'Car Rental Management',
                address: '123 Business St, City',
                phone: '555-0000',
                email: 'info@carrental.com'
            },
            notifications: {
                rentalReminders: true,
                paymentDue: true,
                paymentReceived: true,
                emailNotifications: true
            },
            payment_methods: {
                cash: true,
                creditCard: true,
                bankTransfer: true
            }
        };

        const dbSettings = rows.reduce((acc, row) => {
            try {
                acc[row.setting_key] = typeof row.setting_value === 'string'
                    ? JSON.parse(row.setting_value)
                    : row.setting_value;
            } catch (e) {
                console.error(`Failed to parse setting ${row.setting_key}:`, e);
                acc[row.setting_key] = row.setting_value;
            }
            return acc;
        }, {});

        // Merge DB settings on top of defaults
        const finalSettings = { ...defaultSettings, ...dbSettings };

        res.json(finalSettings);
    } catch (error) {
        next(error);
    }
};

module.exports = { getSettings, updateSettings, getAllSettings };
