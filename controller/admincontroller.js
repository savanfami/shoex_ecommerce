const { use } = require("../router/adminRouter");
const user = require('../model/userSchema')
const category = require('../model/categorySchema')
const product = require('../model/productSchema');
const { trusted, default: mongoose } = require("mongoose");
const order = require('../model/orderSchema');
const users = require('../model/userSchema')
const fs = require('fs')
const path = require('path');
const { ObjectId } = require("mongodb");
const orders = require("../model/orderSchema");




//get of admin login
const toadminLogin = (req, res) => {
    try {
        res.render('./admin/adminlogin')

    } catch (err) {
        console.error(err)
    }
}

//get for admindashboard

const toDashboard = async (req, res) => {
    try {
        res.render('./admin/adminDash')
    } catch (err) {
        console.error(err)
    }
}

//post of admin login

const adminLogin = (req, res) => {
    try {
        const credentials = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        }

        if (req.body.email == credentials.email && req.body.password == credentials.password) {
            req.session.email = req.body.email;
            req.session.adminlogged = true;
            req.session.password = req.body.password
            res.status(200).json({ success: true })
        } else {
            res.json({ success: false, error: "invalid username or password" });
        }
    } catch (err) {
        console.log(err);
    }
}
//adminlogout

const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (err) {
        console.log(err);
    }
}

//get for usermanagement

const usermanagement = async (req, res) => {
    try {

        var i = 0
        const userData = await user.find().sort({ username: 1, email: 1, status: 1 })
        res.render('./admin/userManagement', { userData, i })

    } catch (err) {
        console.error(err)
    }
}

//post method for userblock
const userBlock = async (req, res) => {
    try {
        const id = req.params.id
        const block = await user.updateOne({ _id: id }, { $set: { status: false } })
        return res.redirect('/admin/manageUser')

    } catch (err) {
        console.error(err)
    }
}

//post method for userblock
const unBlock = async (req, res) => {
    try {
        const id = req.params.id
        const block = await user.updateOne({ _id: id }, { $set: { status: true } })
        return res.redirect('/admin/manageUser')

    } catch (err) {
        console.error(err)
    }
}



//............................................PRODUCT..............................................>>>>>>>>>>>>>>>>>


//get for manageProduct
const manageProduct = async (req, res) => {
    try {
        var i = 0
        const productData = await product.find().sort({ name: 1 })
        res.render('./admin/manageProduct', { productData, i })

    } catch (err) {
        console.error(err)
    }
}

//get for addProduct

const toaddProduct = async (req, res) => {
    try {

        const categoryData = await category.find({ status: true })
        res.render('./admin/addProduct', { categoryData })

    } catch (err) {
        console.error(err)
    }
}

//post for addProduct

const addProduct = async (req, res) => {
    try {
        const { name, brand, category, description, price, color } = req.body
        const existingProduct = await product.findOne({ name: name })
        if (existingProduct) {
            res.redirect('/admin/toadd-Product?message=productalreadyexist')
        } else {


            //  const allfiles = req.files?req.files.filename:undefined
            let Obj = []
            for (let i = 0; i < req.body.variant.size.length; i++) {
                Obj.push({
                    size: req.body.variant.size[i],
                    quantity: req.body.variant.quantity[i]
                })
            }

            const images = req.files;

            console.log(images);
            const allImage = [].concat(...Object.values(images).map(arr => arr.map(file => file.filename)));
            // console.log(allImage);

            const newProduct = await product.create({
                name,
                brand,
                category,
                description,
                price,
                color,
                images: allImage,
                variant: Obj

            })

            if (newProduct) {
                console.log("product added");
                res.redirect('/admin/manage-Product?message=successfull')
            }
        }
    } catch (err) {
        console.log(err);
    }
}

//GET FOR EDIT PRODUCT

const editProduct = async (req, res) => {
    try {

        const id = req.params.id
        const productData = await product.findOne({ _id: id })
        const variant = productData.variant
        const categoryData = await category.find({ status: true }, { name: 1 })
        res.render('./admin/editProduct', { productData, categoryData, variant })

    } catch (err) {
        console.error(err)
    }

}



//post for after edit product

