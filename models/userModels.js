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
    ]

})

const User=mongoose.model('users',userSchema)
module.exports = User;