const express=require('express')
const router=express.Router()
const userController=require('../controller/usercontroller')
// const otpcontroller=require('../controller/otpcontroller')
const userAuth=require('../middleWares/userAuth')

// routes for home
router.get('/',userController.home)
router.get('/user/home',userController.toUserHome)
router.get('/user/logout',userController.logout)

//route for login 
router.get('/tologin',userController.tologin)
router.post('/user/login',userController.userLogin)


//route for signup
router.get('/tosignup',userController.toSignup)
router.post('/submit',userController.signup)

//route for otp
router.get('/user/toOtp',userController.toOtp)
router.get('/user/otpSending',userController.otpSender)
router.post('/user/toOtp',userController.otpConformation)
router.get('/user/resendOtp',userController.resendOtp)

//router for forget Password

// router.get('/user/forgetPassword',userController.toForgotPassword)

module.exports=router
