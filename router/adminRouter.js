const express=require('express')
const router=express.Router()
const adminController=require('../controller/admincontroller')

router.get('/',adminController.adminLogin)

router.get('/adminHome',adminController.sidebar)





module.exports=router