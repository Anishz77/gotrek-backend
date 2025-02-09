const crypto = require('crypto');
const logger = require('./logger');

// Encryption key and IV from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES-256-CBC

const encryption = {
    // Encrypt data
    encrypt: (text) => {
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return iv.toString('hex') + ':' + encrypted.toString('hex');
        } catch (error) {
            logger.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    },

    // Decrypt data
    decrypt: (text) => {
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            logger.error('Decryption error:', error);
            throw new Error('Decryption failed');
        }
    },

    // Hash data (one-way encryption)
    hash: (text) => {
        try {
            return crypto
                .createHash('sha256')
                .update(text)
                .digest('hex');
        } catch (error) {
            logger.error('Hashing error:', error);
            throw new Error('Hashing failed');
        }
    }
};

module.exports = encryption; 