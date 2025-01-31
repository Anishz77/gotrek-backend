const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    passwordLastChanged: {
        type: Date,
        default: Date.now
    },
    passwordExpiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    isAdmin : {
        type : Boolean,
        default : true
    },
    phone : {
        type : Number,
        required:true
    },
    otpReset : {
        type : Number,
        default : null
    },
    otpResetExpires : {
        type : Date,
        default : null
    },
    cart:[
        {
            product : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'products',
                required : true
            },
            quantity : {
                type : Number,
                default : 1
            }
        }
    ],
    loginAttempts: {
        type: Number,
        default: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: {
        type: Date,
        default: null
    }
})

// Add a method to check if password is expired
userSchema.methods.isPasswordExpired = function() {
    return Date.now() >= this.passwordExpiresAt;
};

// Add method to check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

const User=mongoose.model('users',userSchema)
module.exports = User;