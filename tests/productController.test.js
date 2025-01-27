const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const productModel = require('../models/productModel');
const productController = require('../controllers/productControllers');
const fs = require('fs');

// Mock Mongoose methods
jest.mock('../models/productModel');

// Mock FileSystem methods
jest.mock('fs');

// Mock file upload middleware
jest.mock('express-fileupload', () => {
    return () => (req, res, next) => {
        req.files = {
            productImage: {
                name: 'test-image.jpg',
                mv: jest.fn().mockResolvedValue(true)
            }
        };
        next();
    };
});

// Initialize Express app and apply middleware
const app = express();
app.use(express.json());
app.use(require('express-fileupload')());

// Mock the routes for testing
app.post('/product', productController.createProduct);
app.get('/products', productController.getAllProducts);
app.get('/product/:id', productController.getProduct);
app.delete('/product/:id', productController.deleteProduct);
app.put('/product/:id', productController.updateProduct);
app.get('/products/paginate', productController.productPagination);

// Sample data for testing
const sampleProduct = {
    _id: new mongoose.Types.ObjectId(), // Corrected instantiation
    productName: "Sample Product",
    productPrice: 100,
    productCategory: "Sample Category",
    productDescription: "Sample Description",
    productImage: "sample-image.jpg"
};

describe('Product Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test createProduct function
    it('should create a new product', async () => {
        productModel.mockReturnValueOnce({
            save: jest.fn().mockResolvedValue(sampleProduct),
        });

        const res = await request(app)
            .post('/product')
            .send({
                productName: sampleProduct.productName,
                productPrice: sampleProduct.productPrice,
                productCategory: sampleProduct.productCategory,
                productDescription: sampleProduct.productDescription
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Created!");
        expect(res.body.data.productName).toBe(sampleProduct.productName);
    });

    // Test getAllProducts function
    it('should fetch all products', async () => {
        productModel.find.mockResolvedValueOnce([sampleProduct]);

        const res = await request(app).get('/products');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Products fetched successfully!");
        expect(res.body.products).toHaveLength(1);
    });

    // Test getProduct function
    it('should fetch a single product by ID', async () => {
        productModel.findById.mockResolvedValueOnce(sampleProduct);

        const res = await request(app).get(`/product/${sampleProduct._id}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).tobe("product Fetched!");
        expect(res.body.product.productName).tobe(sampleProduct.productName);
    });

    // Test deleteProduct function
    it('should delete a product by ID', async () => {
        productModel.findByIdAndDelete.mockResolvedValueOnce(sampleProduct);

        const res = await request(app).delete(`/product/${sampleProduct._id}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Deleted!");
    });

    // Test updateProduct function
    it('should update a product by ID', async () => {
        productModel.findById.mockResolvedValueOnce(sampleProduct);
        productModel.findByIdAndUpdate.mockResolvedValueOnce({
            ...sampleProduct,
            productName: "Updated Product"
        });

        const res = await request(app).put(`/product/${sampleProduct._id}`)
            .send({
                productName: "Updated Product"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Updated!");
        expect(res.body.updatedProduct.productName).toBe("Updated Product");
    });

    // Test productPagination function
    it('should fetch paginated products', async () => {
        productModel.find.mockResolvedValueOnce([sampleProduct]);

        const res = await request(app).get('/products/paginate?page=1');

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Product Fetched!");
        expect(res.body.products).toHaveLength(1);
    });
});
