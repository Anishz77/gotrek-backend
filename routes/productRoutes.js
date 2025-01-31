const router = require('express').Router();
const productControllers = require('../controllers/productControllers');
const { authGuard, adminGuard } = require('../middleware/authGuard');
const apiLimiter = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/get_all_products', productControllers.getAllProducts);

// Protected routes
router.get('/get_single_product/:id', authGuard, productControllers.getProduct);

// Admin routes
router.post('/create', adminGuard, productControllers.createProduct);
router.put('/update_product/:id', adminGuard, productControllers.updateProduct);
router.delete('/delete_product/:id', adminGuard, productControllers.deleteProduct);

// exporting
module.exports = router;