const { name } = require('ejs')
const category = require('../model/categorySchema')
const offer = require('../model/categoryofferSchema')
const product = require('../model/productSchema')
const productOffer = require('../model/productoffeschema')
const Promise = require('es6-promise').Promise;


const tooffer = async (req, res, next) => {
    try {
        const offerData = await offer.find()

        res.render('./admin/managecategoryOffer', { offerData })

    } catch (err) {
        console.error(err)
        next(err)
    }
}

//get for addOffer
const toaddOffer = async (req, res, next) => {
    try {
        const categoryData = await category.find({ status: true }, { _id: 1, name: 1 })

        res.render('./admin/addOffer', { categoryData })
    } catch (err) {
        console.error(err)
        next(err)
    }
}

//post for addOffer


const addOffer = async (req, res, next) => {
    try {
        const { categoryId, Percentage, startDate, endDate } = req.body
        const checkOffer = await offer.findOne({ categoryId })

        if (checkOffer) {
            return res.json({ success: false, message: "Offer already exist for this category" })
        }
        const categoryData = await category.findById({ _id: categoryId })
        const offerData = new offer({
            categoryId: categoryId,
            categoryName: categoryData.name,
            percentage: Percentage,
            startDate: startDate,
            expiryDate: endDate
        })
        await offerData.save()
        const productData = await product.find({ category: categoryData.name })
        const updatePromises = productData.map(async (products) => {
            if (products.offerType !== 'productOffer') {
                const originalPrice = products.price
                let discountPrice = Math.round(originalPrice * (Percentage / 100))
                discountPrice = originalPrice - discountPrice;
                products.discountAmount = discountPrice
                products.discountPercentage = Percentage
                products.isOffer = true,
                    products.offerType = 'categoryOffer'

                return products.save()
            } else {
                return Promise.resolve()
            }
        })
        await Promise.all(updatePromises);
        // for (let i = 0; i < productData.length; i++) {
        //     const originalPrice = productData[i].price
        //     let discountPrice = Math.round(originalPrice * (Percentage / 100))
        //     discountPrice = originalPrice - discountPrice;

        //     await product.findByIdAndUpdate(productData[i]._id, { discountAmount: discountPrice, categoryoffer: Percentage })
        // }
        res.json({ success: true, message: "offer addedd successfully" })
    } catch (err) {
        console.error(err)
        next(err)
    }
}


