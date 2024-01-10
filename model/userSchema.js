const mongoose=require('mongoose')
const { type } = require('os')
require('dotenv').config()


const userSchema=new mongoose.Schema({
    username:{ type:String},
    email:{type:String, unique:true },
    password:{ type:String,},
    phone:{type:Number},
    status:{type:Boolean, default:true},
    profilePhoto:{type:String},
    wallet:{
        balanceAmount:{type:Number,default:0},
        transactions:[{
            amount:{type:Number},
            transactionType:{type:String,enum:['debit','credit']},
            timestamp:{type:Date,default:Date.now},
            description:{type:String}
        }]
    },
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