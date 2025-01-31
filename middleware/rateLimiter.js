const rateLimit = require('express-rate-limit');

// Login rate limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// API rate limiter - 100 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

module.exports = apiLimiter;