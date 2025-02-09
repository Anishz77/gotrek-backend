const userModel = require('../models/userModels');
const productModel = require("../models/productModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendOtp = require('../service/sendOtp');
const sanitizeInput = require('../utils/sanitize');
const validatePassword = require('../utils/passwordValidator');
const encryption = require('../utils/encryption');
const logger = require('../utils/logger');

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        if (!firstName || !lastName || !email || !password || !phone) {
            return res.json({
                success: false,
                message: "Please enter all fields!"
            });
        }

        // Validate password
        if (!validatePassword(password)) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User Already Exists!"
            });
        }

        const randomSalt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, randomSalt);

        // Create new user with isAdmin explicitly set to false
        const newUser = new userModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashPassword,
            phone: phone,
            isAdmin: false  // Explicitly set to false for new accounts
        });

        await newUser.save();

        res.json({
            success: true,
            message: "User Created Successfully!"
        });

    } catch (error) {
        logger.error('User creation error:', error);
        res.json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User Not Found!"
            });
        }

        // Check if account is locked
        if (user.isLocked && user.lockUntil > Date.now()) {
            return res.json({
                success: false,
                message: "Account is locked. Please try again later.",
                isLocked: true
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            user.loginAttempts += 1;
            
            if (user.loginAttempts >= 5) {
                user.isLocked = true;
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                await user.save();
                return res.json({
                    success: false,
                    message: "Account locked for 30 minutes due to too many failed attempts.",
                    isLocked: true
                });
            }

            await user.save();
            return res.json({
                success: false,
                message: "Invalid Password!",
                attemptsLeft: 5 - user.loginAttempts
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        );

        res.json({
            success: true,
            message: "Login Successful!",
            token: token,
            userData: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};

const forgotPassword = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400).json({
            'success': false,
            'message': 'Please provide phone number!'
        });
    }

    try {
        const user = await userModel.findOne({ phone: phone });
        if (!user) {
            return res.status(400).json({
                'success': false,
                'message': 'User Not Found!'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otpReset = otp;
        user.otpResetExpires = Date.now() + 3600000;
        await user.save();

        res.status(200).json({
            'success': true,
            'message': 'OTP Send Successfully!'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            'success': false,
            'message': 'Server Error!'
        });
    }
};

const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
        return res.status(400).json({
            'success': false,
            'message': 'Please provide all the details!'
        });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({
                'success': false,
                'message': 'User Not Found!'
            });
        }
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(400).json({
                'success': false,
                'message': 'Product Not Found!'
            });
        }
        cart = {
            product: productId,
            quantity: quantity,
        }

        user.cart.push(cart)
        await user.save();
        return res.status(200).json({
            'success': true,
            'message': 'Product added to  cart'
        });
    } catch (err) {
        return res.status(400).json({
            'success': false,
            'message': err
        })
    }

}

const getCart = async(req, res) => {
    try {
        const  userId  = req.params.id;
        if (!userId) {
            return res.status(400).json({
                'success': false,
                'message': 'Please provide user id!'
            });
        }
        const newUser = await userModel.findById(userId).populate("cart.product");
        const userCart = newUser.cart.filter((item)=> item.product!==null)
        const newUserCart = userCart.map((item)=> { return {product:item.product._id,quantity:item.quantity}});
        newUser.cart = newUserCart;
        await newUser.save()

        if (!newUser) {
            return res.status(400).json({
                'success': false,
                'message': 'User Not Found!'
            });
        }
        return res.status(200).json({
            success: true,
            cart: userCart
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err
        })

    }
}

const removeFromCart = async(req,res)=>{
    console.log(req.body);
    const {userId,productId} = req.body;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({
                'success': false,
                'message': 'User Not Found!'
            });
        }
        user.cart = user.cart.filter((element)=>element.product.toString()!==productId);
        await user.save();
        return res.status(200).json({
            success: true,
            message: "removed sucessfully"
        });
    } catch (error) {
        
    }

}


const verifyOtpAndSetPassword = async (req, res) => {
    // Implementation needed
};

const changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({
                "success": false,
                "message": "User not found"
            });
        }

        const randomSalt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, randomSalt);

        // Update password and reset expiration
        user.password = hashPassword;
        user.passwordLastChanged = new Date();
        user.passwordExpiresAt = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        await user.save();

        res.json({
            "success": true,
            "message": "Password updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            "success": false,
            "message": "Internal Server Error!"
        });
    }
};

// Add a method to unlock account manually if needed
const unlockAccount = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                "success": false,
                "message": "User not found"
            });
        }

        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await user.save();

        res.json({
            "success": true,
            "message": "Account unlocked successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({
            "success": false,
            "message": "Internal Server Error!"
        });
    }
};

// Example of encrypting sensitive data
const addPaymentInfo = async (req, res) => {
    try {
        const { userId, cardNumber, cvv } = req.body;

        // Encrypt sensitive data
        const encryptedCard = encryption.encrypt(cardNumber);
        const encryptedCVV = encryption.encrypt(cvv);

        const user = await userModel.findByIdAndUpdate(userId, {
            paymentInfo: {
                cardNumber: encryptedCard,
                cvv: encryptedCVV
            }
        });

        res.json({
            success: true,
            message: "Payment info added successfully"
        });
    } catch (error) {
        logger.error('Payment info error:', error);
        res.status(500).json({
            success: false,
            message: "Error adding payment info"
        });
    }
};

// Example of decrypting sensitive data
const getPaymentInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);

        if (!user || !user.paymentInfo) {
            return res.status(404).json({
                success: false,
                message: "Payment info not found"
            });
        }

        // Decrypt data for use
        const decryptedCard = encryption.decrypt(user.paymentInfo.cardNumber);
        // Only show last 4 digits
        const maskedCard = '*'.repeat(12) + decryptedCard.slice(-4);

        res.json({
            success: true,
            data: {
                cardNumber: maskedCard
            }
        });
    } catch (error) {
        logger.error('Payment info retrieval error:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving payment info"
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    forgotPassword,
    verifyOtpAndSetPassword,
    addToCart,getCart,
    removeFromCart,
    getCart,
    changePassword,
    unlockAccount,
    addPaymentInfo,
    getPaymentInfo
};
