const path = require('path')
const productModel = require('../models/productModel')
const fs = require('fs')

// Creating Product Function
const createProduct = async (req, res) => {
    // check incoming data
    console.log(req.body)
    console.log(req.files)

    // Destructuring
    const { productName, productPrice, productCategory, productDescription } = req.body;

    if (!productName || !productPrice || !productCategory || !productDescription) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    // check product image
    if (!req.files || !req.files.productImage) {
        return res.status(400).json({
            success: false,
            message: "Image not found!!"
        })
    }

    const { productImage } = req.files;

    // Uploading
    // 1. Generate unique name for each file
    const imageName = `${Date.now()}-${productImage.name}`;

    // 2.define specific path
    const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`)

    // 3. Upload to that path (await | trycatch)
    try {

        await productImage.mv(imageUploadPath)

        // save to database
        const newProduct = new productModel({
            productName: productName,
            productPrice: productPrice,
            productCategory: productCategory,
            productDescription: productDescription,
            productImage: imageName
        })

        const product = await newProduct.save()
        res.status(201).json({
            success: true,
            message: "Product Created!",
            data: product
        });

    } catch (error) {
        console.log(error)
        res.join({
            success: false,
            message: "Internal Server Error",
            error: error
        })
    }


}

// fetch all products
const getAllProducts = async (req, res) => {
    console.log("product hitted...")
    // #. Try catch
    try {
        // 1. Find all the products (Await)
        const products = await productModel.find({})
        // 2. Send response
        res.status(200).json({
            "success": true,
            "message": "Products fetched successfully!",
            "products": products
        })

    } catch (error) {
        console.log(error)
    }

}

// fetch single product
const getProduct = async (req, res) => {

    // recieve id from URL
    const productId = req.params.id;

    try {
        const product = await productModel.findById(productId)
        res.status(201).json({
            success: true,
            message: "product Fetched!",
            product: product
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "Server Error!"
        })

    }

}

// delete product
const deleteProduct = async (req, res) => {
    // get product id
    const productId = req.params.id;
    try {
        await productModel.findByIdAndDelete(productId)

        // fetch all products

        res.status(201).json({
            success: true,
            message: "Product Deleted!",
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


const updateProduct = async (req, res) => {

    try {

        // if there is files, upload new and delete old
        if (req.files && req.files.productImage) {


            // 1. Destructure file
            const { productImage } = req.files;


            // 1. Generate unique name for each file
            const imageName = `${Date.now()}-${productImage.name}`;

            // 2.define specific path
            const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`)

            // move to folder
            await productImage.mv(imageUploadPath)

            // replace productImage name to new name
            req.body.productImage = imageName;

            // Find product Information (We have only ID)
            const exiistingProduct = await productModel.findById(req.params.id)

            // Search that image in directory
            if(req.body.productImage){// if new image is uploaded, then only remove old image
                const oldImagePath = path.join(__dirname, `../public/products/${exiistingProduct.productImage}`)

                // delete from file system
                fs.unlinkSync(oldImagePath)

            }          
        }

          // update in database
          const updatedProduct = await productModel.findByIdAndUpdate(req.params.id,req.body)

          // send a response
          res.status(201).json({
              success : true,
              message : "Product Updated!",
              updatedProduct : updatedProduct
          })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        })

    }

}

// Pagination
const productPagination = async (req,res) => {


    // Result Per Page
    const resultPerPage = 2;

    // Page no (recieved from user)
    const pageNo = req.query.page;

    try{

        const products = await productModel.find({})
        .skip((pageNo-1) * resultPerPage)
        .limit(resultPerPage)

        // there is no product
        if(products.length == 0){
            return res.status(400).json({
                'success' : false,
                'message' : "No Product Found!"
            })
        }

        res.status(201).json({
            'success' : true,
            'message' : "Product Fetched!",
            'products' : products
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            'success' : false,
            'message' : "Server Error"
        })
    }
}


module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    productPagination
}