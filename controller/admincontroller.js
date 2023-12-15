const { use } = require("../router/adminRouter");
const user = require('../model/userSchema')
const category = require('../model/categorySchema')
const product = require('../model/productSchema');
const { trusted } = require("mongoose");
const fs=require('fs')
const path=require('path')

const credentials = {
    email: "shoexoff@gmail.com",
    password: "shoex123"
}

//get of admin login
const toadminLogin = (req, res) => {
    res.render('./admin/adminlogin')
}

//post of admin login

const adminLogin = (req, res) => {
    try {
        // console.log(req.body);
        if (req.body.email == credentials.email && req.body.password == credentials.password) {
            req.session.email = req.body.email;
            req.session.adminlogged = true;
            req.session.password = req.body.password
            res.render('./admin/adminDash')
        } else {
            res.render('./admin/adminlogin', { message: "incorrect username or password" })
        }
    } catch (err) {
        console.log(err);
    }
}
//adminlogout

const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.log(err);
    }
}

//get for usermanagement

const usermanagement = async (req, res) => {
    var i = 0
    const userData = await user.find().sort({ username: 1, email: 1, status: 1 })
    res.render('./admin/userManagement', { userData, i })
}

//post method for userblock
const userBlock = async (req, res) => {
    const id = req.params.id
    const block = await user.updateOne({ _id: id }, { $set: { status: false } })
    return res.redirect('/admin/manageUser')
}

//post method for userblock
const unBlock = async (req, res) => {
    const id = req.params.id
    const block = await user.updateOne({ _id: id }, { $set: { status: true } })
    return res.redirect('/admin/manageUser')
}



//............................................PRODUCT..............................................>>>>>>>>>>>>>>>>>


//get for manageProduct
const manageProduct = async (req, res) => {
    var i = 0
    const productData = await product.find().sort({ name: 1 })
    res.render('./admin/manageProduct', { productData, i })
}

//get for addProduct

const toaddProduct = async (req, res) => {
    const categoryData = await category.find({ status: true })
    res.render('./admin/addProduct', { categoryData })
}

//post for addProduct

const addProduct = async (req, res) => {
    try {
        const { name, brand, category, description, price, color } = req.body
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
    } catch (err) {
        console.log(err);
    }
}

//GET FOR EDIT PRODUCT

const editProduct = async (req, res) => {
    const id = req.params.id
    const productData = await product.findOne({ _id: id })
    const variant = productData.variant
    const categoryData = await category.find({ status: true }, { name: 1 })
    res.render('./admin/editProduct', { productData, categoryData, variant })

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
            if (files && files[imageName]) {
                updateData.images[i] = files[imageName][0].filename
            } else {
                updateData.images[i] = productData.images[i]
            }
        }
        const uploaded = await product.updateOne({ _id: id }, { $set: updateData })
        // console.log("uploadedddddddddddd", uploaded)
        if (uploaded) {
            // console.log("product Updated");
            res.redirect('/admin/manage-Product')

        } else {
            console.log("failed to update product");
        }
    } catch (err) {
        console.log(err);
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
        console.log(err);
    }
}


//post for delete Product

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        const deleteProduct = await product.deleteOne({ _id: id })
        res.redirect('/admin/manage-Product')
    } catch (err) {
        console.log(err)
    }
}

const deleteimage=async(req,res)=>{
    try{
        const id=req.params.id
        const imageIndex=req.params.index
        const productimage=await product.findById(id)
        // console.log(productimage,"ddddddddddddddddd");
        if(!productimage){
            res.status(404).json({success:false,message:"prouduct not found"})
            return
        }
        var img=productimage.images.splice(imageIndex, 1);
        // console.log(img,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
        await productimage.save();
        res.status(200).json({success:true,message:"image deleted successfully"})
    
    }catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({success:false,message:'Failed to delete image'});
    }
}


// const searchProduct=async(req,res)=>{
//     try{
//         // console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
//         const searchData=req.body?.search;
//         console.log(req.body);
//         // var i=0
//         const searchDatas=await product.find({name:{$regex:searchData.search,$options:"i"}})
//         res.render('./admin/manageProduct',{searchDatas})
//     }catch (err) {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//     }
// }

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
    // searchProduct
}