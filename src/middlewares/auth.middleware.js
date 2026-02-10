const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`[AUTH] Authenticating request: ${req.method} ${req.url}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[AUTH] Authorization token missing or invalid format');
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        console.warn('[AUTH] Token verification failed for token:', token.substring(0, 15) + '...');
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    console.log('[AUTH] Token verified. User:', decoded.username, 'Role:', decoded.role);
    req.user = decoded;
    next();
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
