const express=require('express')
const router=express.Router()
const adminController=require('../controller/admincontroller')
const categoryController=require('../controller/categorycontroller')
const adminAuth=require('../middleWares/adminAuth')
const upload=require('../middleWares/addCategory-multer')
const editmulter=require('../middleWares/editCategory-multer')

// routes for admin login
router.get('/',adminController.toadminLogin)
router.post('/login',adminController.adminLogin)

//route for user management
router.get('/manageUser',adminController.usermanagement)


//route for block and unblock user
router.post('/block/:id',adminController.userBlock)
router.post('/unblock/:id',adminController.unBlock)


//route for block and unblock user

router.post('/blockCategory/:id',adminController.blockCategory)
router.post('/unblockCategory/:id',adminController.UnblockCategory)

//routes for category
router.get('/manageCategory',categoryController.manageCategory)
router.get('/add/category',categoryController.toaddCategory)
router.post('/add/category',upload.single('image'),categoryController.addCategory)
router.get('/edit/category/:id',categoryController.editCategory)
router.post('/edit/category/:id',editmulter.single('image'),categoryController.afterEditCategory)


module.exports=router