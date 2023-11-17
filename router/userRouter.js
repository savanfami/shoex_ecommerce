const express=require('express')
const router=express.Router()
const userController=require('../controller/usercontroller')
const otpcontroller=require('../controller/otpcontroller')
const userAuth=require('../middleWares/userAuth')

router.get('/',userController.home)
router.get('/tologin',userController.tologin)
router.get('/tosignup',userController.toSignup)
router.post('/submit',userController.signup)
router.get('/user/home',userController.toUserHome)
router.post('/user/login',userAuth.existingUser,userController.userLogin)
router.get('/user/logout',userController.logout)








module.exports=router
