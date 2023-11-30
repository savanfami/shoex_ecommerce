const express=require('express')
const router=express.Router()
const adminController=require('../controller/admincontroller')
const categoryController=require('../controller/categorycontroller')
const adminAuth=require('../middleWares/adminAuth')
const upload=require('../middleWares/addCategory-multer')
const uploads=require('../middleWares/Product-multer')

 const uploadfields=[
    {name:"mainImage",maxCount:1},
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1},
    {name:"image4",maxCount:1},
]


// routes for admin login
router.get('/',adminController.toadminLogin)
router.post('/login',adminController.adminLogin)

//route for user management
router.get('/manageUser',adminController.usermanagement)


//route for block and unblock user
router.post('/block/:id',adminController.userBlock)
router.post('/unblock/:id',adminController.unBlock)


//route for block and unblock user

router.post('/blockCategory/:id',categoryController.blockCategory)
router.post('/unblockCategory/:id',categoryController.UnblockCategory)

//routes for category
router.get('/manageCategory',categoryController.manageCategory)
router.get('/add/category',categoryController.toaddCategory)
router.post('/add/category',upload.single('image'),categoryController.addCategory)
router.get('/edit/category/:id',categoryController.editCategory)
router.post('/edit/category/:id',upload.single('image'),categoryController.afterEditCategory)


//routes for product

router.get('/manage-Product',adminController.manageProduct)
router.get('/toadd-Product',adminController.toaddProduct)
router.post('/add-Product',uploads.fields(uploadfields),adminController.addProduct)
router.get('/edit-Product/:id',adminController.editProduct)
router.post('/edit-Product/:id',uploads.fields(uploadfields),adminController.afterEditProduct)
router.post('/block-Product/:id',adminController.blockProduct)
router.post('/unblock-Product/:id',adminController.unblockProduct)
router.get('/delete-Product/:id',adminController.deleteProduct)




module.exports=router