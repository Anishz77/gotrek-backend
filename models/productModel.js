const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // fields : NAME, PRICE, DESCRIPTION, IMAGE, CATEGORY
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: String,
        required: true,
        maxlength: 300,
    },
    productDescription: {
        type: String,
        required: true,
        maxlength: 300,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// exporting
const Products = mongoose.model('products', productSchema);
module.exports = Products;