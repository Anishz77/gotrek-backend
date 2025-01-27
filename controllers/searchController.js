const Product = require('../models/productModel');

// Search for products
const searchProducts = async (req, res) => {
  const searchQuery = req.query.q || "";

  try {
    const filter = {
      $or: [
        { productName: { $regex: searchQuery, $options: "i" } },
        { productDescription: { $regex: searchQuery, $options: "i" } },
        { productCategory: { $regex: searchQuery, $options: "i" } }
      ]
    };

    const products = await Product.find(filter);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully!",
      products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: "Server Error!",
      error: error.message
    });
  }
};

module.exports = {
  searchProducts
};

//
