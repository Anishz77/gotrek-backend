const router=require('express').Router()
const productControllers=require('../controllers/productControllers')
const searchController = require('../controllers/searchController');
const { authGuard, adminGuard } = require('../middleware/authGuard')

// Making a create user API
router.post('/create',productControllers.createProduct)

// fetching all
router.get('/get_all_products', productControllers.getAllProducts)

// fetching single product
router.get('/get_single_product/:id', authGuard, productControllers.getProduct)

// deleting Product
router.delete('/delete_product/:id',adminGuard, productControllers.deleteProduct)

// updating product
router.put('/update_product/:id',adminGuard, productControllers.updateProduct)

//




// exporting
module.exports=router;