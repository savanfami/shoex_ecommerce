const mongoose=require('mongoose')
require('dotenv').config()


 const DBconnection=mongoose.connect(process.env.MONGO_URL,{})
    .then(()=>{
    }).catch((err)=>{
    console.log("not connected",err);
})

module.exports={
    DBconnection
}