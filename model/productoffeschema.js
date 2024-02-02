const mongoose=require('mongoose')
const { schema } = require('./userSchema')
require('dotenv').config()

const offerSchema=new mongoose.Schema({

    productName:{type:String},
    offerpercentage:{type:Number},
    startDate:{type:Date},
    expiryDate:{type:Date},
    status:{type:Boolean,default:true}
})

const productOffer=mongoose.model('productoffer',offerSchema)

module.exports=productOffer