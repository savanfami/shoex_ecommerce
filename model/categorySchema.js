const mongoose=require('mongoose')
require('dotenv').config()

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:Boolean,
        default:true
    }
})


const category=mongoose.model('category',categorySchema)
module.exports=category