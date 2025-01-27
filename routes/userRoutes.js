const router=require('express').Router();
const userControllers=require('../controllers/userControllers');
const searchController = require("../controllers/searchController")

// Creating user API
router.post('/create',userControllers.createUser);

// login user api
router.post('/login', userControllers.loginUser)

// forgot password api
router.post('/forgot_password', userControllers.forgotPassword)

//

// verify
router.post('/verify_otp', userControllers.verifyOtpAndSetPassword)
router.post("/add_to_cart",userControllers.addToCart);
router.post("/remove_from_cart",userControllers.removeFromCart);
router.get("/get_cart/:id",userControllers.getCart)
router.get("/search",searchController.searchProducts);



// exporting
module.exports=router;