const afterEditProduct = async (req, res) => {
    try {
        const id = req.params.id
        const productDetails = req.body
        console.log("product details", productDetails);
        const files = req.files
        let Obj = []
        for (let i = 0; i < req.body.variant.size.length; i++) {
            Obj.push({
                size: req.body.variant.size[i],
                quantity: req.body.variant.quantity[i]
            })
        }
        const productData = await product.findById(id)
        if (!productData) {
            console.log("data not found");

        }

        const oldImages = [...productData.images];
        console.log("before delte", oldImages, "old images arrayyyyyyyyyyyyyyyyyy");
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            brand: req.body.brand,
            color: req.body.color,
            category: req.body.category,
            variant: Obj,
            images: []
        }
        //handling main image
        if (files && files.mainImage) {
            updateData.images[0] = files.mainImage[0].filename
        } else {
            updateData.images[0] = productData.images[0]
        }
        // handle additional images
        for (let i = 1; i <= 4; i++) {
            const imageName = `image${i}`
            console.log(imageName, "image nameeeeeeeeeeeeeeee");

            if (files && files[imageName]) {
                updateData.images[i] = files[imageName][0].filename
            } else {
                updateData.images[i] = productData.images[i]
            }
        }

        //delete  old images from storage
        // console.log("upated data images",updateData.images);
        // const imageToDelete=oldImages.filter((oldimage)=>!updateData.images.includes(oldimage))
        // console.log(imageToDelete,"img to be deleted");
        // imageToDelete.forEach(async(imageName)=>{

        //     const imagePath='/productImages'+imageName
        //     console.log(imagePath,"iamge path");
        //     try{
        //         await fs.promises.unlink(imagePath)
        //         console.log(" old images deleted from storage");
        //     }catch(err){
        //         console.error("error deleting images ",err)
        //     }
        // })

        const uploaded = await product.updateOne({ _id: id }, { $set: updateData })
        console.log(updateData.images, "after delete");
        // console.log(uploaded,"jjjjjjjjjjjjjjjjjjjjjuppppppppppppppllllllllll");
        // console.log("uploadedddddddddddd", uploaded)
        if (uploaded) {
            // console.log("product Updated");
            res.redirect('/admin/manage-Product')

        } else {
            console.log("failed to update product");
        }
    } catch (err) {
        console.error(err);
    }
}

//post  for product block

const blockProduct = async (req, res) => {
    try {
        const id = req.params.id
        const block = await product.updateOne({ _id: id }, { $set: { status: false } })
        res.redirect('/admin/manage-Product')
    } catch (err) {
        console.log(err);
    }
}

//post for unblock block 

const unblockProduct = async (req, res) => {
    try {
        const id = req.params.id
        const block = await product.updateOne({ _id: id }, { $set: { status: true } })
        res.redirect('/admin/manage-Product')
    } catch (err) {
        console.error(err);
    }
}


//post for delete Product

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        const deleteProduct = await product.deleteOne({ _id: id })
        res.redirect('./admin/manage-Product')
    } catch (err) {
        console.log(err)
    }
}

const deleteimage = async (req, res) => {
    try {
        const id = req.params.id
        const imageIndex = req.params.index
        const productimage = await product.findById(id)
        if (!productimage) {
            res.status(404).json({ success: false, message: "prouduct not found" })
            return
        }
        var img = productimage.images.splice(imageIndex, 1);
        await productimage.save();
        res.status(200).json({ success: true, message: "image deleted successfully" })

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
}

//------------------------------------------------------------ORDER MANAGEMENT-------------------------------------------------------


const tomanageOrders = async (req, res) => {
    try {
        var i = 0
        const orderDatas = await order.find().populate({path:'userId', select:'username'}).populate({path:'items.productId'}).sort({ orderDate: -1 });
        console.log(orderDatas, "orderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        orderDatas.forEach(order => {
            order.items.forEach(item => {
                console.log(item, "orderdatasssssssss");
            });
        });
        res.render('./admin/orderlisting', { orderDatas, i, user })

    } catch (error) {
        console.error(error)
    }
}


const orderDetails=async(req,res)=>{
    try{
        const id=req.params.id
        console.log(id,"1111111111111111111111111111111");
        const orderData=await orders.find({_id:id})
        console.log(orderData,"orddddddddddddddddddddddddd");
        res.render('/admin/orderDetails',{orderData})

    }catch(error){
        console.error(error)
    }
}

module.exports = {
    toadminLogin,
    usermanagement,
    adminLogin,
    userBlock,
    unBlock,
    manageProduct,
    toaddProduct,
    addProduct,
    editProduct,
    afterEditProduct,
    blockProduct,
    unblockProduct,
    deleteProduct,
    adminLogout,
    deleteimage,
    toDashboard,
    tomanageOrders,
    orderDetails
}