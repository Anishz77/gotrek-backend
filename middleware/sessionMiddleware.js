const logger = require('../utils/logger');

const sessionMiddleware = (req, res, next) => {
    // Track session activity
    if (req.session) {
        req.session.lastActive = new Date();
        
        // Log suspicious session activity
        if (!req.session.initialized) {
            req.session.initialized = true;
            req.session.userAgent = req.headers['user-agent'];
            req.session.ip = req.ip;
        } else if (
            req.session.userAgent !== req.headers['user-agent'] ||
            req.session.ip !== req.ip
        ) {
            logger.warn('Suspicious session activity detected', {
                sessionId: req.session.id,
                originalUserAgent: req.session.userAgent,
                currentUserAgent: req.headers['user-agent'],
                originalIp: req.session.ip,
                currentIp: req.ip
            });
        }

        // Clean old sessions periodically
        if (Math.random() < 0.01) { // 1% chance to clean on each request
            req.sessionStore.all((error, sessions) => {
                if (error) return;
                const now = new Date();
                sessions?.forEach(session => {
                    if (session.lastActive && 
                        (now - new Date(session.lastActive)) > (24 * 60 * 60 * 1000)) {
                        req.sessionStore.destroy(session.id);
                    }
                });
            });
        }
    }
    next();
};

module.exports = sessionMiddleware; 