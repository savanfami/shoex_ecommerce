const mongoose=require('mongoose')
const { schema } = require('./userSchema')
require('dotenv').config()


const couponSchema=new mongoose.Schema({
    couponName:{type:String},
    couponCode:{type:String},
    minPurchaseAmount:{type:Number},
    discountAmount:{type:Number},
    couponType:{type:String},
    startDate:{type:Date},
    endDate:{type:Date}
})


const coupons=mongoose.model('coupon',couponSchema)

module.exports=coupons