const mongoose=require('mongoose')
require('dotenv').config()


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    status:{
    type:Boolean,
    default:true        
    }


})

const user=mongoose.model('user',userSchema)
module.exports=user