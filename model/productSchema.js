const mongoose=require('mongoose')
require('dotenv').config()

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    images:{
        type:Array,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number
    },
    discountAmount:{
        type:Number
    },
    isOffer:{type:Boolean},
    offerType:{type:String},
    isDeleted:{type:Boolean,default:false},
    variant: [{
        size: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }],
      status:{
        type:Boolean,
        default:true
    }},{
        timestamps:true

})

const product=mongoose.model('product',productSchema)

module.exports=product