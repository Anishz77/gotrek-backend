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
        lowercase: true // Con//verts email to lowercase
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
    }
});

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);
module.exports = User; 