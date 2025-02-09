const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secure-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_CLOUDURL,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict'
    }
};

module.exports = sessionConfig; 