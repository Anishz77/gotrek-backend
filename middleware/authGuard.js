const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const authGuard = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            logger.warn('Auth failed: No token', { ip: req.ip, path: req.path });
            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Auth error', { 
            error: error.message, 
            ip: req.ip, 
            path: req.path 
        });
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}

// Admin Guard

const adminGuard = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            logger.warn('Admin auth failed: No token', { ip: req.ip, path: req.path });
            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.isAdmin) {
            logger.warn('Admin access denied', { 
                userId: decoded.id, 
                ip: req.ip, 
                path: req.path 
            });
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Admin auth error', { 
            error: error.message, 
            ip: req.ip, 
            path: req.path 
        });
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = {
    authGuard,
    adminGuard
}