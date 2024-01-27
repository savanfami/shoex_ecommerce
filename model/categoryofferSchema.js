const mongoose=require('mongoose')
const { schema } = require('./userSchema')
require('dotenv').config()

const offerSchema=new mongoose.Schema({

    categoryId:{type:String},
    categoryName:{type:String},
    percentage:{type:Number},
    startDate:{type:Date},
    expiryDate:{type:Date}
})

const categoryOffer=mongoose.model('offer',offerSchema)

module.exports=categoryOffer