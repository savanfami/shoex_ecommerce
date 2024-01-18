const mongoose=require('mongoose')
require('dotenv').config()


const wishlistSchema=new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId},
    products:[{
    productId:{type:mongoose.Types.ObjectId,ref:'product'}
}],
   
})


const wishlist=mongoose.model('wishlist',wishlistSchema)
module.exports=wishlist