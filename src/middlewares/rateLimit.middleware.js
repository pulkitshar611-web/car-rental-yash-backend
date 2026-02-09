const rateLimit = require('express-rate-limit');

const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const qrBookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 booking attempts per hour
    message: {
        message: 'Too many booking attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { publicApiLimiter, qrBookingLimiter };
