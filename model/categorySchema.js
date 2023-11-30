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
    status:{
        type:Boolean,
        default:true
    }},{
        timestamps:true

})


const category=mongoose.model('category',categorySchema)
module.exports=category