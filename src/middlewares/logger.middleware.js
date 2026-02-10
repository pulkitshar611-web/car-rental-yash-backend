const morgan = require('morgan');

/**
 * Simple API Request Logger
 * Logs: [TIMESTAMP] METHOD URL STATUS TIME
 */

// Custom timestamp token
morgan.token('timestamp', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});

// Log body for debugging (careful with passwords!)
morgan.token('body', (req) => {
    const body = { ...req.body };
    if (body.password) body.password = '*****'; // Mask password
    return JSON.stringify(body).substring(0, 500); // Truncate
});

// Simple format without colors for compatibility
const logFormat = '[API] [:timestamp] :method :url :status :response-time ms - Body: :body';

module.exports = morgan(logFormat);
