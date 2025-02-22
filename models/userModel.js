const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true // Automatically removes whitespace
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Converts email to lowercase
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: {
        type: Date
    },
    paymentInfo: {
        cardNumber: {
            type: String,
            select: false  // Won't be returned in queries by default
        },
        cvv: {
            type: String,
            select: false
        },
        expiryDate: {
            type: String,
            select: false
        }
    }
});

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);
module.exports = User; 