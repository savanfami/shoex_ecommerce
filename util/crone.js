const crone=require('node-cron')
const product=require('../model/productSchema')
const offer=require('../model/categoryofferSchema')
const category=require('../model/categorySchema')

const checkOffer=async(req,res)=>{
    try{
        const currentDate=new Date()
        const offers=await offer.find({expiryDate:{$lt:currentDate}})
        // console.log('cron working....');
        if(offers.length>0){
            for(let off of offers){
                const categoryData=await category.findOne({name:off.categoryName})
                const categoryName=categoryData.name
                const productToupdate=await product.find({category:categoryName})
                productToupdate.forEach(async(data)=>{
                    const originalPrice=data.price
                    let discountedPrice = Math.round(originalPrice*(data.categoryoffer/100))
                    discountedPrice=originalPrice
                    await product.findByIdAndUpdate(data._id,{discountAmount:discountedPrice,$unset:{categoryoffer:1}})
                })
                await offer.findByIdAndDelete(off._id);
            }

        }
    }catch(err){
        console.error(err)
    
    }
}
crone.schedule("*/10 * * * * *", async () => {
  try {
    await checkOffer();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

module.exports=checkOffer