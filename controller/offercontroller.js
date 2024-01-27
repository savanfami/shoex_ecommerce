const { name } = require('ejs')
const category=require('../model/categorySchema')
const offer=require('../model/categoryofferSchema')
const product=require('../model/productSchema')


const tooffer=async(req,res,next)=>{
    try{
        const offerData=await offer.find()
       
        res.render('./admin/managecategoryOffer',{offerData})

    }catch(err){
        console.error(err)
        next(err)
    }
}

//get for addOffer
const toaddOffer=async(req,res,next)=>{
    try{
        const categoryData=await category.find({status:true},{_id:1,name:1})
        
        res.render('./admin/addOffer',{categoryData})
    }catch(err){
        console.error(err)
        next(err)
    }
}

//post for addOffer


const addOffer=async(req,res,next)=>{
    try{
        const{categoryId,Percentage,startDate,endDate}=req.body
        const checkOffer=await offer.findOne({categoryId})
        if(checkOffer){
            return res.json({success:false,message:"Offer already exist for this category"})
        }
        const categoryData=await category.findById({_id:categoryId})
        const offerData=new offer({
            categoryId:categoryId,
            categoryName:categoryData.name,
            percentage:Percentage,
            startDate:startDate,
            expiryDate:endDate
        })
        await offerData.save()

        const productData=await product.find({category:categoryData.name})
        for(let i=0;i<productData.length;i++){
            const originalPrice=productData[i].price
            let discountPrice=Math.round(originalPrice*(Percentage/100))
            discountPrice=originalPrice-discountPrice;
            
            await product.findByIdAndUpdate(productData[i]._id,{discountAmount:discountPrice,categoryoffer:Percentage})
        }
        res.json({success:true,message:"offer addedd successfully"})
    }catch(err){
        console.error(err)
        next(err)
    }
}


const deleteOffer=async(req,res,next)=>{
    try{
        const offerId=req.params.id
        const offerData=await offer.findById(offerId)
        const categoryname=offerData.categoryName
        const productData=await product.find({category:categoryname})
        await Promise.all(productData.map(async (data) => {
            const originalPrice = data.price;
            let discountedPrice = Math.round(originalPrice*(data.categoryoffer/100))
            discountedPrice=originalPrice
            await product.findByIdAndUpdate(data._id, 
                { $set: { discountAmount: discountedPrice }, $unset: { categoryoffer: 1 } },
                { new: true }
            );
        }));
        await offer.findByIdAndDelete(offerId);
        res.json({ success: true, message: 'Offer deleted successfully' });
    }catch(err){
        console.error(err)
        next(err)
    }
}
module.exports={
    tooffer,
    addOffer,
    toaddOffer,
    deleteOffer
}