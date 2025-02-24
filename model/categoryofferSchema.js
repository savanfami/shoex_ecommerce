const mongoose=require('mongoose')
const { schema } = require('./userSchema')
require('dotenv').config()

const offerSchema=new mongoose.Schema({

    categoryId:{type:String},
    categoryName:{type:String},
    percentage:{type:Number},
    startDate:{type:Date},
    expiryDate:{type:Date},
    status:{type:Boolean,default:true}
})

const categoryOffer=mongoose.model('offer',offerSchema)

module.exports=categoryOffer