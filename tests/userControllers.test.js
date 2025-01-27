const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModels');
const productModel = require("../models/productModel");
const userControllers = require('../controllers/userControllers');
const sendOtp = require('../service/sendOtp');

// Mock dependencies
jest.mock('../models/userModels');
jest.mock('../models/productModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../service/sendOtp');

// Initialize Express app and apply middleware
const app = express();
app.use(express.json());

// Mock the routes for testing
app.post('/user', userControllers.createUser);
app.post('/login', userControllers.loginUser);
app.post('/forgot-password', userControllers.forgotPassword);
app.post('/add-to-cart', userControllers.addToCart);
app.get('/cart/:id', userControllers.getCart);
app.post('/remove-from-cart', userControllers.removeFromCart);

// Sample data for testing
const sampleUser = {
    _id: new mongoose.Types.ObjectId(),
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "hashedpassword",
    phone: "1234567890",
    cart: []
};

const sampleProduct = {
    _id: new mongoose.Types.ObjectId(),
    productName: "Sample Product",
    productPrice: 100,
    productCategory: "Sample Category",
    productDescription: "Sample Description",
    productImage: "sample-image.jpg"
};

describe('User Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test createUser function
    it('should create a new user', async () => {
        userModel.findOne.mockResolvedValueOnce(null); // No existing user
        bcrypt.genSalt.mockResolvedValueOnce('randomSalt');
        bcrypt.hash.mockResolvedValueOnce('hashedpassword');
        userModel.mockImplementationOnce(() => ({
            save: jest.fn().mockResolvedValue(sampleUser)
        }));

        const res = await request(app)
            .post('/user')
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: "password",
                phone: "1234567890"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User Created Successfully!");
    });

    // Test loginUser function
    it('should login the user successfully', async () => {
        userModel.findOne.mockResolvedValueOnce(sampleUser); // User found
        bcrypt.compare.mockResolvedValueOnce(true); // Password matches
        jwt.sign.mockResolvedValueOnce('mockToken'); // Mock JWT token

        const res = await request(app)
            .post('/login')
            .send({
                email: "john.doe@example.com",
                password: "password"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Login Successful!");
        expect(res.body.token).toBe("mockToken");
    });

    // Test forgotPassword function
    it('should send an OTP for password reset', async () => {
        userModel.findOne.mockResolvedValueOnce(sampleUser); // User found
        sendOtp.mockResolvedValueOnce(true); // OTP sent successfully

        const res = await request(app)
            .post('/forgot-password')
            .send({
                phone: "1234567890"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("OTP Send Successfully!");
    });

    // Test addToCart function
    it('should add a product to the user\'s cart', async () => {
        userModel.findById.mockResolvedValueOnce(sampleUser);
        productModel.findById.mockResolvedValueOnce(sampleProduct);

        const res = await request(app)
            .post('/add-to-cart')
            .send({
                userId: sampleUser._id,
                productId: sampleProduct._id,
                quantity: 2
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product added to cart");
    });

    // Test getCart function
    it('should fetch the user\'s cart', async () => {
        userModel.findById.mockResolvedValueOnce({
            ...sampleUser,
            cart: [{ product: sampleProduct._id, quantity: 2 }]
        }).populate.mockReturnValueOnce({
            ...sampleUser,
            cart: [{ product: sampleProduct, quantity: 2 }]
        });

        const res = await request(app)
            .get(`/cart/${sampleUser._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.cart).toHaveLength(1);
    });

    // Test removeFromCart function
    it('should remove a product from the user\'s cart', async () => {
        userModel.findById.mockResolvedValueOnce({
            ...sampleUser,
            cart: [{ product: sampleProduct._id, quantity: 2 }]
        });

        const res = await request(app)
            .post('/remove-from-cart')
            .send({
                userId: sampleUser._id,
                productId: sampleProduct._id
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("removed successfully");
    });

});

