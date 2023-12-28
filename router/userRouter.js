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

// router.get('/user/forgetPassword',userController.toForgotPassword)

//router for product details

router.get('/user-productDetails/:id',userAuth.verifyUser,userController.getProductDetails)
router.get('/user-productDetailshome/:id',userController.getProductDetailshome)
router.get('/user-viewallProduct',userAuth.verifyUser,userController.viewallProduct)
router.get('/user-viewallProducthome',userController.viewallProducthome)


//route for userprofile

router.get('/user-profile',userAuth.verifyUser,userController.touserProfile)
router.post('/user-editProfile/:id',userController.usereditProfile)
router.get('/user-manageAddress',userAuth.verifyUser,userController.manageAddress)
router.post('/user-addAddress',userController.addAddress)
router.post('/user-editAddress/:id',userController.editAddress)
router.post('/user-deleteAddress/:id',userController.deleteAddress)
router.post('/user-profileImage',upload.single('profileimage'),userController.editprofileImage)
router.post('/user-changePassword',userController.changePassword)


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
router.get('/user-orders',userAuth.verifyUser,orderController.toOrderlisting)
router.get('/user-orderDetails/:id',userAuth.verifyUser,orderController.orderDetails)
module.exports=router
