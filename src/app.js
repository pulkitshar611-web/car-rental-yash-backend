const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const customLogger = require('./middlewares/logger.middleware');

const app = express();

// Super Logging Middleware - MOVE TO TOP
app.use((req, res, next) => {
    console.log('--------------------------------------------------');
    console.log(`[INCOMING] ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    if (Object.keys(req.body || {}).length > 0) {
        const loggedBody = { ...req.body };
        if (loggedBody.password) loggedBody.password = '*****';
        console.log('[BODY]', JSON.stringify(loggedBody));
    }
    console.log('--------------------------------------------------');
    next();
});

// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false, // For local image access
}));

// CORS - Allow all origins for development
// CORS - Allow all origins for development
app.use(cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: true // Note: credentials: true with origin: '*' might cause issues in some browsers if strict, but let's try lax
}));

// General Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom API Logger - Logs every request with timestamp, method, URL, and body
app.use(customLogger);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Car Rental API is running'
    });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error Handling
app.use(errorHandler);

module.exports = app;