const deletCategoryOffer = async (req, res, next) => {
    try {
        const offerId = req.params.id
        const offerData = await offer.findById(offerId)
        const categoryname = offerData.categoryName
        const productData = await product.find({ category: categoryname })
        const updatePromises = productData.map(async (products) => {
            if (products.offerType = 'categoryOffer') {
                {
                    products.discountAmount = 0,
                        products.discountPercentage = 0,
                        products.isOffer = false,
                        products.offerType = 'none'

                    await products.save();
                }
            }
        })
        await Promise.all(updatePromises);
        await offer.findByIdAndDelete(offerId);
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (err) {
        console.error(err)
        next(err)
    }
}

const editOffer = async (req, res, next) => {
    try {
        const Id = req.params.id
        const categoryData = await category.find({ status: true })
        const offerData = await offer.findById({ _id: Id })
        res.render('./admin/editCategoryOffer', { offerData, categoryData })
    } catch (Err) {
        console.error(Err)
        next(Err)
    }
}

//put for edit category offer 
const editCategoryOffer = async (req, res, next) => {
    try {
        const { Percentage, startDate, endDate, catid } = req.body;

        const offerData = await offer.findByIdAndUpdate(
            { _id: catid },
            {
                $set: {
                    percentage: Percentage,
                    startDate,
                    expiryDate: endDate,
                },
            }
        );

        const productData = await product.find({ category: offerData.categoryName,offerType:'categoryOffer'});
            const updatepromise= productData.map(async(products)=>{
                if(products.offerType!=='productOffer'){
                    const originalPrice = products.price
                    let discountPrice = Math.round(originalPrice * (Percentage / 100))
                    discountPrice = originalPrice - discountPrice;
                    products.discountAmount = discountPrice
                    products.discountPercentage = Percentage
                    products.isOffer = true,
                        products.offerType = 'categoryOffer'
    
                    return products.save()
                }else{
                    return Promise.resolve()
                }
            })
            await Promise.all(updatepromise)
        console.log("offer updtaed");
        res.status(200).json({ success: true, message: "Category and associated products updated successfully" });
    } catch (err) {
        console.error(err);
        next(err);
    }
};



const manageproductOffer = async (req, res,next) => {
    try {
        let i = 0
        const productDatas = await product.find()
        res.render('./admin/productoffermanagement', { i, productDatas})

    } catch (err) {
        console.error(err)
        next(err)
    }
}

//add product offer
const addproductOffer = async (req, res, next) => {
    try {
        const { percentage, startDate, endDate, productName } = req.body;
        const checkOffer = await productOffer.findOne({ productName })

        if (checkOffer) {
            return res.json({ success: false, message: "Offer already exist for this product" })
        }
        const offerData = new productOffer({
            productName,
            startDate,
            expiryDate: endDate,
            offerpercentage: percentage
        })
        await offerData.save()
        const productData = await product.findOne({ name: productName })

        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const price = productData.price;
        const offerPrice = Math.round(((price) - ((price * parseFloat(percentage)) / 100)));

        const updatedData = await product.findOneAndUpdate(
            { name: productName },
            {
                discountAmount: offerPrice,
                discountPercentage: parseFloat(percentage),
                isOffer: true,
                offerType:'productOffer'
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Products offer updated successfully", offerData });
    } catch (err) {
        console.error(err);
        next(err);
    }
};



//get for addproduct offer

const addproductoffer = async (req, res, next) => {
    const productData = await product.find({ status: true })
    try {

        res.render('./admin/addproductoffer', { productData })

    } catch (err) {
        console.error(err)
        next(err)
    }

}


const deleteProductOffer = async (req, res,next) => {
    try {    
        const productofferData = await productOffer.findOne({productName:req.body.productName})
        if(!productofferData){
            return res.status(404).json({success:false,message:"no offer found"})
        }
        const productData = await product.findOne({name:productofferData.productName})
        const price = productData.price;
        if(productData){
        const categoryOffer=await offer.findOne({categoryName:productData.category})
        if(categoryOffer){
            console.log("if worked");
            const price=productData.price
            const percentage=categoryOffer.percentage
            let discountPrice = Math.round(price * (percentage / 100))
            discountPrice = price - discountPrice;

            productData.discountAmount=discountPrice,
            productData.discountPercentage=percentage
            productData.isOffer=true,
            productData.offerType='categoryOffer'
        await productData.save()
        }else{
            console.log("else workded");
            productData.discountAmount=0
            productData.discountPercentage=0
            productData.isOffer=false
            productData.offerType='none'
            await productData.save()
        }
        }
        await productOffer.findOneAndDelete({productName:req.body.productName});
        console.log("deleted successfull");
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (err) {
        console.error(err)
        next(err)
    }
}

//get for edit productOffer
const editProductOffer=async(req,res,next)=>{
    try{
        const name=req.params.name
        const offerData=await productOffer.findOne({productName:name})
        console.log(offerData,"offf");
        res.render('./admin/editProductoffer',{offerData})

    }catch(err){
        console.error(err)
            next(err)
        
    }
}

//patch for editProductOffer

const editproductoffer=async(req,res,next)=>{
    try{
        const productname=req.body.productName
        const percentage=req.body.percentage
        const startDate=req.body.startDate
        const endDate=req.body.endDate
        const updateproductOffer=await productOffer.findOneAndUpdate({productName:productname},{
            productName:productname,
            offerpercentage:percentage,
            startDate:startDate,
            expiryDate:endDate
        })
       if(!updateproductOffer){
        console.log("Product offer not found");
       }
       const productData=await product.findOne({name:productname})
       console.log(productData,"prododd");
       if(productData){
        console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
        const price=productData.price
        console.log(price);
        const Percentage=percentage
        console.log(percentage,"percentaa");
        let discountPrice = Math.round(price * (Percentage / 100))
        discountPrice = price - discountPrice;
        console.log(discountPrice,"ddd");
        productData.discountAmount=discountPrice,
        productData.discountPercentage=Percentage
        await productData.save()
       }
       console.log("data updated");
       res.status(200).json({success:true,message:"offer updated successfully"})

    }catch(err){

    }
}

module.exports = {
    tooffer,
    addOffer,
    toaddOffer,
    deletCategoryOffer,
    editOffer,
    editCategoryOffer,
    manageproductOffer,
    addproductOffer,
    addproductoffer,
    deleteProductOffer,
    editProductOffer,
    editproductoffer

}