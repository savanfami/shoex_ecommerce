const express=require('express')
const router=express.Router()
const userController=require('../controller/usercontroller')
const userblock=require('../middleWares/userBlock')
const userAuth=require('../middleWares/userAuth')
const upload=require('../middleWares/profile-multer')
const cartController=require('../controller/cartcontroller')
const orderController=require('../controller/order')


// routes for home
router.get('/',userAuth.existingUser,userController.home)
router.get('/user/home',userAuth.verifyUser,userblock,userController.toUserHome)
router.get('/user/logout',userController.logout)

//route for login 
router.get('/tologin',userAuth.existingUser,userController.tologin)
router.post('/user/login',userAuth.existingUser,userController.userLogin)


//route for signup
router.get('/tosignup',userAuth.existingUser,userController.toSignup)
router.post('/submit',userAuth.existingUser,userController.signup)

//route for otp
router.get('/user/toOtp',userAuth.existingUser,userController.toOtp)
router.get('/user/otpSending',userAuth.existingUser,userController.otpSender)
router.post('/user/toOtp',userAuth.existingUser,userController.otpConformation)
router.get('/user/resendOtp',userAuth.existingUser,userController.otpSender)

//router for forget Password

router.get('/user/forgetPassword',userAuth.existingUser,userController.toForgotPassword)
router.post('/user/forgetPassword',userAuth.existingUser,userController.forgotPass)
router.post('/user/resetPassword',userAuth.existingUser,userController.resetPassword)
//router for product details

router.get('/user-productDetails/:id',userAuth.verifyUser,userController.getProductDetails)
router.get('/user-productDetailshome/:id',userController.getProductDetailshome)
router.get('/user-viewallProduct',userAuth.verifyUser,userController.viewallProduct)
router.get('/user-viewallProducthome',userController.viewallProducthome)
router.get('/user-categoryList/:categoryId',userAuth.verifyUser,userController.categoryList)
router.get('/user/filterProducts',userAuth.verifyUser,userController.filterProducts)
router.get('/user/searchProducts',userController.searchProduct)
//route for userprofile

router.get('/user-profile',userAuth.verifyUser,userController.touserProfile)
router.post('/user-editProfile/:id',userController.usereditProfile)
router.get('/user-manageAddress',userAuth.verifyUser,userController.manageAddress)
router.post('/user-addAddress',userController.addAddress)
router.post('/user-editAddress/:id',userController.editAddress)
router.post('/user-deleteAddress/:id',userController.deleteAddress)
router.post('/user-profileImage',upload.single('profileimage'),userController.editprofileImage)
router.post('/user-changePassword',userController.changePassword)
router.get('/user-wallet',userAuth.verifyUser,userController.toWallet)

//routes for wishlist
router.get('/user-wishlist',userAuth.verifyUser,userController.towishList)
router.post('/user-addToWishlist',userAuth.verifyUser,userController.wishlist)
router.delete('/user-removewishlist/:orderId',userAuth.verifyUser,userController.removeproduct)
//routes for cart
router.get('/user-addtoCart',userAuth.verifyUser,cartController.getaddtoCart)
router.post('/user-addtoCart',userAuth.verifyUser,cartController.addtoCart)
router.delete('/user-deletefromCart/:id',userAuth.verifyUser,cartController.deletefromCart)
router.post('/change-productQuantity',userAuth.verifyUser,cartController.changeQuantity)

//routes for checkout
router.get('/user-checkout',userAuth.verifyUser,cartController.checkout)
router.post('/user-Newaddress',userController.addnewAddress)

//router for order
router.get('/user-Orderconfirmation',userAuth.verifyUser,orderController.orderConfirmation)
router.post('/user-placeOrder',userAuth.verifyUser,orderController.placeOrder)
router.post('/verify-Payment',userAuth.verifyUser,orderController.verifyPayment)
router.get('/user-orders',userAuth.verifyUser,orderController.toOrderlisting)
router.get('/user-orderDetails/:id',userAuth.verifyUser,orderController.orderDetails)
router.patch('/user-cancelOrder/:orderId',orderController.usercancelOrder)
router.patch('/cancelOne-order',orderController.cancelOneOrder)
router.post('/downloadinvoice',userAuth.verifyUser,orderController.generateInvoices)
router.get('/downloadinvoice/:orderId',userAuth.verifyUser,orderController.downloadInvoice)
router.patch('/return-Order',userAuth.verifyUser,orderController.returnOrder)

//error page

module.exports=router
