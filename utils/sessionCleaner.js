const logger = require('./logger');

const cleanSessions = async (sessionStore) => {
    try {
        const sessions = await new Promise((resolve, reject) => {
            sessionStore.all((error, sessions) => {
                if (error) reject(error);
                else resolve(sessions);
            });
        });

        const now = new Date();
        let cleaned = 0;

        for (const session of sessions) {
            if (session.lastActive && 
                (now - new Date(session.lastActive)) > (24 * 60 * 60 * 1000)) {
                await new Promise((resolve) => {
                    sessionStore.destroy(session.id, resolve);
                });
                cleaned++;
            }
        }

        logger.info(`Session cleanup completed`, { 
            cleanedSessions: cleaned,
            totalSessions: sessions.length
        });
    } catch (error) {
        logger.error('Session cleanup error:', error);
    }
};

module.exports = cleanSessions; 