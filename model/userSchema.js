const mongoose=require('mongoose')
require('dotenv').config()


const userSchema=new mongoose.Schema({
    username:{ type:String},
    email:{type:String, unique:true },
    password:{ type:String,},
    phone:{type:Number},
    status:{type:Boolean, default:true},
    profilePhoto:{type:String},
    address:[{
        name:{type:String},
        address:{type:String},
        city:{type:String},
        state:{type:String},
        pincode:{type:String},
        phone:{type:Number}
}]

})

const user=mongoose.model('user',userSchema)
module.exports=user