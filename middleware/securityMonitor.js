const logger = require('../utils/logger');

const securityMonitor = (req, res, next) => {
    // Log request details
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
    });

    // Monitor for suspicious patterns
    if (req.path.includes('../') || req.path.includes('..\\')) {
        logger.warn('Potential path traversal attempt', {
            path: req.path,
            ip: req.ip
        });
    }

    // Track response
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Log if response is slow or has error
        if (duration > 1000 || res.statusCode >= 400) {
            logger.warn('Request issue detected', {
                duration,
                statusCode: res.statusCode,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
        }
    });

    next();
};

module.exports = securityMonitor; 