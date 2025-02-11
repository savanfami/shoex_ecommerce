const express=require('express')
const router=express.Router()
const adminController=require('../controller/admincontroller')
const categoryController=require('../controller/categorycontroller')
const adminAuth=require('../middleWares/adminAuth')
const upload=require('../middleWares/addCategory-multer')
const uploads=require('../middleWares/Product-multer')
const couponController=require('../controller/coupon')
const offerController=require('../controller/offercontroller')
const dashboardController=require('../controller/dashboard')

 const uploadfields=[
    {name:"mainImage",maxCount:1},
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1},
    {name:"image4",maxCount:1},
]


// routes for admin login
router.get('/',adminAuth.existingAdmin,adminController.toadminLogin)
router.post('/login',adminAuth.existingAdmin,adminController.adminLogin)
router.get('/logout',adminController.adminLogout)
//route for user management
router.get('/manageUser',adminAuth.verifyAdmin,adminController.usermanagement)


//route for block and unblock user
router.post('/block/:id',adminController.userBlock)
router.post('/unblock/:id',adminController.unBlock)


//route for block and unblock user

router.post('/blockCategory/:id',adminAuth.verifyAdmin,categoryController.blockCategory)
router.post('/unblockCategory/:id',adminAuth.verifyAdmin,categoryController.UnblockCategory)

//routes for category
router.get('/manageCategory',adminAuth.verifyAdmin,categoryController.manageCategory)
router.get('/add/category',adminAuth.verifyAdmin,categoryController.toaddCategory)
router.post('/add/category',adminAuth.verifyAdmin,upload.single('image'),categoryController.addCategory)
router.get('/edit/category/:id',adminAuth.verifyAdmin,categoryController.editCategory)
router.post('/edit/category/:id',adminAuth.verifyAdmin,upload.single('image'),categoryController.afterEditCategory)


//routes for product

router.get('/manage-Product',adminAuth.verifyAdmin,adminController.manageProduct)
router.get('/toadd-Product',adminAuth.verifyAdmin,adminController.toaddProduct)
router.post('/add-Product',adminAuth.verifyAdmin,uploads.fields(uploadfields),adminController.addProduct)
router.get('/edit-Product/:id',adminAuth.verifyAdmin,adminController.editProduct)
router.post('/edit-Product/:id',adminAuth.verifyAdmin,uploads.fields(uploadfields),adminController.afterEditProduct)
router.post('/block-Product/:id',adminAuth.verifyAdmin,adminController.blockProduct)
router.post('/unblock-Product/:id',adminAuth.verifyAdmin,adminController.unblockProduct)
router.get('/delete-Product/:id',adminAuth.verifyAdmin,adminController.deleteProduct)
router.delete('/delete-image/:id/:index',adminAuth.verifyAdmin,adminController.deleteimage)

//routes for orders

router.get('/manageOrders',adminAuth.verifyAdmin,adminController.tomanageOrders)
router.get('/order-Details/:id',adminAuth.verifyAdmin,adminController.orderDetails)
router.put('/change-Orderstatus/:orderId',adminController.changeorderStatus)
router.get('/returned-Orders',adminAuth.verifyAdmin,adminController.toreturnOrders)
router.patch('/update-ReturnStatus/:orderId',adminAuth.verifyAdmin,adminController.updateReturnStatus)
router.get('/return-accepted',adminAuth.verifyAdmin,adminController.toreturnaccepted)
router.get('/return-rejected',adminAuth.verifyAdmin,adminController.toreturnrejecred)


//routes for coupon

router.get('/managecoupon',adminAuth.verifyAdmin,couponController.toCoupon)
router.get('/toaddcoupon',adminAuth.verifyAdmin,couponController.toaddCoupon)
router.post('/addcoupon',adminAuth.verifyAdmin,couponController.addCoupon)
router.get('/editcoupon/:id',adminAuth.verifyAdmin,couponController.editCoupon)
router.patch('/editcoupon',adminAuth.verifyAdmin,couponController.editdcoupon)
router.delete('/deletecoupon/:id',adminAuth.verifyAdmin,couponController.deleteCoupon)


//routes for categoryoffer

router.get('/manageOffer',adminAuth.verifyAdmin,offerController.tooffer)
router.get('/addOffer',adminAuth.verifyAdmin,offerController.toaddOffer)
router.post('/addOffer',adminAuth.verifyAdmin,offerController.addOffer)
router.delete('/deleteOffer/:id',adminAuth.verifyAdmin,offerController.deletCategoryOffer)
router.get('/editOffer/:id',adminAuth.verifyAdmin,offerController.editOffer)
router.put('/editOffer',adminAuth.verifyAdmin,offerController.editCategoryOffer)


//routes for productOffer

router.get('/manageproductoffer',adminAuth.verifyAdmin,offerController.manageproductOffer)
router.get('/addProductOffer',adminAuth.verifyAdmin,offerController.addproductoffer)
router.post('/addproductOffer',adminAuth.verifyAdmin,offerController.addproductOffer)
router.delete('/deleteproductOffer',adminAuth.verifyAdmin,offerController.deleteProductOffer)
router.get('/editproductOffer/:name',adminAuth.verifyAdmin,offerController.editProductOffer)
router.put('/editproductOffer',adminAuth.verifyAdmin,offerController.editproductoffer)
//routes for dashboard

router.get('/dashboard',adminAuth.verifyAdmin,adminController.toDashboard)
router.get('/latestOrders',adminAuth.verifyAdmin,dashboardController.getOrderandSellers)
router.get('/count-orders-by-day',adminAuth.verifyAdmin,dashboardController.salesReport)
router.get('/count-orders-by-month',adminAuth.verifyAdmin,dashboardController.salesReport)
router.get('/count-orders-by-year',adminAuth.verifyAdmin,dashboardController.salesReport)
router.post('/download-sales-report',adminAuth.verifyAdmin,dashboardController.genereatesalesReport)


module.exports=router